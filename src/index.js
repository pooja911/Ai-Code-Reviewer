require('dotenv').config();
const cors = require('cors');
const express = require('express');
const { handleWebhook } = require('./webhook');
const { getDiff } = require('./github');
const { getReview } = require('./reviewer');
const { postComment } = require('./poster');

const app = express();
app.use(cors());
const PORT = process.env.PORT || 3000;

app.use(express.json({
  verify: (req, res, buf) => {
    req.rawBody = buf;
  }
}));

app.post('/webhook', handleWebhook);
app.post('/review', async (req, res) => {
  const { prUrl, shouldPostComment } = req.body;

  try {
    const parts = prUrl.split('/');
    const owner = parts[3];
    const repo = parts[4];
    const number = parseInt(parts[6]);

    console.log(`Manual review requested for PR #${number} in ${owner}/${repo}`);

    const diff = await getDiff(owner, repo, number);
    const review = await getReview(diff, `PR #${number}`);

    if (shouldPostComment) {
      await postComment(owner, repo, number, review);
      console.log(`Comment posted on PR #${number}`);
    }

    res.json({ success: true, review });
  } catch (err) {
    console.error('Manual review failed:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/', (req, res) => {
  res.send(`
    <h1>🤖 AI Code Review Bot</h1>
    <p>This server automatically reviews GitHub Pull Requests using Groq AI.</p>
    <p>Webhook endpoint: <code>POST /webhook</code></p>
    <a href="https://github.com/pooja911/Ai-Code-Reviewer">View on GitHub</a>
  `);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});