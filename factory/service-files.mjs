import { createHash } from 'node:crypto';

export function serviceId(kind, identity) {
  return `software-defence-factory-${kind}-${createHash('sha256').update(identity).digest('hex').slice(0, 16)}`;
}
function text(value) {
  if (typeof value !== 'string' || /[\x00-\x1f\x7f]/.test(value)) throw new Error('Service values cannot contain control characters');
  return value;
}
const unit = value => JSON.stringify(text(value).replaceAll('%', '%%'));
const argument = value => unit(value.replaceAll('$', () => '$$'));
const xml = value => text(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');

export function systemdUnit({ description, argv, directory, environment = {}, oneshot = false }) {
  return `[Unit]\nDescription=${text(description)}\nStartLimitIntervalSec=0\n\n[Service]\nType=${oneshot ? 'oneshot' : 'exec'}\nWorkingDirectory=${text(directory).replaceAll('%', '%%')}\nExecStart=${argv.map(argument).join(' ')}\n${Object.entries(environment).map(([key, value]) => {
    if (!/^[A-Z_][A-Z0-9_]*$/.test(key)) throw new Error('Invalid environment name');
    return `Environment=${unit(`${key}=${value}`)}\n`;
  }).join('')}${oneshot ? 'TimeoutStartSec=15min\n' : 'Restart=always\nRestartSec=15\n'}TimeoutStopSec=60\nKillMode=control-group\nUMask=0077\n\n[Install]\nWantedBy=default.target\n`;
}
export function launchAgent({ id, argv, directory, log, environment = {} }) {
  return `<?xml version="1.0" encoding="UTF-8"?>\n<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">\n<plist version="1.0"><dict>\n<key>Label</key><string>${xml(id)}</string>\n<key>ProgramArguments</key><array>${argv.map(value => `<string>${xml(value)}</string>`).join('')}</array>\n<key>WorkingDirectory</key><string>${xml(directory)}</string>\n<key>EnvironmentVariables</key><dict>${Object.entries(environment).map(([key, value]) => `<key>${xml(key)}</key><string>${xml(value)}</string>`).join('')}</dict>\n<key>RunAtLoad</key><true/><key>KeepAlive</key><true/>\n<key>ThrottleInterval</key><integer>15</integer>\n<key>ExitTimeOut</key><integer>60</integer>\n<key>Umask</key><integer>63</integer>\n<key>StandardOutPath</key><string>${xml(log)}</string>\n<key>StandardErrorPath</key><string>${xml(log)}</string>\n</dict></plist>\n`;
}
export function tunnelArguments(host, port) {
  if (!/^[a-zA-Z0-9][a-zA-Z0-9_.@-]*$/.test(host || '')) throw new Error('Use an SSH hostname or configured alias without spaces or options');
  if (!Number.isInteger(port) || port < 1024 || port > 65535) throw new Error('Tunnel port must be 1024–65535');
  return ['/usr/bin/ssh', '-N', '-T', '-o', 'BatchMode=yes', '-o', 'StrictHostKeyChecking=yes', '-o', 'ExitOnForwardFailure=yes',
    '-o', 'ConnectTimeout=10', '-o', 'ServerAliveInterval=15', '-o', 'ServerAliveCountMax=3', '-L', `127.0.0.1:${port}:127.0.0.1:${port}`, host];
}
export function groupArguments(argv, group, executable) {
  if (!/^[a-z_][a-z0-9_-]*[$]?$/.test(group || '')) throw new Error('Expected an existing Unix group name');
  if (!['/usr/bin/sg', '/usr/bin/newgrp'].includes(executable)) throw new Error('Unsupported group launcher');
  const quote = value => `'${text(value).replaceAll("'", "'\\''")}'`;
  return [executable, group, '-c', 'exec ' + argv.map(quote).join(' ')];
}
