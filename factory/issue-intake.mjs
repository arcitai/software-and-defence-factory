import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { readProjectLinks } from './project-links.mjs';
const exec = promisify(execFile);

export function validateIssueURL(repoURL, value) {
  if (typeof value !== 'string' || value.length > 2048 || !/^https:\/\/github\.com\/[A-Za-z0-9-]+\/[A-Za-z0-9_.-]+\/issues\/[1-9][0-9]*$/.test(value)) throw new Error('Enter a GitHub issue URL without query parameters.');
  if (!repoURL || !value.toLowerCase().startsWith(`${repoURL.toLowerCase()}/issues/`)) throw new Error('Issue does not belong to this project’s configured GitHub origin.');
  return value;
}
export async function readIssue(repo, url, read = async url => {
  try {
    const { stdout } = await exec('gh', ['issue', 'view', url, '--json', 'title,body,url'], {
      encoding: 'utf8', timeout: 10000, maxBuffer: 300000,
      env: { ...process.env, GH_PROMPT_DISABLED: '1', GH_PAGER: 'cat' },
    });
    return JSON.parse(stdout);
  } catch { throw new Error('Could not read the issue. Check the URL and GitHub CLI access on the controller host.'); }
}) {
  const repoURL = readProjectLinks(repo)?.repository;
  validateIssueURL(repoURL, url);
  const issue = await read(url);
  validateIssueURL(repoURL, issue?.url);
  if (issue.url.toLowerCase() !== url.toLowerCase() || typeof issue.title !== 'string' || !issue.title.trim() || typeof issue.body !== 'string') throw new Error('GitHub returned an unexpected issue.');
  const spec = `Issue: ${issue.url}\n${issue.title}\n\n${issue.body}`;
  if (Buffer.byteLength(spec) > 240000) throw new Error('Issue exceeds the 240 KB task limit. Use a bounded task file instead.');
  return { title: issue.title, url: issue.url, body: issue.body, spec };
}
