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

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});