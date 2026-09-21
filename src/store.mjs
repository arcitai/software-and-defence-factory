import { DatabaseSync } from "node:sqlite";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { Fault } from "./domain.mjs";

export class Store {
  constructor(path) {
    if (path !== ":memory:")
      mkdirSync(dirname(path), { recursive: true, mode: 0o700 });
    this.db = new DatabaseSync(path);
    this.db.exec(
      "PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000; CREATE TABLE IF NOT EXISTS tasks(id TEXT PRIMARY KEY, data TEXT NOT NULL); CREATE TABLE IF NOT EXISTS deliveries(id TEXT PRIMARY KEY); CREATE TABLE IF NOT EXISTS metadata(key TEXT PRIMARY KEY, data TEXT NOT NULL); CREATE TABLE IF NOT EXISTS evaluations(id TEXT PRIMARY KEY, data TEXT NOT NULL);",
    );
  }
  all() {
    return this.db
      .prepare("SELECT data FROM tasks ORDER BY rowid DESC")
      .all()
      .map((r) => JSON.parse(r.data));
  }
  get(id) {
    const row = this.db.prepare("SELECT data FROM tasks WHERE id=?").get(id);
    if (!row) throw new Fault("Opgaven findes ikke.", 404);
    return JSON.parse(row.data);
  }
  insert(task) {
    this.db
      .prepare("INSERT INTO tasks(id,data) VALUES (?,?)")
      .run(task.id, JSON.stringify(task));
    return task;
  }
  save(task) {
    this.db
      .prepare("UPDATE tasks SET data=? WHERE id=?")
      .run(JSON.stringify(task), task.id);
    return task;
  }
  transaction(fn) {
    this.db.exec("BEGIN IMMEDIATE");
    try {
      const result = fn();
      this.db.exec("COMMIT");
      return result;
    } catch (error) {
      this.db.exec("ROLLBACK");
      throw error;
    }
  }
  mutate(id, revision, fn) {
    return this.transaction(() => {
      const task = this.get(id);
      if (task.revision !== revision)
        throw new Fault("Opgaven er ændret. Opdatér visningen.", 409);
      fn(task);
      return this.save(task);
    });
  }
  delivery(id, fn) {
    return this.transaction(() => {
      if (this.db.prepare("SELECT id FROM deliveries WHERE id=?").get(id))
        return { duplicate: true };
      const result = fn();
      this.db.prepare("INSERT INTO deliveries VALUES (?)").run(id);
      return result;
    });
  }
  metadata(key) {
    const row = this.db
      .prepare("SELECT data FROM metadata WHERE key=?")
      .get(key);
    return row ? JSON.parse(row.data) : null;
  }
  setMetadata(key, value) {
    this.db
      .prepare(
        "INSERT INTO metadata VALUES (?,?) ON CONFLICT(key) DO UPDATE SET data=excluded.data",
      )
      .run(key, JSON.stringify(value));
  }
  evaluations() {
    return this.db
      .prepare("SELECT data FROM evaluations ORDER BY rowid")
      .all()
      .map((r) => JSON.parse(r.data));
  }
  insertEvaluation(result) {
    const prior = this.evaluations().find(
      (r) =>
        r.configuration === result.configuration &&
        r.inputDigest === result.inputDigest,
    );
    if (
      prior &&
      ["model", "harness", "environment"].some((k) => prior[k] !== result[k])
    )
      throw new Fault(
        "Samme konfigurationsnavn må ikke blande modeller, harness eller miljøer.",
        409,
      );
    if (this.db.prepare("SELECT id FROM evaluations WHERE id=?").get(result.id))
      throw new Fault("Denne evalueringskørsel findes allerede.", 409);
    this.db
      .prepare("INSERT INTO evaluations VALUES (?,?)")
      .run(result.id, JSON.stringify(result));
  }
  close() {
    this.db.close();
  }
}
