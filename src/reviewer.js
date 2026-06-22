const Groq = require('groq-sdk');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Split diff into chunks of given size
function splitIntoChunks(text, chunkSize) {
  const chunks = [];
  let start = 0;

  while (start < text.length) {
    chunks.push(text.substring(start, start + chunkSize));
    start += chunkSize;
  }

  return chunks;
}

// Review a single chunk
async function reviewChunk(chunk, chunkNumber, totalChunks, prTitle) {
  const response = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      {
        role: 'system',
        content: `You are a senior software engineer doing a code review. 
        Focus on bugs, security issues, performance, readability, missing error handling. 
        Format your response as markdown. Be direct but friendly.`
      },
      {
        role: 'user',
        content: `Review this PR.
        
Title: ${prTitle}
This is chunk ${chunkNumber} of ${totalChunks} of the diff.

Diff:
\`\`\`diff
${chunk}
\`\`\``
      }
    ],
    max_tokens: 1024
  });

  return response.choices[0].message.content;
}

// Main function - handles any size diff
async function getReview(diff, prTitle) {
  const CHUNK_SIZE = 8000;

  // If diff is small enough, just review it directly
  if (diff.length <= CHUNK_SIZE) {
    return await reviewChunk(diff, 1, 1, prTitle);
  }

  // Split into chunks
  const chunks = splitIntoChunks(diff, CHUNK_SIZE);
  console.log(`Diff is large — splitting into ${chunks.length} chunks`);

  // Review each chunk one by one
  const reviews = [];
  for (let i = 0; i < chunks.length; i++) {
    console.log(`Reviewing chunk ${i + 1} of ${chunks.length}...`);
    const review = await reviewChunk(chunks[i], i + 1, chunks.length, prTitle);
    reviews.push(review);
  }

  // Combine all reviews into one final comment
  const combined = reviews
    .map((review, i) => `## Part ${i + 1} of ${chunks.length}\n\n${review}`)
    .join('\n\n---\n\n');

  return combined;
}

module.exports = { getReview };