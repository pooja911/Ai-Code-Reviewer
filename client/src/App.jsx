import { useState } from "react";

export default function App() {
  const [prUrl, setPrUrl] = useState("");
  const [review, setReview] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [postComment, setPostComment] = useState(false);

  const handleReview = async () => {
    if (!prUrl) return;
    setLoading(true);
    setError("");
    setReview("");
    setSuccess(false);

    try {
      const response = await fetch("http://localhost:3000/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prUrl, shouldPostComment: postComment })
      });

      const data = await response.json();

      if (data.success) {
        setReview(data.review);
        setSuccess(true);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError("Could not connect to server. Make sure it is running.");
    }

    setLoading(false);
  };

  const handleClear = () => {
    setPrUrl("");
    setReview("");
    setError("");
    setSuccess(false);
  };

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>🤖 AI Code Reviewer</h1>
      <p style={{ color: "#666" }}>Paste any public GitHub PR link and get an instant AI code review</p>

      <div style={{ display: "flex", gap: "10px", marginTop: "1.5rem" }}>
        <input
          type="text"
          placeholder="e.g. https://github.com/facebook/react/pull/1"
          value={prUrl}
          onChange={(e) => setPrUrl(e.target.value)}
          style={{ flex: 1, padding: "10px", fontSize: "15px", borderRadius: "6px", border: "1px solid #ccc" }}
        />
        <button
          onClick={handleReview}
          disabled={loading}
          style={{ padding: "10px 20px", backgroundColor: "#2563eb", color: "white", border: "none", borderRadius: "6px", fontSize: "15px", cursor: loading ? "not-allowed" : "pointer" }}
        >
          {loading ? "Reviewing..." : "Review"}
        </button>
        <button
          onClick={handleClear}
          disabled={loading}
          style={{ padding: "10px 20px", backgroundColor: "#6b7280", color: "white", border: "none", borderRadius: "6px", fontSize: "15px", cursor: "pointer" }}
        >
          Clear
        </button>
      </div>

      {/* Checkbox to decide whether to post comment */}
      <div style={{ marginTop: "1rem", display: "flex", alignItems: "center", gap: "8px" }}>
        <input
          type="checkbox"
          id="postComment"
          checked={postComment}
          onChange={(e) => setPostComment(e.target.checked)}
          style={{ width: "16px", height: "16px", cursor: "pointer" }}
        />
        <label htmlFor="postComment" style={{ fontSize: "14px", color: "#444", cursor: "pointer" }}>
          Also post this review as a comment on the PR
        </label>
      </div>

      {error && (
        <div style={{ marginTop: "1rem", padding: "1rem", backgroundColor: "#fee2e2", borderRadius: "6px", color: "#dc2626" }}>
          ❌ {error}
        </div>
      )}

      {success && (
        <div style={{ marginTop: "1rem", padding: "1rem", backgroundColor: "#dcfce7", borderRadius: "6px", color: "#16a34a" }}>
          ✅ {postComment ? "Review posted on PR successfully!" : "Review generated successfully!"}
        </div>
      )}

      {review && (
        <div style={{ marginTop: "1.5rem", padding: "1.5rem", backgroundColor: "#f8fafc", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
          <h2 style={{ marginTop: 0 }}>📋 Review Result</h2>
          <pre style={{ whiteSpace: "pre-wrap", fontFamily: "sans-serif", lineHeight: "1.6" }}>{review}</pre>
        </div>
      )}
    </div>
  );
}