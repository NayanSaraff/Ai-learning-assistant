/**
 * AI Learning Assistant v2 — Complete Client Script
 * Features: all modes, difficulty, language, model selector, custom prompt,
 * follow-up chat, voice input, TTS, file upload, char warning, dark/light theme,
 * font size, fullscreen, typewriter, quiz scorer, flashcards, PDF export,
 * markdown export, copy, bookmark, rating, session history, persistent localStorage,
 * streak tracker, session stats, progress bar, pomodoro timer, response caching badge,
 * API docs link, sidebar toggle.
 */

"use strict";

/* ══════════════════════════════════════════════════════════════════
   CONSTANTS
══════════════════════════════════════════════════════════════════ */
// Hide preloader when page is ready
window.addEventListener("load", () => {
  const preloader = document.getElementById("preloader");
  setTimeout(() => {
    preloader.classList.add("hidden");
    setTimeout(() => preloader.remove(), 500);
  }, 1800);
});
const API_URL       = "/api/generate";
const DAILY_GOAL    = 10;
const CHAR_WARN     = 3000;
const CHAR_MAX      = 8000;

const FEATURE_LABELS = {
  explain:    "Explain Concept",
  summarize:  "Summarize",
  quiz:       "Quiz",
  eli5:       "ELI5",
  flashcards: "Flashcards",
  studyplan:  "Study Plan",
  mindmap:    "Mind Map",
  custom:     "Custom Prompt",
};

const FEATURE_SHORT_LABELS = {
  explain:    "Explain",
  summarize:  "Summarize",
  quiz:       "Quiz",
  eli5:       "ELI5",
  flashcards: "Flashcards",
  studyplan:  "Study Plan",
  mindmap:    "Mind Map",
  custom:     "Custom",
};

const FEATURE_ICONS = {
  explain:    "i",
  summarize:  "≡",
  quiz:       "?",
  eli5:       "5",
  flashcards: "□",
  studyplan:  "✓",
  mindmap:    "•",
  custom:     "*",
};

const POMO_TIPS = [
  "Stay focused. You've got this!",
  "Every expert was once a beginner.",
  "Small steps, big progress.",
  "You're building something great.",
  "Consistency beats intensity.",
  "Rest. Then come back stronger.",
  "Learning is the best investment.",
];

/* ══════════════════════════════════════════════════════════════════
   STATE
══════════════════════════════════════════════════════════════════ */
let currentFeature   = "explain";
let currentDifficulty= "intermediate";
let currentLanguage  = "en";
let currentModel     = "llama-3.3-70b-versatile";
let currentMarkdown  = "";
let sessionHistory   = [];
let bookmarks        = [];
let followupHistory  = [];  // [{role, content}]
let flashcards       = [];
let fcIndex          = 0;
let quizData         = [];
let quizScore        = 0;
let isSidebarOpen    = true;
let isTTSSpeaking    = false;
let isRecording      = false;
let recognition      = null;
let pomoInterval     = null;
let pomoSeconds      = 25 * 60;
let pomoRunning      = false;
let fontSize         = 15;

/* ══════════════════════════════════════════════════════════════════
   DOM REFS
══════════════════════════════════════════════════════════════════ */
const $ = (id) => document.getElementById(id);

const userInput       = $("userInput");
const submitBtn       = $("submitBtn");
const btnLabel        = $("btnLabel");
const btnSpinner      = $("btnSpinner");
const btnArrow        = $("btnArrow");
const errorMsg        = $("errorMsg");
const charCount       = $("charCount");
const charWarning     = $("charWarning");
const customPanel     = $("customPanel");
const customPromptInput=$("customPromptInput");
const resultCard      = $("resultCard");
const resultBody      = $("resultBody");
const resultBadge     = $("resultBadge");
const resultModel     = $("resultModel");
const cachedBadge     = $("cachedBadge");
const emptyState      = $("emptyState");
const skeleton        = $("skeleton");
const copyBtn         = $("copyBtn");
const copyMdBtn       = $("copyMdBtn");
const bookmarkBtn     = $("bookmarkBtn");
const rateUp          = $("rateUp");
const rateDown        = $("rateDown");
const historyList     = $("historyList");
const bookmarkList    = $("bookmarkList");
const clearHistory    = $("clearHistory");
const clearBookmarks  = $("clearBookmarks");
const sidebar         = $("sidebar");
const hamburger       = $("hamburger");
const overlay         = $("overlay");
const mainEl          = $("main");
const statusDot       = $("statusDot");
const statusTxt       = $("statusTxt");
const themeToggle     = $("themeToggle");
const fsDown          = $("fsDown");
const fsUp            = $("fsUp");
const ttsBtn          = $("ttsBtn");
const fullscreenBtn   = $("fullscreenBtn");
const exportPdfBtn    = $("exportPdfBtn");
const exportMdBtn     = $("exportMdBtn");
const fullscreenModal = $("fullscreenModal");
const fsClose         = $("fsClose");
const fsContent       = $("fsContent");
const voiceBtn        = $("voiceBtn");
const fileUpload      = $("fileUpload");
const followupSection = $("followupSection");
const followupThread  = $("followupThread");
const followupInput   = $("followupInput");
const followupSend    = $("followupSend");
const quizInteractive = $("quizInteractive");
const quizContainer   = $("quizContainer");
const quizScoreDisplay= $("quizScoreDisplay");
const flashcardView   = $("flashcardView");
const flashcard       = $("flashcard");
const fcInner         = $("fcInner");
const fcFront         = $("fcFront");
const fcBack          = $("fcBack");
const fcPrev          = $("fcPrev");
const fcNext          = $("fcNext");
const fcCounter       = $("fcCounter");
const statQueries     = $("statQueries");
const statChars       = $("statChars");
const statStreak      = $("statStreak");
const progressFill    = $("progressFill");
const progressPct     = $("progressPct");
const pomoFab         = $("pomoFab");
const pomodoroWidget  = $("pomodoroWidget");
const pomoClose       = $("pomoClose");
const pomoTime        = $("pomoTime");
const pomoStart       = $("pomoStart");
const pomoReset       = $("pomoReset");
const pomoTip         = $("pomoTip");
const clearCacheBtn   = $("clearCacheBtn");
const pillGroup       = $("pillGroup");
const diffCtrl        = $("diffCtrl");
const langSelect      = $("langSelect");
const modelSelect     = $("modelSelect");
const modeToggle      = $("modeToggle");
const optionsToggle   = $("optionsToggle");
const settingsToggle  = $("settingsToggle");
const currentModeIcon = $("currentModeIcon");
const currentModeLabel= $("currentModeLabel");

/* ══════════════════════════════════════════════════════════════════
   INIT — load persisted state
══════════════════════════════════════════════════════════════════ */
function init() {
  loadTheme();
  loadFontSize();
  loadPersistentHistory();
  loadBookmarks();
  updateStreak();
  updateStats();
  marked.setOptions({ breaks: true, gfm: true });
}
init();

/* ══════════════════════════════════════════════════════════════════
   THEME
══════════════════════════════════════════════════════════════════ */
function loadTheme() {
  const saved = localStorage.getItem("theme") || "dark";
  document.documentElement.dataset.theme = saved;
  themeToggle.textContent = saved === "dark" ? "☾" : "☀";
}
themeToggle.addEventListener("click", () => {
  const curr = document.documentElement.dataset.theme;
  const next = curr === "dark" ? "light" : "dark";
  document.documentElement.dataset.theme = next;
  themeToggle.textContent = next === "dark" ? "☾" : "☀";
  localStorage.setItem("theme", next);
});

/* ══════════════════════════════════════════════════════════════════
   FONT SIZE
══════════════════════════════════════════════════════════════════ */
function loadFontSize() {
  fontSize = parseInt(localStorage.getItem("fontSize") || "15");
  applyFontSize();
}
function applyFontSize() {
  document.documentElement.style.setProperty("--fs-base", fontSize + "px");
}
fsDown.addEventListener("click", () => { if (fontSize > 12) { fontSize--; applyFontSize(); localStorage.setItem("fontSize", fontSize); } });
fsUp.addEventListener("click",   () => { if (fontSize < 22) { fontSize++; applyFontSize(); localStorage.setItem("fontSize", fontSize); } });

/* ══════════════════════════════════════════════════════════════════
   MENUS
══════════════════════════════════════════════════════════════════ */
function closeDropdowns(except = null) {
  document.querySelectorAll(".dropdown.open").forEach((dropdown) => {
    if (dropdown === except) return;
    dropdown.classList.remove("open");
    const toggle = dropdown.querySelector("button[aria-expanded]");
    if (toggle) {
      toggle.classList.remove("active");
      toggle.setAttribute("aria-expanded", "false");
    }
  });
}

[modeToggle, optionsToggle, settingsToggle].forEach((toggle) => {
  if (!toggle) return;
  toggle.addEventListener("click", (event) => {
    event.stopPropagation();
    const dropdown = toggle.closest(".dropdown");
    const shouldOpen = !dropdown.classList.contains("open");
    closeDropdowns(dropdown);
    dropdown.classList.toggle("open", shouldOpen);
    toggle.classList.toggle("active", shouldOpen);
    toggle.setAttribute("aria-expanded", String(shouldOpen));
  });
});

document.addEventListener("click", (event) => {
  if (!event.target.closest(".dropdown")) closeDropdowns();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeDropdowns();
});

[clearHistory, clearBookmarks].forEach((btn) => {
  btn.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
  });
});

function updateModeButton(feature = currentFeature) {
  if (currentModeIcon) currentModeIcon.textContent = FEATURE_ICONS[feature] || "*";
  if (currentModeLabel) currentModeLabel.textContent = FEATURE_SHORT_LABELS[feature] || feature;
}

function setCurrentFeature(feature) {
  currentFeature = feature;
  customPanel.classList.toggle("visible", currentFeature === "custom");
  followupSection.style.display = "none";
  followupThread.innerHTML = "";
  followupHistory = [];
  updateModeButton(feature);
}

updateModeButton();

/* ══════════════════════════════════════════════════════════════════
   SIDEBAR
══════════════════════════════════════════════════════════════════ */
function applySidebar() {
  const isMobile = window.innerWidth <= 680;
  if (isMobile) {
    sidebar.classList.remove("hidden");
    if (isSidebarOpen) {
      sidebar.style.transform = "translateX(0)";
      overlay.classList.add("active");
    } else {
      sidebar.style.transform = "translateX(calc(-1 * var(--sidebar-w)))";
      overlay.classList.remove("active");
    }
    mainEl.style.marginLeft = "0";
  } else {
    overlay.classList.remove("active");
    sidebar.style.transform = isSidebarOpen ? "translateX(0)" : "translateX(calc(-1 * var(--sidebar-w)))";
    mainEl.style.marginLeft = isSidebarOpen ? "var(--sidebar-w)" : "0";
  }
}
hamburger.addEventListener("click", () => { isSidebarOpen = !isSidebarOpen; applySidebar(); });
overlay.addEventListener("click",   () => { isSidebarOpen = false; applySidebar(); });
window.addEventListener("resize",   applySidebar);
applySidebar();

/* ══════════════════════════════════════════════════════════════════
   FEATURE PILLS
══════════════════════════════════════════════════════════════════ */
pillGroup.querySelectorAll(".pill").forEach((pill) => {
  pill.addEventListener("click", () => {
    pillGroup.querySelectorAll(".pill").forEach((p) => p.classList.remove("active"));
    pill.classList.add("active");
    setCurrentFeature(pill.dataset.feature);
    closeDropdowns();
  });
});

/* ══════════════════════════════════════════════════════════════════
   DIFFICULTY
══════════════════════════════════════════════════════════════════ */
diffCtrl.querySelectorAll(".seg").forEach((seg) => {
  seg.addEventListener("click", () => {
    diffCtrl.querySelectorAll(".seg").forEach((s) => s.classList.remove("active"));
    seg.classList.add("active");
    currentDifficulty = seg.dataset.diff;
  });
});

/* ══════════════════════════════════════════════════════════════════
   LANGUAGE + MODEL
══════════════════════════════════════════════════════════════════ */
langSelect.addEventListener("change",  () => { currentLanguage = langSelect.value; });
modelSelect.addEventListener("change", () => { currentModel    = modelSelect.value; });

/* ══════════════════════════════════════════════════════════════════
   CHAR COUNT + WARNING
══════════════════════════════════════════════════════════════════ */
userInput.addEventListener("input", () => {
  const len = userInput.value.length;
  charCount.textContent = `${len.toLocaleString()} chars`;
  if (len > CHAR_MAX) {
    charWarning.textContent = `⚠ Input exceeds ${CHAR_MAX.toLocaleString()} characters. Please shorten.`;
  } else if (len > CHAR_WARN) {
    charWarning.textContent = `ℹ Long input (${len.toLocaleString()} chars) — response may be truncated.`;
  } else {
    charWarning.textContent = "";
  }
  if (len > 0) hideError();
});

/* ══════════════════════════════════════════════════════════════════
   VOICE INPUT
══════════════════════════════════════════════════════════════════ */
if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  recognition = new SR();
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.onresult = (e) => {
    userInput.value += (userInput.value ? " " : "") + e.results[0][0].transcript;
    userInput.dispatchEvent(new Event("input"));
  };
  recognition.onend = () => {
    isRecording = false;
    voiceBtn.classList.remove("recording");
    voiceBtn.title = "Voice input";
  };
  recognition.onerror = () => {
    isRecording = false;
    voiceBtn.classList.remove("recording");
  };
  voiceBtn.addEventListener("click", () => {
    if (isRecording) {
      recognition.stop();
    } else {
      recognition.lang = langSelect.value === "hi" ? "hi-IN" : langSelect.value === "es" ? "es-ES" : "en-US";
      recognition.start();
      isRecording = true;
      voiceBtn.classList.add("recording");
      voiceBtn.title = "Recording… click to stop";
    }
  });
} else {
  voiceBtn.title = "Voice input not supported in this browser";
  voiceBtn.style.opacity = ".4";
  voiceBtn.disabled = true;
}

/* ══════════════════════════════════════════════════════════════════
   FILE UPLOAD
══════════════════════════════════════════════════════════════════ */
fileUpload.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;
  if (file.size > 500_000) { showError("File too large. Max 500KB."); return; }
  const reader = new FileReader();
  reader.onload = (ev) => {
    userInput.value = ev.target.result.slice(0, CHAR_MAX);
    userInput.dispatchEvent(new Event("input"));
  };
  reader.readAsText(file);
  fileUpload.value = "";
});

/* ══════════════════════════════════════════════════════════════════
   STATUS HELPERS
══════════════════════════════════════════════════════════════════ */
function setStatus(state, text) {
  statusDot.className = "status-dot";
  if (state === "loading") { statusDot.classList.add("loading"); statusTxt.textContent = text || "Thinking…"; }
  else if (state === "error") { statusDot.classList.add("error"); statusTxt.textContent = text || "Error"; }
  else { statusTxt.textContent = text || "Ready"; }
}

function showError(msg) {
  errorMsg.textContent = msg;
  errorMsg.classList.add("visible");
}
function hideError() {
  errorMsg.classList.remove("visible");
}

/* ══════════════════════════════════════════════════════════════════
   UI STATES
══════════════════════════════════════════════════════════════════ */
let progressInterval = null;

function startProgress() {
  const wrap = document.getElementById("progressBarWrap");
  const fill = document.getElementById("progressBarFill");
  const pct  = document.getElementById("progressBarPct");

  // Remove old inner bar if exists
  const old = document.getElementById("progressInner");
  if (old) old.remove();

  // Create fresh inner bar
  const bar = document.createElement("div");
  bar.id = "progressInner";
  bar.style.cssText = "position:absolute;inset:0;width:0%;background:var(--accent);border-radius:inherit;transition:width 0.15s ease;";
  fill.appendChild(bar);

  pct.textContent = "0%";
  wrap.classList.add("active");

  let current = 0;
  clearInterval(progressInterval);
  progressInterval = setInterval(() => {
    const increment = current < 30 ? 4 : current < 60 ? 3 : current < 80 ? 2 : current < 90 ? 0.5 : 0;
    current = Math.min(current + increment, 90);
    bar.style.width = current + "%";
    pct.textContent = Math.round(current) + "%";
  }, 120);
}

function stopProgress() {
  clearInterval(progressInterval);
  const wrap = document.getElementById("progressBarWrap");
  const fill = document.getElementById("progressBarFill");
  const pct  = document.getElementById("progressBarPct");
  const bar  = fill.querySelector("#progressInner");
  if (bar) {
    bar.style.width = "100%";
    pct.textContent = "100%";
  }
  setTimeout(() => {
    wrap.classList.remove("active");
    if (bar) bar.style.width = "0%";
    pct.textContent = "0%";
  }, 400);
}
function showLoading() {
  emptyState.style.display = "none";
  resultCard.classList.remove("active");
  skeleton.classList.add("active");
  submitBtn.classList.add("loading");
  submitBtn.disabled = true;
  [ttsBtn, fullscreenBtn, exportPdfBtn, exportMdBtn].forEach((b) => b.disabled = true);
  setStatus("loading");
  startProgress();
}

function showResult(html, md, feature, modelId, cached) {
  stopProgress();
  skeleton.classList.remove("active");

  resultBadge.textContent  = FEATURE_LABELS[feature] || feature;
  resultModel.textContent  = modelId || "";
  cachedBadge.style.display= cached ? "inline" : "none";
  currentMarkdown          = md;

  // Hide special views by default
  quizInteractive.style.display  = "none";
  flashcardView.style.display    = "none";
  resultBody.style.display       = "block";

  if (feature === "flashcards") {
    buildFlashcards(md);
  } else if (feature === "quiz") {
    buildQuizInteractive(md);
    resultBody.innerHTML = html; // also show raw below
  } else {
    resultBody.innerHTML = html;
  }

  resultCard.classList.add("active");
  submitBtn.classList.remove("loading");
  submitBtn.disabled = false;
  [ttsBtn, fullscreenBtn, exportPdfBtn, exportMdBtn].forEach((b) => b.disabled = false);
  setStatus("ready");

  // Show follow-up section
  followupSection.style.display = "block";
}

function showResultError(msg) {
  stopProgress();
  skeleton.classList.remove("active");
  resultBadge.textContent = "Error";
  resultModel.textContent = "";
  cachedBadge.style.display = "none";
  quizInteractive.style.display = "none";
  flashcardView.style.display   = "none";
  resultBody.style.display      = "block";
  resultBody.innerHTML = `<p style="color:var(--error)">⚠ ${escapeHtml(msg)}</p>`;
  resultCard.classList.add("active");
  submitBtn.classList.remove("loading");
  submitBtn.disabled = false;
  setStatus("error");
  setTimeout(() => setStatus("ready"), 4000);
}

/* ══════════════════════════════════════════════════════════════════
   MAIN SUBMIT
══════════════════════════════════════════════════════════════════ */
async function handleSubmit() {
  const text = userInput.value.trim();
  if (!text || text.length < 3) { showError("Please enter at least 3 characters."); userInput.focus(); return; }
  if (text.length > CHAR_MAX)   { showError(`Input too long (max ${CHAR_MAX.toLocaleString()} chars).`); return; }
  hideError();
  showLoading();

  // Reset follow-up thread on new submission
  followupThread.innerHTML = "";
  followupHistory = [];
    await new Promise(r => setTimeout(r, 800));

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        feature:      currentFeature,
        text,
        difficulty:   currentDifficulty,
        language:     currentLanguage,
        model:        currentModel,
        customPrompt: currentFeature === "custom" ? customPromptInput.value.trim() : undefined,
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || `Error ${res.status}`);

    const md   = data.result || "";
    const html = marked.parse(md);

    showResult(html, md, currentFeature, data.model, data.cached);
    addToHistory(currentFeature, text, md);
    incrementStats(text.length);

  } catch (err) {
    showResultError(err.message || "Unexpected error.");
  }
}

submitBtn.addEventListener("click", handleSubmit);
userInput.addEventListener("keydown", (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === "Enter") handleSubmit();
});

/* ══════════════════════════════════════════════════════════════════
   FOLLOW-UP CHAT
══════════════════════════════════════════════════════════════════ */
async function sendFollowup() {
  const q = followupInput.value.trim();
  if (!q) return;
  followupInput.value = "";

  appendFollowupMsg("user", q);
  followupHistory.push({ role: "user", content: q });

  const thinking = appendFollowupMsg("ai", "…");

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        feature: "chat",
        messages: followupHistory,
        model: currentModel,
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Error");

    const md = data.result || "";
    thinking.innerHTML = marked.parse(md);
    followupHistory.push({ role: "assistant", content: md });

  } catch (err) {
    thinking.textContent = "⚠ " + err.message;
    thinking.style.color = "var(--error)";
    followupHistory.pop();
  }
}

function appendFollowupMsg(role, text) {
  const div = document.createElement("div");
  div.className = `fu-msg ${role}`;
  div.innerHTML = role === "ai" ? text : escapeHtml(text);
  followupThread.appendChild(div);
  followupThread.scrollTop = followupThread.scrollHeight;
  return div;
}

followupSend.addEventListener("click", sendFollowup);
followupInput.addEventListener("keydown", (e) => { if (e.key === "Enter") sendFollowup(); });

/* ══════════════════════════════════════════════════════════════════
   FLASHCARDS
══════════════════════════════════════════════════════════════════ */
function buildFlashcards(md) {
  // Parse "**Q:** ... | **A:** ..." lines
  flashcards = [];
  const lines = md.split("\n");
  for (const line of lines) {
    if (line.includes("|")) {
      const parts = line.split("|").map((s) => s.replace(/\*\*/g, "").replace(/^Q:|^A:/gi, "").trim());
      if (parts.length >= 2 && parts[0] && parts[1]) {
        flashcards.push({ q: parts[0], a: parts[1] });
      }
    }
  }

  if (flashcards.length === 0) {
    // Fallback: show markdown
    resultBody.innerHTML = marked.parse(md);
    return;
  }

  fcIndex = 0;
  flashcardView.style.display = "block";
  resultBody.style.display    = "none";
  renderFlashcard();
}

function renderFlashcard() {
  const card = flashcards[fcIndex];
  fcFront.innerHTML = escapeHtml(card.q);
  fcBack.innerHTML  = escapeHtml(card.a);
  flashcard.classList.remove("flipped");
  fcCounter.textContent = `${fcIndex + 1} / ${flashcards.length}`;
  fcPrev.disabled = fcIndex === 0;
  fcNext.disabled = fcIndex === flashcards.length - 1;
}

window.flipCard = () => flashcard.classList.toggle("flipped");
fcPrev.addEventListener("click", () => { if (fcIndex > 0) { fcIndex--; renderFlashcard(); } });
fcNext.addEventListener("click", () => { if (fcIndex < flashcards.length - 1) { fcIndex++; renderFlashcard(); } });

/* ══════════════════════════════════════════════════════════════════
   QUIZ INTERACTIVE
══════════════════════════════════════════════════════════════════ */
function buildQuizInteractive(md) {
  quizData  = [];
  quizScore = 0;

  // Parse Q/A blocks: **Q1: ...** / **A:** ...
  const blocks = md.split(/(?=\*\*Q\d+:)/);
  for (const block of blocks) {
    const qMatch = block.match(/\*\*Q\d+:\s*(.+?)\*\*/s);
    const aMatch = block.match(/\*\*A:\*\*\s*(.+)/s);
    if (qMatch && aMatch) {
      quizData.push({ q: qMatch[1].trim(), a: aMatch[1].trim() });
    }
  }

  if (quizData.length === 0) return;

  quizInteractive.style.display = "block";
  quizScoreDisplay.textContent  = `Score: 0 / ${quizData.length}`;
  quizContainer.innerHTML       = "";

  quizData.forEach((item, idx) => {
    const qDiv = document.createElement("div");
    qDiv.className = "quiz-q";
    qDiv.innerHTML = `
      <div class="quiz-q-text">Q${idx + 1}: ${escapeHtml(item.q)}</div>
      <div class="quiz-options">
        <button class="quiz-opt" data-idx="${idx}" data-mode="show">👁 Show Answer</button>
      </div>
      <div class="quiz-answer" id="qa-${idx}">${escapeHtml(item.a)}</div>
    `;
    qDiv.querySelector(".quiz-opt").addEventListener("click", (e) => {
      const answerEl = $(`qa-${idx}`);
      answerEl.classList.toggle("visible");
      e.target.textContent = answerEl.classList.contains("visible") ? "🙈 Hide Answer" : "👁 Show Answer";
    });
    quizContainer.appendChild(qDiv);
  });
}

/* ══════════════════════════════════════════════════════════════════
   COPY
══════════════════════════════════════════════════════════════════ */
async function copyText(text, btn, label) {
  try {
    await navigator.clipboard.writeText(text);
    const orig = btn.textContent;
    btn.textContent = label || "✓ Copied!";
    btn.classList.add("active");
    setTimeout(() => { btn.textContent = orig; btn.classList.remove("active"); }, 2000);
  } catch { btn.textContent = "Failed"; setTimeout(() => { btn.textContent = "⎘ Copy"; }, 1500); }
}

copyBtn.addEventListener("click",   () => copyText(resultBody.innerText, copyBtn, "✓ Copied!"));
copyMdBtn.addEventListener("click", () => copyText(currentMarkdown, copyMdBtn, "✓ MD Copied!"));

/* ══════════════════════════════════════════════════════════════════
   RATING
══════════════════════════════════════════════════════════════════ */
rateUp.addEventListener("click",   () => { rateUp.classList.toggle("active"); rateDown.classList.remove("active"); });
rateDown.addEventListener("click", () => { rateDown.classList.toggle("active"); rateUp.classList.remove("active"); });

/* ══════════════════════════════════════════════════════════════════
   BOOKMARKS
══════════════════════════════════════════════════════════════════ */
function loadBookmarks() {
  try { bookmarks = JSON.parse(localStorage.getItem("bookmarks") || "[]"); } catch { bookmarks = []; }
  renderBookmarks();
}

function renderBookmarks() {
  if (bookmarks.length === 0) {
    bookmarkList.innerHTML = `<p class="history-empty">No bookmarks yet.<br/>Star a response to save it.</p>`;
    return;
  }
  bookmarkList.innerHTML = "";
  bookmarks.slice().reverse().forEach((b, i) => {
    const el = document.createElement("div");
    el.className = "history-item";
    el.innerHTML = `<div class="h-badge">⭐ ${FEATURE_LABELS[b.feature] || b.feature}</div>
      <div class="h-text">${escapeHtml(b.text.slice(0, 60))}…</div>
      <div class="h-time">${b.time}</div>`;
    el.addEventListener("click", () => {
      document.querySelectorAll(".history-item.active").forEach((item) => item.classList.remove("active"));
      el.classList.add("active");
      resultBody.innerHTML = marked.parse(b.result);
      resultBadge.textContent = FEATURE_LABELS[b.feature] || b.feature;
      resultCard.classList.add("active");
      emptyState.style.display = "none";
      currentMarkdown = b.result;
      [ttsBtn, fullscreenBtn, exportPdfBtn, exportMdBtn].forEach((btn) => btn.disabled = false);
    });
    bookmarkList.appendChild(el);
  });
}

bookmarkBtn.addEventListener("click", () => {
  if (!currentMarkdown) return;
  const entry = {
    feature: resultBadge.textContent,
    text:    userInput.value.slice(0, 80),
    result:  currentMarkdown,
    time:    timeStr(),
  };
  bookmarks.unshift(entry);
  if (bookmarks.length > 20) bookmarks.pop();
  localStorage.setItem("bookmarks", JSON.stringify(bookmarks));
  renderBookmarks();
  bookmarkBtn.textContent = "★ Saved!";
  bookmarkBtn.classList.add("active");
  setTimeout(() => { bookmarkBtn.textContent = "Save"; bookmarkBtn.classList.remove("active"); }, 1500);
});

clearBookmarks.addEventListener("click", () => {
  bookmarks = [];
  localStorage.removeItem("bookmarks");
  renderBookmarks();
});

/* ══════════════════════════════════════════════════════════════════
   HISTORY (session + persistent)
══════════════════════════════════════════════════════════════════ */
function loadPersistentHistory() {
  try { sessionHistory = JSON.parse(localStorage.getItem("history") || "[]"); } catch { sessionHistory = []; }
  renderHistory();
}

function addToHistory(feature, text, result) {
  const entry = { feature, text, result, time: timeStr() };
  sessionHistory.unshift(entry);
  if (sessionHistory.length > 30) sessionHistory.pop();
  localStorage.setItem("history", JSON.stringify(sessionHistory));
  renderHistory();
}

function renderHistory() {
  if (sessionHistory.length === 0) {
    historyList.innerHTML = `<p class="history-empty">No history yet.<br/>Queries appear here.</p>`;
    return;
  }
  historyList.innerHTML = "";
  sessionHistory.forEach((entry) => {
    const el = document.createElement("div");
    el.className = "history-item";
    el.innerHTML = `<div class="h-badge">${FEATURE_LABELS[entry.feature] || entry.feature}</div>
      <div class="h-text">${escapeHtml(entry.text.slice(0, 55))}${entry.text.length > 55 ? "…" : ""}</div>
      <div class="h-time">${entry.time}</div>`;
    el.addEventListener("click", () => {
      document.querySelectorAll(".history-item.active").forEach((item) => item.classList.remove("active"));
      el.classList.add("active");
      const html = marked.parse(entry.result);
      userInput.value = entry.text;
      userInput.dispatchEvent(new Event("input"));
      showResult(html, entry.result, entry.feature, null, false);
      // Select matching pill
      pillGroup.querySelectorAll(".pill").forEach((p) => {
        p.classList.toggle("active", p.dataset.feature === entry.feature);
      });
      currentFeature = entry.feature;
      customPanel.classList.toggle("visible", currentFeature === "custom");
      updateModeButton(entry.feature);
      if (window.innerWidth <= 680) { isSidebarOpen = false; applySidebar(); }
    });
    historyList.appendChild(el);
  });
}

clearHistory.addEventListener("click", () => {
  sessionHistory = [];
  localStorage.removeItem("history");
  renderHistory();
});

/* ══════════════════════════════════════════════════════════════════
   STATS + STREAK + PROGRESS
══════════════════════════════════════════════════════════════════ */
function incrementStats(charsUsed) {
  const today = todayKey();
  const data  = JSON.parse(localStorage.getItem("stats") || "{}");
  data[today] = data[today] || { queries: 0, chars: 0 };
  data[today].queries++;
  data[today].chars += charsUsed;
  // Trim old days (keep 30)
  const keys = Object.keys(data).sort().slice(-30);
  const trimmed = {};
  keys.forEach((k) => { trimmed[k] = data[k]; });
  localStorage.setItem("stats", JSON.stringify(trimmed));
  updateStats();
  updateStreak();
}

function updateStats() {
  const today = todayKey();
  const data  = JSON.parse(localStorage.getItem("stats") || "{}");
  const todayData = data[today] || { queries: 0, chars: 0 };
  const totalQ = Object.values(data).reduce((s, d) => s + (d.queries || 0), 0);
  const totalC = Object.values(data).reduce((s, d) => s + (d.chars   || 0), 0);
  statQueries.textContent = totalQ;
  statChars.textContent   = totalC > 999 ? (totalC / 1000).toFixed(1) + "k" : totalC;

  const pct = Math.min(100, Math.round((todayData.queries / DAILY_GOAL) * 100));
  progressFill.style.width = pct + "%";
  progressPct.textContent  = pct + "%";
}

function updateStreak() {
  const data   = JSON.parse(localStorage.getItem("stats") || "{}");
  const keys   = Object.keys(data).sort().reverse();
  let streak   = 0;
  let checkDay = new Date();
  for (const key of keys) {
    const d = checkDay.toISOString().slice(0, 10);
    if (key === d && data[key].queries > 0) {
      streak++;
      checkDay.setDate(checkDay.getDate() - 1);
    } else if (streak === 0 && key < d) {
      break;
    } else {
      break;
    }
  }
  statStreak.textContent = `${streak}d`;
}

/* ══════════════════════════════════════════════════════════════════
   TTS
══════════════════════════════════════════════════════════════════ */
ttsBtn.addEventListener("click", () => {
  if (!currentMarkdown) return;
  if (isTTSSpeaking) {
    window.speechSynthesis.cancel();
    isTTSSpeaking = false;
    ttsBtn.textContent = "♪";
    return;
  }
  const text = resultBody.innerText;
  const utt  = new SpeechSynthesisUtterance(text);
  utt.lang = langSelect.value === "hi" ? "hi-IN" : langSelect.value === "es" ? "es-ES" : "en-US";
  utt.rate = 0.95;
  utt.onend = () => { isTTSSpeaking = false; ttsBtn.textContent = "♪"; };
  window.speechSynthesis.speak(utt);
  isTTSSpeaking = true;
  ttsBtn.textContent = "■";
});

/* ══════════════════════════════════════════════════════════════════
   FULLSCREEN
══════════════════════════════════════════════════════════════════ */
fullscreenBtn.addEventListener("click", () => {
  fsContent.innerHTML = marked.parse(currentMarkdown);
  fullscreenModal.classList.add("active");
  document.body.style.overflow = "hidden";
});
fsClose.addEventListener("click", () => {
  fullscreenModal.classList.remove("active");
  document.body.style.overflow = "";
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && fullscreenModal.classList.contains("active")) {
    fullscreenModal.classList.remove("active");
    document.body.style.overflow = "";
  }
});

/* ══════════════════════════════════════════════════════════════════
   PDF EXPORT
══════════════════════════════════════════════════════════════════ */
exportPdfBtn.addEventListener("click", async () => {
  if (!currentMarkdown) return;
  exportPdfBtn.textContent = "Generating...";
  exportPdfBtn.disabled = true;

  try {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ orientation: "p", unit: "mm", format: "a4" });

    const lines  = currentMarkdown.split("\n");
    let y        = 20;
    const margin = 15;
    const pw     = 210 - margin * 2;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(99, 102, 241);
    doc.text("AI Learning Assistant", margin, y);
    y += 8;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text(`Mode: ${FEATURE_LABELS[currentFeature] || currentFeature}  |  ${new Date().toLocaleDateString()}`, margin, y);
    y += 10;

    doc.setDrawColor(99, 102, 241);
    doc.setLineWidth(0.3);
    doc.line(margin, y, 210 - margin, y);
    y += 8;

    for (const line of lines) {
      if (y > 270) { doc.addPage(); y = 20; }

      const clean = line.replace(/\*\*/g, "").replace(/^#+\s*/, "").replace(/^[-*]\s/, "• ").trim();
      if (!clean) { y += 4; continue; }

      if (line.startsWith("# ")) {
        doc.setFont("helvetica", "bold"); doc.setFontSize(14); doc.setTextColor(99, 102, 241);
      } else if (line.startsWith("## ")) {
        doc.setFont("helvetica", "bold"); doc.setFontSize(12); doc.setTextColor(79, 70, 229);
      } else if (line.startsWith("### ")) {
        doc.setFont("helvetica", "bold"); doc.setFontSize(11); doc.setTextColor(67, 56, 202);
      } else {
        doc.setFont("helvetica", "normal"); doc.setFontSize(10); doc.setTextColor(50, 45, 40);
      }

      const wrapped = doc.splitTextToSize(clean, pw);
      doc.text(wrapped, margin, y);
      y += wrapped.length * 5 + 2;
    }

    doc.save(`learning-assistant-${currentFeature}-${todayKey()}.pdf`);
  } catch (err) {
    console.error("PDF error:", err);
    alert("PDF generation failed. Try exporting as Markdown instead.");
  }

  exportPdfBtn.textContent = "PDF";
  exportPdfBtn.disabled = false;
});

/* ══════════════════════════════════════════════════════════════════
   MARKDOWN EXPORT
══════════════════════════════════════════════════════════════════ */
exportMdBtn.addEventListener("click", () => {
  if (!currentMarkdown) return;
  const blob = new Blob([
    `# AI Learning Assistant — ${FEATURE_LABELS[currentFeature] || currentFeature}\n\n` +
    `> Generated: ${new Date().toLocaleString()}\n\n` +
    currentMarkdown
  ], { type: "text/markdown" });
  const url = URL.createObjectURL(blob);
  const a   = document.createElement("a");
  a.href = url; a.download = `learning-${currentFeature}-${todayKey()}.md`;
  a.click();
  URL.revokeObjectURL(url);
});

/* ══════════════════════════════════════════════════════════════════
   CLEAR SERVER CACHE
══════════════════════════════════════════════════════════════════ */
clearCacheBtn.addEventListener("click", async () => {
  try {
    await fetch("/api/cache", { method: "DELETE" });
    clearCacheBtn.textContent = "Cleared";
    setTimeout(() => { clearCacheBtn.textContent = "Clear Cache"; }, 2000);
  } catch { clearCacheBtn.textContent = "Failed"; setTimeout(() => { clearCacheBtn.textContent = "Clear Cache"; }, 2000); }
});

/* ══════════════════════════════════════════════════════════════════
   POMODORO TIMER
══════════════════════════════════════════════════════════════════ */
function formatPomo(s) {
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}
function renderPomo() { pomoTime.textContent = formatPomo(pomoSeconds); }

pomoFab.addEventListener("click", () => { pomodoroWidget.classList.toggle("active"); });
pomoClose.addEventListener("click", () => { pomodoroWidget.classList.remove("active"); });

pomoStart.addEventListener("click", () => {
  if (pomoRunning) {
    clearInterval(pomoInterval);
    pomoRunning = false;
    pomoStart.textContent = "▶ Start";
    pomoStart.classList.remove("running");
  } else {
    pomoRunning = true;
    pomoStart.textContent = "⏸ Pause";
    pomoStart.classList.add("running");
    pomoInterval = setInterval(() => {
      if (pomoSeconds <= 0) {
        clearInterval(pomoInterval);
        pomoRunning = false;
        pomoStart.textContent = "▶ Start";
        pomoStart.classList.remove("running");
        pomoTip.textContent = "🎉 Session complete! Take a break.";
        pomoSeconds = 25 * 60;
        renderPomo();
        // Show random tip
        setTimeout(() => { pomoTip.textContent = POMO_TIPS[Math.floor(Math.random() * POMO_TIPS.length)]; }, 3000);
      } else {
        pomoSeconds--;
        renderPomo();
        if (pomoSeconds === 300) pomoTip.textContent = "⏰ 5 minutes left!";
        if (pomoSeconds === 60)  pomoTip.textContent = "💪 Last minute — push through!";
      }
    }, 1000);
  }
});

pomoReset.addEventListener("click", () => {
  clearInterval(pomoInterval);
  pomoRunning = false;
  pomoSeconds = 25 * 60;
  renderPomo();
  pomoStart.textContent = "▶ Start";
  pomoStart.classList.remove("running");
  pomoTip.textContent = POMO_TIPS[Math.floor(Math.random() * POMO_TIPS.length)];
});
renderPomo();

/* ══════════════════════════════════════════════════════════════════
   UTILITIES
══════════════════════════════════════════════════════════════════ */
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function timeStr() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}
