/**
 * GET /api/models
 * Returns available Groq models
 */
const express = require("express");
const router  = express.Router();

const MODELS = [
  { id: "llama-3.3-70b-versatile", name: "Llama 3.3 70B",      description: "Best quality, recommended" },
  { id: "llama-3.1-8b-instant",    name: "Llama 3.1 8B",        description: "Fastest responses" },
  { id: "mixtral-8x7b-32768",      name: "Mixtral 8x7B",        description: "Long context, 32k tokens" },
  { id: "gemma2-9b-it",            name: "Gemma 2 9B",          description: "Google's efficient model" },
];

router.get("/models", (_req, res) => {
  res.json({ models: MODELS });
});

module.exports = router;
