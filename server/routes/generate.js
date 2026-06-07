/**
 * POST /api/generate
 * Core route — handles all learning modes, custom prompts, difficulty, language, study plan, mind map
 * Includes response caching
 */
const express  = require("express");
const router   = express.Router();
const NodeCache = require("node-cache");

// Cache: TTL 10 minutes, check every 2 minutes
const cache = new NodeCache({ stdTTL: 600, checkperiod: 120 });

// ── Groq Models ───────────────────────────────────────────────────────────────
const MODELS = {
  "llama-3.3-70b-versatile": "Llama 3.3 70B",
  "llama-3.1-8b-instant":    "Llama 3.1 8B (Fast)",
  "mixtral-8x7b-32768":      "Mixtral 8x7B",
  "gemma2-9b-it":            "Gemma 2 9B",
};

// ── Difficulty system prompts ─────────────────────────────────────────────────
const DIFFICULTY_CONTEXT = {
  beginner:     "Assume the reader has NO prior knowledge. Use simple everyday language, avoid jargon, define all terms, and use relatable analogies.",
  intermediate: "Assume the reader has basic familiarity with the subject. Use standard terminology and provide moderate depth.",
  expert:       "Assume the reader is a domain expert. Use precise technical language, skip basic definitions, and focus on nuance and depth.",
};

// ── Language instruction ──────────────────────────────────────────────────────
const LANGUAGE_INSTRUCTION = (lang) =>
  lang && lang !== "en"
    ? `\n\nIMPORTANT: Respond entirely in ${lang}. Do not use English unless it is a proper noun or technical term with no translation.`
    : "";

// ── Prompt Templates ──────────────────────────────────────────────────────────
const PROMPTS = {
  explain: (text, diff, lang) => `You are an expert teacher. ${DIFFICULTY_CONTEXT[diff] || DIFFICULTY_CONTEXT.intermediate}

Explain the following concept clearly with simple examples, real-world applications, and a summary:

${text}${LANGUAGE_INSTRUCTION(lang)}`,

  summarize: (text, diff, lang) => `Summarize the following text into exactly 5 concise, well-structured bullet points. ${DIFFICULTY_CONTEXT[diff] || ""}

Each bullet should be one sentence and start with a bold keyword.

Text:
${text}${LANGUAGE_INSTRUCTION(lang)}`,

  quiz: (text, diff, lang) => `Generate 5 quiz questions with detailed answers based on the following content.
Difficulty: ${diff || "intermediate"}. ${DIFFICULTY_CONTEXT[diff] || ""}

Format each as:
**Q[n]: [Question]**
**A:** [Answer]

Content:
${text}${LANGUAGE_INSTRUCTION(lang)}`,

  eli5: (text, diff, lang) => `Explain the following topic as if talking to a 5-year-old child. Use very short sentences, fun comparisons to everyday things, and avoid all technical words.

Topic:
${text}${LANGUAGE_INSTRUCTION(lang)}`,

  flashcards: (text, diff, lang) => `Create 6–10 flashcards from the following content. ${DIFFICULTY_CONTEXT[diff] || ""}

Use EXACTLY this format for every card (one per line, pipe-separated):
**Q:** [Question] | **A:** [Answer]

Keep answers to 1–2 sentences maximum.

Content:
${text}${LANGUAGE_INSTRUCTION(lang)}`,

  studyplan: (text, diff, lang) => `You are an expert academic coach. Create a detailed week-by-week study plan for the following subject or goal.

Target level: ${diff || "intermediate"}. ${DIFFICULTY_CONTEXT[diff] || ""}

For each week provide:
- **Week N: [Theme]**
  - Topics to cover (bullet list)
  - Recommended resources or activities
  - A mini-goal or milestone

Create a 4-week plan minimum. Be specific and actionable.

Subject/Goal:
${text}${LANGUAGE_INSTRUCTION(lang)}`,

  mindmap: (text, diff, lang) => `You are a knowledge architect. Analyse the following topic and produce a structured mind map in Markdown.

Use this exact format:
# [Central Topic]
## [Branch 1]
- Subtopic
  - Detail
## [Branch 2]
- Subtopic
  - Detail

Create at least 5 main branches with 2–4 sub-items each. Be thorough.

Topic:
${text}${LANGUAGE_INSTRUCTION(lang)}`,

  custom: (text, _diff, _lang, systemPrompt) => `${systemPrompt || "You are a helpful AI assistant."}

${text}`,
chat: () => null,
};

// ── POST /api/generate ────────────────────────────────────────────────────────
router.post("/generate", async (req, res) => {
  const {
    feature,
    text,
    difficulty = "intermediate",
    language   = "en",
    model      = "llama-3.3-70b-versatile",
    customPrompt,
  } = req.body;

 // Validation
  if (feature !== "chat" && (!text || text.trim().length < 3))
    return res.status(400).json({ error: "Input text is too short or empty." });

  if (!PROMPTS[feature] && feature !== "chat")
    return res.status(400).json({ error: `Invalid feature: "${feature}".` });

  if (!process.env.GROQ_API_KEY)
    return res.status(500).json({ error: "Server misconfiguration: GROQ_API_KEY is not set." });

  // Build prompt
  const prompt = feature === "chat" ? null : PROMPTS[feature]((text || "").trim(), difficulty, language, customPrompt);
  const messages = feature === "chat"
    ? [{ role: "system", content: "You are a helpful tutor. Answer conversationally and directly like a knowledgeable friend. No bullet lists unless asked. No structured formatting. Just natural helpful replies." }, ...(req.body.messages || [])]
    : [{ role: "user", content: prompt }];

  // Cache key
  const cacheKey = feature !== "chat" ? `${feature}:${model}:${difficulty}:${language}:${Buffer.from(text.trim()).toString("base64").slice(0, 60)}` : null;
  const cached = cacheKey ? cache.get(cacheKey) : null;
  if (cached) {
    return res.json({ result: cached, cached: true });
  }

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: MODELS[model] ? model : "llama-3.3-70b-versatile",
        messages: messages,
        temperature: 0.7,
        max_tokens: 2048,
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      console.error("Groq API error:", response.status, err);
      return res.status(response.status).json({
        error: err?.error?.message || `Groq API error: ${response.status}`,
      });
    }

    const data   = await response.json();
    const result = data.choices?.[0]?.message?.content;

    if (!result) return res.status(500).json({ error: "Empty response from Groq." });

    // Cache the result
    if (cacheKey) cache.set(cacheKey, result);

    return res.json({ result, cached: false, model });
  } catch (err) {
    console.error("Fetch error:", err.message);
    return res.status(500).json({ error: "Failed to reach Groq API. Check your network and API key." });
  }
});

// ── GET /api/cache/clear ───────────────────────────────────────────────────────
router.delete("/cache", (_req, res) => {
  cache.flushAll();
  res.json({ message: "Cache cleared." });
});

module.exports = router;
