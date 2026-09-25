import { StringDecoder } from 'node:string_decoder';

// Keep useful startup and terminal evidence below the 1 MiB report limit.
// Each pipe decodes independently; streams are merged in observed arrival order.
export class BoundedLog {
  constructor(headLimit = 128 * 1024, tailLimit = 768 * 1024) {
    this.headLimit = headLimit; this.tailLimit = tailLimit;
    this.head = Buffer.alloc(0); this.tail = Buffer.alloc(0); this.total = 0;
    this.decoders = { stdout: new StringDecoder('utf8'), stderr: new StringDecoder('utf8') };
    this.bytes = { stdout: 0, stderr: 0 };
  }
  write(stream, chunk) {
    this.bytes[stream] += chunk.length;
    this.append(this.decoders[stream].write(chunk));
  }
  append(text) {
    let bytes = Buffer.from(text); this.total += bytes.length;
    const headBytes = Math.min(this.headLimit - this.head.length, bytes.length);
    if (headBytes) { this.head = Buffer.concat([this.head, bytes.subarray(0, headBytes)]); bytes = bytes.subarray(headBytes); }
    if (bytes.length >= this.tailLimit) this.tail = Buffer.from(bytes.subarray(bytes.length - this.tailLimit));
    else if (bytes.length) this.tail = Buffer.concat([this.tail.subarray(Math.max(0, this.tail.length + bytes.length - this.tailLimit)), bytes]);
  }
  finish({ code, signal = null }) {
    for (const decoder of Object.values(this.decoders)) this.append(decoder.end());
    let omitted = this.total - this.head.length - this.tail.length, body;
    if (!omitted) body = Buffer.concat([this.head, this.tail]).toString('utf8');
    else {
      // Do not manufacture replacement characters at truncation boundaries.
      const head = new StringDecoder('utf8').write(this.head);
      let start = 0; while ((this.tail[start] & 0xc0) === 0x80) start++;
      const tail = this.tail.subarray(start).toString('utf8');
      omitted = this.total - Buffer.byteLength(head) - Buffer.byteLength(tail);
      body = `${head}\n[log truncated: ${omitted} UTF-8 bytes omitted; terminal output follows]\n${tail}`;
    }
    return `${body}\n[factory process exit: code=${code ?? 'none'} signal=${signal ?? 'none'}; stdout=${this.bytes.stdout} bytes stderr=${this.bytes.stderr} bytes; omitted=${omitted} bytes]\n`;
  }
}
