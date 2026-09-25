export function projectIdentity(repo) {
  if (typeof repo !== "string") return undefined;
  const path = repo.trim();
  if (!path) return undefined;

  const parts = path.split(/[\\/]+/).filter(Boolean);
  const name = parts.at(-1);
  if (!name || name === "." || name === ".." || /^[a-z]:$/i.test(name)) return undefined;

  return { name, path };
}

export function repositoryLabel(repository, identity) {
  if (repository !== "app") return repository;
  return identity?.name || "Project identity unavailable";
}
