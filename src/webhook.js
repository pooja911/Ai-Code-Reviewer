const crypto = require('crypto');
const { getDiff } = require('./github');
const { getReview } = require('./reviewer');
const { postComment } = require('./poster');

function verifySignature(req) {
  const sig = req.headers['x-hub-signature-256'];
  if (!sig) return false;
  const hmac = crypto.createHmac('sha256', process.env.GITHUB_WEBHOOK_SECRET);
  const digest = 'sha256=' + hmac.update(req.rawBody).digest('hex');
  return crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(digest));
}

async function handleWebhook(req, res) {
  if (!verifySignature(req)) {
    console.log('Invalid signature — rejected');
    return res.status(401).send('Invalid signature');
  }

  const event = req.headers['x-github-event'];
  const payload = req.body;

  if (event !== 'pull_request') return res.sendStatus(200);
  if (!['opened', 'synchronize'].includes(payload.action)) return res.sendStatus(200);

  res.sendStatus(200); // respond fast, work async

  const owner = payload.repository.owner.login;
  const repo = payload.repository.name;
  const number = payload.pull_request.number;

  try {
    console.log(`Reviewing PR #${number} in ${owner}/${repo}...`);
    const diff = await getDiff(owner, repo, number);
    const review = await getReview(diff, payload.pull_request.title);
    await postComment(owner, repo, number, review);
    console.log(`Done! Comment posted on PR #${number}`);
  } catch (err) {
    console.error('Review failed:', err.message);
  }
}

module.exports = { handleWebhook };