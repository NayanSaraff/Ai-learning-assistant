/**
 * AI Learning Assistant v2 — Express Server
 */
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const rateLimit = require("express-rate-limit");

const generateRoute = require("./routes/generate");
const modelsRoute   = require("./routes/models");
const docsRoute     = require("./routes/docs");

const app  = express();
const PORT = process.env.PORT || 3000;

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json({ limit: "2mb" }));
app.use(express.static(path.join(__dirname, "../client")));

// ── Rate Limiting ─────────────────────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: 60 * 1000,      // 1 minute
  max: 20,                   // 20 requests per minute per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests. Please wait a moment before trying again." },
});
app.use("/api/generate", limiter);

// ── API Routes ────────────────────────────────────────────────────────────────
app.use("/api", generateRoute);
app.use("/api", modelsRoute);
app.use("/docs", docsRoute);

// ── SPA Catch-all ─────────────────────────────────────────────────────────────
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/index.html"));
});

// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀  AI Learning Assistant v2`);
  console.log(`    URL        : http://localhost:${PORT}`);
  console.log(`    Docs       : http://localhost:${PORT}/docs`);
  console.log(`    API Key    : ${process.env.GROQ_API_KEY ? "✅  Set" : "❌  Missing — add GROQ_API_KEY to .env"}`);
  console.log(`    Env        : ${process.env.NODE_ENV || "development"}\n`);
});
