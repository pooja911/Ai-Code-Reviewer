const Groq = require('groq-sdk');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

function splitIntoChunks(text, chunkSize) {
  const chunks = [];
  const overlap = 500;
  let start = 0;

  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length);
    chunks.push(text.substring(start, end));
    start += chunkSize - overlap;
  }

  return chunks;
}

async function reviewChunk(chunk, chunkNumber, totalChunks, prTitle) {
  const response = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      {
        role: 'system',
        content: `You are a senior software engineer doing a code review.
You are reviewing ONE PART of a large diff that has been split into chunks.
NEVER say the diff is incomplete or ask for more — just review what you see.
Focus on: bugs, security issues, performance, readability, error handling.
Format as markdown. Be direct and specific.`
      },
      {
        role: 'user',
        content: `Review this PR.

Title: ${prTitle}

IMPORTANT: This is chunk ${chunkNumber} of ${totalChunks} of the total diff.
The diff has been split into chunks due to its large size.
Even if this chunk starts or ends mid-file, review ONLY what you can see here.
Do NOT ask for the complete diff — just review whatever code changes are present in this chunk.
Focus on bugs, security issues, performance, readability, and missing error handling.

Diff chunk ${chunkNumber}/${totalChunks}:
\`\`\`diff
${chunk}
\`\`\``
      }
    ],
    max_tokens: 1024
  });

  return response.choices[0].message.content;
}

async function getReview(diff, prTitle) {
  const CHUNK_SIZE = 8000;

  if (diff.length <= CHUNK_SIZE) {
    return await reviewChunk(diff, 1, 1, prTitle);
  }

  const chunks = splitIntoChunks(diff, CHUNK_SIZE);
  console.log(`Diff is large — splitting into ${chunks.length} chunks`);

  const reviews = [];
  for (let i = 0; i < chunks.length; i++) {
    console.log(`Reviewing chunk ${i + 1} of ${chunks.length}...`);
    const review = await reviewChunk(chunks[i], i + 1, chunks.length, prTitle);
    reviews.push(review);
  }

  const combined = reviews
    .map((review, i) => `## Part ${i + 1} of ${chunks.length}\n\n${review}`)
    .join('\n\n---\n\n');

  return combined;
}

module.exports = { getReview };