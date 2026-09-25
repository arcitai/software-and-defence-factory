import test from 'node:test';
import assert from 'node:assert/strict';
import { BoundedLog } from '../factory/bounded-log.mjs';

test('oversized streams retain startup and terminal failure with bounded output', () => {
  const log=new BoundedLog();
  log.write('stdout',Buffer.from('START diagnostic\n'));
  log.write('stdout',Buffer.from('x'.repeat(3*1024*1024)));
  log.write('stderr',Buffer.from('\nTERMINAL FAILURE: adapter exhausted context\n'));
  const output=log.finish({code:17});
  assert(Buffer.byteLength(output)<1024*1024);
  assert.match(output,/^START diagnostic/);assert.match(output,/log truncated/);
  assert.match(output,/TERMINAL FAILURE: adapter exhausted context/);assert.match(output,/process exit: code=17/);
});
test('independent UTF-8 decoders survive split characters and interleaved pipes', () => {
  const log=new BoundedLog(5,17), input=Buffer.from('€😀漢');
  for(const byte of input){log.write('stdout',Buffer.from([byte]));log.write('stderr',Buffer.from('.'));}
  let output=log.finish({code:0});assert(!output.includes('\ufffd'));assert.match(output,/€.*😀.*漢/);
  const truncated=new BoundedLog(5,11);
  for(let i=0;i<100;i++)truncated.write('stdout',Buffer.from('😀€漢'));
  output=truncated.finish({code:null,signal:'SIGTERM'});
  assert(!output.includes('\ufffd'));assert.match(output,/signal=SIGTERM/);assert.match(output,/log truncated/);
});
test('empty or malformed output reports exit without inventing an agent report', () => {
  assert.match(new BoundedLog().finish({code:0}),/stdout=0 bytes stderr=0 bytes/);
  const log=new BoundedLog();log.write('stderr',Buffer.from([0xff]));
  const output=log.finish({code:9});assert.match(output,/code=9/);assert(output.includes('\ufffd'));
  assert(!output.includes('agent-report'));
});
