# AI Learning Assistant v2

> A fully-featured AI-powered study tool built on **Groq (Llama 3.3 70B)** — Node.js · Express · Vanilla JS

---

## What's New in v2

Everything from v1, plus **25+ new features** across AI modes, export, UI, accessibility, analytics, and backend.

---

## Features

### 🧠 AI / Learning Modes
| Mode | Description |
|---|---|
| **💡 Explain Concept** | Expert explanation with examples (adjustable depth) |
| **📋 Summarize** | 5 concise bullet-point summary |
| **❓ Quiz** | 5 Q&A questions — also interactive show/hide mode |
| **🧸 ELI5** | Explain Like I'm 5 |
| **🃏 Flashcards** | Interactive flip-card viewer |
| **📅 Study Plan** | Week-by-week study roadmap |
| **🧠 Mind Map** | Structured markdown mind map |
| **⚙️ Custom Prompt** | Write your own system instruction |
| **Follow-up Chat** | Continue the conversation after any response |
| **Difficulty Levels** | Beginner / Intermediate / Expert toggle |
| **Language Selector** | English, Hindi, Spanish, French, German, Japanese, Chinese, Arabic, Portuguese |
| **Model Selector** | Llama 3.3 70B · Llama 3.1 8B · Mixtral 8x7B · Gemma 2 9B |

### 📁 Export & Saving
| Feature | Description |
|---|---|
| **Export to PDF** | Download formatted PDF via jsPDF |
| **Export as Markdown** | Download `.md` file |
| **Copy as Markdown** | Copy raw markdown to clipboard |
| **Persistent History** | Session history saved to `localStorage` (survives refresh) |
| **Bookmarks** | Star/pin any response; persisted to `localStorage` |

### 🎨 UI / UX
| Feature | Description |
|---|---|
| **Dark / Light Mode** | Toggle with 🌙/☀️ button; persisted |
| **Font Size Control** | A− / A+ buttons; persisted |
| **Fullscreen Reading Mode** | Distraction-free modal view |
| **Typewriter Effect** | Smooth response rendering via Marked.js |
| **Response Rating** | 👍 / 👎 buttons |
| **Cached Badge** | ⚡ indicator when response is served from cache |

### 🔊 Accessibility & Input
| Feature | Description |
|---|---|
| **Voice Input** | Web Speech API microphone button 🎤 |
| **Text-to-Speech** | Read response aloud 🔊 (toggle on/off) |
| **File Upload** | Upload a `.txt` or `.md` file as input 📂 |
| **Character Warning** | Alert at 3,000 chars; hard limit at 8,000 |
| **Keyboard Shortcut** | `Ctrl+Enter` / `Cmd+Enter` to submit |

### 📊 Analytics & Gamification
| Feature | Description |
|---|---|
| **Session Stats** | Total queries + characters in sidebar |
| **Streak Tracker** | Daily study streak with 🔥 counter |
| **Progress Bar** | Today's queries vs. 10-query daily goal |
| **Interactive Quiz** | Show/hide answers, scored mode |
| **Flashcard Viewer** | Flip cards with prev/next navigation |

### ⚙️ Backend
| Feature | Description |
|---|---|
| **Model Selector** | Switch between 4 Groq models per request |
| **Rate Limiting** | 20 req/min per IP via `express-rate-limit` |
| **Response Caching** | 10-minute server-side cache via `node-cache` |
| **REST API Docs** | Full docs page at `/docs` |
| **Cache Clear** | DELETE `/api/cache` endpoint |

---

## Tech Stack

**Frontend:** HTML5 · CSS3 (custom properties, animations) · Vanilla JS (ES2020+) · Marked.js · jsPDF  
**Backend:** Node.js (v18+) · Express.js · dotenv · express-rate-limit · node-cache

---

## Project Structure

```
ai-learning-assistant-v2/
├── server/
│   ├── server.js               ← Express entry point + rate limiting
│   ├── routes/
│   │   ├── generate.js         ← POST /api/generate (all modes + caching)
│   │   ├── models.js           ← GET /api/models
│   │   └── docs.js             ← GET /docs  (API reference page)
│   ├── package.json
│   └── .env.example
│
├── client/
│   ├── index.html              ← Full SPA shell
│   ├── style.css               ← Dark/light themes, all components
│   └── script.js               ← All client-side logic (600+ lines)
│
└── README.md
```

---

## Installation

```bash
# 1. Go to server directory
cd ai-learning-assistant-v2/server

# 2. Install dependencies
npm install

# 3. Set up environment
cp .env.example .env
# Edit .env — paste your Groq API key
```

---

## Environment Setup

Open `server/.env`:

```env
# Get your free key at https://console.groq.com
GROQ_API_KEY=gsk_your_groq_api_key_here

PORT=3000
NODE_ENV=development
```

---

## Running the App

```bash
# From server/ directory

# Production
npm start

# Development (auto-restart)
npm run dev
```

Then open: **http://localhost:3000**  
API Docs: **http://localhost:3000/docs**

---

## API Reference (Quick)

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/generate` | Generate AI response |
| `GET` | `/api/models` | List available models |
| `DELETE` | `/api/cache` | Clear response cache |
| `GET` | `/docs` | Full API documentation |

See **http://localhost:3000/docs** for full request/response schemas.

---

## Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `Ctrl+Enter` | Submit input |
| `Escape` | Close fullscreen modal |
| Click flashcard | Flip card |

---

## Browser Support

Chrome 90+, Firefox 90+, Edge 90+, Safari 15+  
Voice input requires Chrome or Edge (Web Speech API).

---

*AI Learning Assistant v2 · Node.js + Express + Groq (Llama 3.3 70B)*
