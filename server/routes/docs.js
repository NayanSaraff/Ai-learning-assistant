/**
 * GET /docs
 * Serves the REST API documentation page
 */
const express = require("express");
const router  = express.Router();

router.get("/", (_req, res) => {
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>API Docs — AI Learning Assistant</title>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Mono:wght@300;400;500&display=swap" rel="stylesheet"/>
<style>
:root{--bg:#0d0d0f;--surface:#141418;--elevated:#1b1b21;--amber:#d4a843;--amber-dim:rgba(212,168,67,.12);--text:#f0eadb;--muted:#5a5750;--secondary:#9e9888;--border:rgba(212,168,67,.15);--subtle:rgba(255,255,255,.05);--error:#e05c5c;--success:#5cb85c}
*{box-sizing:border-box;margin:0;padding:0}
body{background:var(--bg);color:var(--text);font-family:'DM Mono',monospace;font-weight:300;line-height:1.7;padding:3rem 2rem;max-width:860px;margin:0 auto}
h1{font-family:'Playfair Display',serif;font-size:2rem;color:var(--amber);margin-bottom:.25rem}
.tagline{color:var(--secondary);font-size:.8rem;margin-bottom:3rem;letter-spacing:.08em}
h2{font-family:'Playfair Display',serif;font-size:1.2rem;color:var(--text);margin:2.5rem 0 1rem;padding-bottom:.5rem;border-bottom:1px solid var(--border)}
h3{font-size:.82rem;font-weight:500;letter-spacing:.1em;text-transform:uppercase;color:var(--amber);margin:1.5rem 0 .5rem}
p{color:var(--secondary);font-size:.85rem;margin-bottom:.75rem}
.endpoint{background:var(--surface);border:1px solid var(--border);border-radius:10px;padding:1.5rem;margin-bottom:1.5rem}
.method{display:inline-block;padding:.2rem .6rem;border-radius:4px;font-size:.7rem;font-weight:500;letter-spacing:.1em;margin-right:.5rem}
.post{background:rgba(212,168,67,.2);color:var(--amber)}
.get{background:rgba(92,184,92,.15);color:var(--success)}
.delete{background:rgba(224,92,92,.15);color:var(--error)}
.path{font-size:.9rem;color:var(--text)}
pre{background:var(--elevated);border:1px solid var(--subtle);border-radius:8px;padding:1rem;overflow-x:auto;margin:.75rem 0;font-size:.78rem;line-height:1.6}
code{color:var(--amber);font-size:.82rem}
table{width:100%;border-collapse:collapse;margin:.75rem 0;font-size:.78rem}
th{background:var(--elevated);border:1px solid var(--subtle);padding:.5rem .75rem;text-align:left;color:var(--amber);font-weight:500}
td{border:1px solid var(--subtle);padding:.45rem .75rem;color:var(--secondary);vertical-align:top}
tr:nth-child(even) td{background:var(--elevated)}
.badge{display:inline-block;background:var(--amber-dim);border:1px solid var(--border);border-radius:4px;padding:.15rem .5rem;font-size:.68rem;color:var(--amber);margin:.2rem .2rem 0 0}
a{color:var(--amber);text-decoration:none}
a:hover{text-decoration:underline}
.back{display:inline-flex;align-items:center;gap:.4rem;color:var(--secondary);font-size:.78rem;margin-bottom:2rem;text-decoration:none;border:1px solid var(--subtle);padding:.4rem .9rem;border-radius:20px;transition:all .2s}
.back:hover{color:var(--amber);border-color:var(--border);text-decoration:none}
</style>
</head>
<body>
<a href="/" class="back">← Back to App</a>
<h1>API Reference</h1>
<p class="tagline">AI Learning Assistant v2 — REST API Documentation</p>

<h2>Base URL</h2>
<pre>http://localhost:3000/api</pre>

<h2>Authentication</h2>
<p>Authentication is handled server-side. The client never sends an API key. Set <code>GROQ_API_KEY</code> in the server's <code>.env</code> file.</p>

<h2>Rate Limiting</h2>
<p>20 requests per IP per minute on <code>POST /api/generate</code>. Exceeding returns <code>429 Too Many Requests</code>.</p>

<h2>Endpoints</h2>

<div class="endpoint">
  <h3><span class="method post">POST</span><span class="path">/api/generate</span></h3>
  <p>Core endpoint. Sends user input to the Groq API with a selected learning mode and returns a Markdown-formatted response.</p>
  <h3>Request Body</h3>
  <pre>{
  "feature":      "explain",               // required — see features table
  "text":         "Your input text",       // required — min 3 chars
  "difficulty":   "intermediate",          // optional: beginner | intermediate | expert
  "language":     "en",                    // optional: en | hi | es | fr | de | ja | zh
  "model":        "llama-3.3-70b-versatile", // optional — see /api/models
  "customPrompt": "You are a..."           // optional — only used when feature = "custom"
}</pre>
  <h3>Features</h3>
  <table>
    <tr><th>Value</th><th>Description</th></tr>
    <tr><td><code>explain</code></td><td>Expert explanation with examples</td></tr>
    <tr><td><code>summarize</code></td><td>5 bullet-point summary</td></tr>
    <tr><td><code>quiz</code></td><td>5 Q&amp;A quiz questions</td></tr>
    <tr><td><code>eli5</code></td><td>Explain Like I'm 5</td></tr>
    <tr><td><code>flashcards</code></td><td>Q | A flashcard pairs</td></tr>
    <tr><td><code>studyplan</code></td><td>Week-by-week study roadmap</td></tr>
    <tr><td><code>mindmap</code></td><td>Markdown mind map structure</td></tr>
    <tr><td><code>custom</code></td><td>Uses your own system prompt</td></tr>
  </table>
  <h3>Success Response <code>200</code></h3>
  <pre>{
  "result": "## Markdown response...",
  "cached": false,
  "model":  "llama-3.3-70b-versatile"
}</pre>
  <h3>Error Response</h3>
  <pre>{ "error": "Human-readable error message" }</pre>
</div>

<div class="endpoint">
  <h3><span class="method get">GET</span><span class="path">/api/models</span></h3>
  <p>Returns the list of available Groq models.</p>
  <h3>Response</h3>
  <pre>{
  "models": [
    { "id": "llama-3.3-70b-versatile", "name": "Llama 3.3 70B", "description": "Best quality, recommended" },
    { "id": "llama-3.1-8b-instant",    "name": "Llama 3.1 8B",  "description": "Fastest responses" },
    ...
  ]
}</pre>
</div>

<div class="endpoint">
  <h3><span class="method delete">DELETE</span><span class="path">/api/cache</span></h3>
  <p>Clears the server-side response cache.</p>
  <h3>Response</h3>
  <pre>{ "message": "Cache cleared." }</pre>
</div>

<h2>Error Codes</h2>
<table>
  <tr><th>Status</th><th>Meaning</th></tr>
  <tr><td>400</td><td>Bad request — missing or invalid parameters</td></tr>
  <tr><td>429</td><td>Rate limit exceeded</td></tr>
  <tr><td>500</td><td>Server error or Groq API failure</td></tr>
</table>

<h2>Example — cURL</h2>
<pre>curl -X POST http://localhost:3000/api/generate \\
  -H "Content-Type: application/json" \\
  -d '{
    "feature": "summarize",
    "text": "Photosynthesis is the process by which plants...",
    "difficulty": "beginner",
    "language": "en",
    "model": "llama-3.3-70b-versatile"
  }'</pre>

<h2>Supported Languages</h2>
<p>
  <span class="badge">English (en)</span>
  <span class="badge">Hindi (hi)</span>
  <span class="badge">Spanish (es)</span>
  <span class="badge">French (fr)</span>
  <span class="badge">German (de)</span>
  <span class="badge">Japanese (ja)</span>
  <span class="badge">Chinese (zh)</span>
  <span class="badge">Arabic (ar)</span>
  <span class="badge">Portuguese (pt)</span>
</p>

<br/><br/>
<p style="color:var(--muted);font-size:.72rem">AI Learning Assistant v2 · Built with Node.js + Express + Groq</p>
</body>
</html>`);
});

module.exports = router;
