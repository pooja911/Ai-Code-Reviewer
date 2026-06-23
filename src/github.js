const { Octokit } = require('@octokit/rest');
const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

async function getDiff(owner, repo, pullNumber) {
  const response = await octokit.pulls.get({
    owner,
    repo,
    pull_number: pullNumber,
    mediaType: { format: 'diff' }
  });

  const diff = response.data;
  const MAX_CHARS = 8000;
  if (typeof diff === 'string' && diff.length > MAX_CHARS) {
    return diff.substring(0, MAX_CHARS) + '\n\n[diff truncated]';
  }
  return diff;
}

module.exports = { getDiff };
