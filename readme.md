
# 🤖 AI Code Reviewer — Full Stack

A full stack application that reviews GitHub Pull Requests using Groq AI (Llama 3.3 70B). Paste any public PR link into the dashboard, get an instant structured review, and optionally post it as a comment on the PR.

> Built with Node.js, Express, React, Octokit, and Groq AI.

---

## 📸 Demo
<img width="1065" height="2637" alt="image" src="https://github.com/user-attachments/assets/055775df-44f8-4f25-b647-057333575a5c" />

<img width="1318" height="1023" alt="image" src="https://github.com/user-attachments/assets/5333f8c7-e099-4722-b664-ed7295528ee1" />

---

## 🚀 What It Does

**Two ways to use it:**

**1. Dashboard (manual)**

* https://ai-code-reviewer-b6pb.onrender.com/
* https://ai-code-reviewer1.netlify.app/

**2. Webhook (automatic)**

* Connect it to any GitHub repo
* Every time a PR is opened or updated — it's reviewed automatically
* Review is posted as a comment on the PR instantly

---

## 🧠 Architecture

```
── Manual Flow ──────────────────────────────────────
User pastes PR URL into React dashboard
         ↓
POST /review → index.js
         ↓
github.js → fetches diff from GitHub API
         ↓
reviewer.js → splits diff into chunks → sends to Groq AI
         ↓
Result shown on dashboard
(optionally) poster.js → posts comment on PR

── Automatic Flow ────────────────────────────────────
Developer opens PR on GitHub
         ↓
GitHub sends POST request to /webhook
         ↓
webhook.js → verifies signature (HMAC-SHA256)
         ↓
github.js → fetches diff
         ↓
reviewer.js → chunks + reviews with Groq AI
         ↓
poster.js → posts comment on PR automatically
```

---

## 📁 Project Structure

```
ai-code-reviewer/
├── src/                   ← Backend (Node.js + Express)
│   ├── index.js           → Server entry point + API routes
│   ├── webhook.js         → Handles GitHub webhook events
│   ├── github.js          → Fetches PR diffs via GitHub API
│   ├── reviewer.js        → Chunks diff + sends to Groq AI
│   └── poster.js          → Posts review comment to GitHub
├── client/                ← Frontend (React + Vite)
│   └── src/
│       └── App.jsx        → Dashboard UI
├── .env                   → Secret keys (never committed)
├── .gitignore
└── package.json
```

---

## 🛠️ Tech Stack

| Tool         | Purpose                                  |
| ------------ | ---------------------------------------- |
| Node.js      | JavaScript runtime                       |
| Express      | Web server + API routes                  |
| React + Vite | Frontend dashboard                       |
| Octokit      | GitHub SDK — fetch diffs, post comments |
| Groq SDK     | AI inference (Llama 3.3 70B)             |
| cors         | Allow frontend to talk to backend        |
| dotenv       | Load secrets from .env                   |
| crypto       | Verify GitHub webhook signatures         |

---

## ⚙️ Setup & Installation

### Prerequisites

* Node.js v18+
* A GitHub account
* A Groq API key — free at console.groq.com
* ngrok — for local webhook testing

### 1. Clone the repo

```bash
git clone https://github.com/pooja911/Ai-Code-Reviewer.git
cd Ai-Code-Reviewer
```

### 2. Install backend dependencies

```bash
npm install
```

### 3. Install frontend dependencies

```bash
cd client
npm install
cd ..
```

### 4. Set up environment variables

Create a `.env` file in the root:

```
GROQ_API_KEY=your-groq-api-key
GITHUB_TOKEN=your-github-classic-token
GITHUB_WEBHOOK_SECRET=any-secret-password
PORT=3000
```

**Where to get each key:**

* `GROQ_API_KEY` → console.groq.com → API Keys → Create key (free)
* `GITHUB_TOKEN` → GitHub → Settings → Developer Settings → Tokens (classic) → check `repo` scope
* `GITHUB_WEBHOOK_SECRET` → make up any password

### 5. Run the backend

```bash
npm run dev
```

### 6. Run the frontend

```bash
cd client
npm run dev
```

Dashboard opens at `http://localhost:5173`

### 7. (Optional) Set up webhook for automatic reviews

```bash
./ngrok.exe http 3000   # Windows
ngrok http 3000          # Mac/Linux
```

Go to your repo → Settings → Webhooks → Add webhook:

* **Payload URL:** `https://your-ngrok-url/webhook`
* **Content type:** `application/json`
* **Secret:** same as `GITHUB_WEBHOOK_SECRET`
* **Events:** Pull requests only

---

## 🔐 Security — Webhook Verification

Every webhook request GitHub sends is signed with your secret using HMAC-SHA256.

```
Request arrives
      ↓
Read GitHub's signature from x-hub-signature-256 header
      ↓
Generate our own signature using the same secret
      ↓
Compare using crypto.timingSafeEqual()
      ↓
Match → process ✅    No match → reject 401 ❌
```

`timingSafeEqual` is used instead of `===` to prevent timing attacks.

---

## 🧩 Key Design Decisions

### 1. Chunked diff processing with overlap

Large PRs can have thousands of lines. Instead of truncating (and missing bugs), the diff is split into 8000-character chunks with 500-character overlap between chunks — so Groq always has context even at chunk boundaries.

```
Diff (25,000 chars)
       ↓
Chunk 1 (0-8000)         → Groq → Review 1
Chunk 2 (7500-15500)     → Groq → Review 2  ← 500 char overlap
Chunk 3 (15000-23000)    → Groq → Review 3  ← 500 char overlap
       ↓
Combined into one structured review
```

### 2. Respond to GitHub immediately, work asynchronously

```js
res.sendStatus(200); // acknowledge GitHub instantly
// slow AI work happens after
const diff = await getDiff(...);
```

GitHub times out webhooks after 10 seconds. By responding immediately and working async, we never miss a delivery.

### 3. User controls whether to post comment

The dashboard gives the user a checkbox — review any public PR privately on screen, or post the review as a comment. Useful for reviewing PRs you don't own.

### 4. Classic GitHub token for reliability

Fine-grained tokens have permission issues with the issues comments API. Classic tokens with `repo` scope work reliably for posting PR comments.

---

## 💡 Concepts Used

| Concept                | Where                             |
| ---------------------- | --------------------------------- |
| REST API server        | Express in index.js               |
| Webhooks               | GitHub → /webhook                |
| React state management | useState in App.jsx               |
| async/await            | Every API call                    |
| HMAC-SHA256 security   | verifySignature() in webhook.js   |
| Chunking with overlap  | splitIntoChunks() in reviewer.js  |
| CORS                   | Allowing frontend to call backend |
| Environment variables  | .env file                         |
| Error handling         | try/catch throughout              |
| Modular code design    | One job per file                  |

---

## 🎯 Interview Talking Points

**"Walk me through your architecture"**

> "It's a full stack app — a React frontend where you paste a PR link, and a Node.js/Express backend that fetches the diff, sends it to Groq AI, and returns the review. There's also a webhook endpoint so it can automatically review PRs when they're opened."

**"How do you handle large PRs?"**

> "I split the diff into 8000-character chunks with 500-character overlap between them. The overlap ensures Groq always has context even when a chunk starts mid-function. Each chunk is reviewed independently and the results are combined into one structured comment."

**"How do you handle the GitHub webhook timeout?"**

> "GitHub expects a response within 10 seconds but Groq takes longer. So I respond with 200 immediately and do the AI work asynchronously in the background."

**"How do you prevent fake webhook requests?"**

> "Every GitHub webhook is signed with a shared secret using HMAC-SHA256. I verify this on every request using Node's crypto module with timingSafeEqual instead of === to prevent timing attacks."

**"Why did you give users control over posting comments?"**

> "I realised people might want to review any public PR privately — just to see the feedback — without spamming comment on repos they don't own. So I added a checkbox that lets the user decide."

---

## 🔮 Possible Extensions

* [ ] Review history — store past reviews in a database
* [ ] PR scoring — score each PR by category (bugs, security, readability)
* [ ] Support multiple AI providers (Groq, Gemini, Claude)
* [ ] Slack notification when a review is posted
* [ ] Config file per repo — customize review focus areas

---

## 📚 What I Learned Building This

* How webhooks work and why they're better than polling
* How to verify request authenticity with HMAC signatures
* The async/await pattern for handling slow API calls
* Why you should always respond to webhooks immediately
* How chunking with overlap solves the context problem in large inputs
* How to build a full stack app connecting React frontend to Express backend
* How CORS works and why it's needed for frontend/backend communication

---

## 👩‍💻 Author

**Pooja Garg**

* GitHub: [@pooja911](https://github.com/pooja911)

---

*Built as a portfolio project demonstrating AI integration, webhook handling, full stack development, and security best practices.*
