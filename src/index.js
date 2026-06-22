require('dotenv').config();
const express = require('express');
const { handleWebhook } = require('./webhook');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({
  verify: (req, res, buf) => {
    req.rawBody = buf; // needed to verify GitHub's signature later
  }
}));

app.post('/webhook', handleWebhook);
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