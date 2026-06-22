const { Octokit } = require('@octokit/rest');

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

async function postComment(owner, repo, pullNumber, reviewText) {
  const body = `## 🤖 AI Code Review\n\n${reviewText}\n\n---\n*Reviewed by Gemini. Use your own judgement.*`;

  await octokit.issues.createComment({
    owner,
    repo,
    issue_number: pullNumber,
    body
  });
}

module.exports = { postComment };