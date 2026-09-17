/* English Adventure — Mi Comunidad
   Juego de práctica bilingüe (es/en) con voz para tercer grado. */

const $ = (id) => document.getElementById(id);

const els = {
  startScreen: $("start-screen"), gameScreen: $("game-screen"), endScreen: $("end-screen"),
  topicButtons: document.querySelectorAll(".subject-option"),
  questionCount: $("question-count"), startBtn: $("start-btn"),
  score: $("score"), streak: $("streak"), progressLabel: $("progress-label"), progressBar: $("progress-bar"),
  exitBtn: $("exit-btn"), topicBadge: $("topic-badge"), voiceToggle: $("voice-toggle"),
  questionVisual: $("question-visual"), activityLabel: $("activity-label"),
  questionText: $("question-text"), questionTranslation: $("question-translation"),
  listenBtn: $("listen-btn"), answers: $("answers"),
  feedback: $("feedback"), feedbackIcon: $("feedback-icon"), feedbackTitle: $("feedback-title"), feedbackText: $("feedback-text"),
  nextBtn: $("next-btn"),
  finalScore: $("final-score"), finalCorrect: $("final-correct"), finalStreak: $("final-streak"),
  endMessage: $("end-message"), reviewList: $("review-list"),
  retryBtn: $("retry-btn"), homeBtn: $("home-btn")
};

const state = {
  topic: "Todos", questions: [], index: 0, score: 0, streak: 0, bestStreak: 0,
  correctCount: 0, answered: false, voiceEnabled: true, wrongAnswers: []
};

const CHEERS_EN = ["Great job!", "Excellent!", "Awesome!", "Perfect!", "Well done!", "Fantastic!"];
const CHEERS_ES = ["¡Muy bien!", "¡Excelente!", "¡Genial!", "¡Perfecto!", "¡Buenísimo!", "¡Qué tigre!"];

/* ---------- voz ---------- */
function pickVoice(langPrefix) {
  const voices = window.speechSynthesis ? window.speechSynthesis.getVoices() : [];
  const lower = (v) => v.lang.toLowerCase();
  if (langPrefix === "es") {
    return voices.find((v) => lower(v) === "es-cr")
        || voices.find((v) => lower(v).startsWith("es-mx") || lower(v).startsWith("es-us"))
        || voices.find((v) => lower(v).startsWith("es")) || null;
  }
  return voices.find((v) => lower(v).startsWith("en-us"))
      || voices.find((v) => lower(v).startsWith("en")) || null;
}

function speak(parts, onEnd) {
  // parts: [{ text, lang }]
  if (!state.voiceEnabled || !("speechSynthesis" in window)) { if (onEnd) onEnd(); return; }
  window.speechSynthesis.cancel();
  let remaining = parts.length;
  parts.forEach((part) => {
    const u = new SpeechSynthesisUtterance(part.text);
    u.lang = part.lang === "es" ? "es-CR" : "en-US";
    u.rate = 0.85;
    u.pitch = 1.05;
    u.voice = pickVoice(part.lang);
    u.onend = () => { remaining -= 1; if (remaining === 0 && onEnd) onEnd(); };
    window.speechSynthesis.speak(u);
  });
}

function stopSpeaking() {
  if ("speechSynthesis" in window) window.speechSynthesis.cancel();
  els.listenBtn.classList.remove("speaking");
}

/* ---------- flujo ---------- */
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function startGame() {
  const pool = state.topic === "Todos"
    ? QUESTION_BANK
    : QUESTION_BANK.filter((q) => q.topic === state.topic);
  const countVal = els.questionCount.value;
  const count = countVal === "all" ? pool.length : Math.min(Number(countVal), pool.length);
  state.questions = shuffle(pool).slice(0, count);
  state.index = 0; state.score = 0; state.streak = 0; state.bestStreak = 0;
  state.correctCount = 0; state.wrongAnswers = [];
  showScreen("game");
  renderQuestion();
  speak([{ text: "¡Vamos a practicar inglés! Escuchá con atención.", lang: "es" }]);
}

function showScreen(name) {
  stopSpeaking();
  [els.startScreen, els.gameScreen, els.endScreen].forEach((s) => s.classList.remove("active"));
  ({ start: els.startScreen, game: els.gameScreen, end: els.endScreen })[name].classList.add("active");
}

function renderQuestion() {
  const q = state.questions[state.index];
  state.answered = false;

  const info = TOPIC_INFO[q.topic];
  els.topicBadge.textContent = info.label;
  els.topicBadge.style.background = info.color;
  els.questionVisual.textContent = q.visual;
  els.questionText.textContent = q.q;
  els.questionTranslation.textContent = q.t;
  els.progressLabel.textContent = `Reto ${state.index + 1} de ${state.questions.length}`;
  els.progressBar.style.width = `${(state.index / state.questions.length) * 100}%`;
  els.score.textContent = `⭐ ${state.score}`;
  els.streak.textContent = `${state.streak} 🔥`;

  els.feedback.classList.add("hidden");
  els.feedback.classList.remove("good", "bad");
  els.nextBtn.classList.add("hidden");

  els.answers.innerHTML = "";
  const order = shuffle(q.options.map((text, i) => ({ text, i })));
  order.forEach(({ text, i }) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "answer-btn";
    btn.textContent = text;
    btn.addEventListener("click", () => answer(btn, i === q.correct));
    els.answers.appendChild(btn);
  });

  // Leer la pregunta automáticamente (inglés)
  speakQuestion();
}

function speakQuestion() {
  const q = state.questions[state.index];
  els.listenBtn.classList.add("speaking");
  speak([{ text: q.speak, lang: "en" }], () => els.listenBtn.classList.remove("speaking"));
}

function answer(btn, isCorrect) {
  if (state.answered) return;
  state.answered = true;
  const q = state.questions[state.index];

  document.querySelectorAll(".answer-btn").forEach((b, idx) => {
    b.disabled = true;
    if (b.textContent === q.options[q.correct]) b.classList.add("correct");
  });

  if (isCorrect) {
    state.score += 10 + state.streak * 2;
    state.streak += 1;
    state.bestStreak = Math.max(state.bestStreak, state.streak);
    state.correctCount += 1;
    const cheerEn = CHEERS_EN[Math.floor(Math.random() * CHEERS_EN.length)];
    const cheerEs = CHEERS_ES[Math.floor(Math.random() * CHEERS_ES.length)];
    showFeedback(true, `${cheerEn} ${cheerEs}`, q.explain);
    speak([{ text: cheerEn, lang: "en" }, { text: cheerEs, lang: "es" }]);
  } else {
    btn.classList.add("wrong");
    state.streak = 0;
    state.wrongAnswers.push(q);
    showFeedback(false, "¡Casi! La respuesta era: " + q.options[q.correct].replace(/[^\p{L}\p{N} .,'?¿!-]/gu, "").trim(), q.explain);
    speak([
      { text: "Oops! The correct answer is: " + stripEmoji(q.options[q.correct]), lang: "en" },
      { text: q.explain, lang: "es" }
    ]);
  }

  els.score.textContent = `⭐ ${state.score}`;
  els.streak.textContent = `${state.streak} 🔥`;
  els.progressBar.style.width = `${((state.index + 1) / state.questions.length) * 100}%`;
  els.nextBtn.classList.remove("hidden");
  els.nextBtn.focus();
}

function stripEmoji(text) {
  return text.replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}\u{2B00}-\u{2BFF}]/gu, "").replace(/\s+/g, " ").trim();
}

function showFeedback(good, title, text) {
  els.feedback.classList.remove("hidden");
  els.feedback.classList.add(good ? "good" : "bad");
  els.feedbackIcon.textContent = good ? "🌟" : "🦉";
  els.feedbackTitle.textContent = title;
  els.feedbackText.textContent = text;
}

function nextQuestion() {
  stopSpeaking();
  state.index += 1;
  if (state.index >= state.questions.length) return endGame();
  renderQuestion();
}

function endGame() {
  showScreen("end");
  els.finalScore.textContent = `⭐ ${state.score}`;
  els.finalCorrect.textContent = `${state.correctCount}/${state.questions.length}`;
  els.finalStreak.textContent = `${state.bestStreak} 🔥`;

  const pct = state.correctCount / state.questions.length;
  let msg, spoken;
  if (pct === 1) { msg = "¡PERFECTO! You are a super star! 🌟 Estás más que listo para el examen."; spoken = "Perfect score! ¡Puntaje perfecto! Estás listo para el examen."; }
  else if (pct >= 0.8) { msg = "Excellent! ¡Excelente! Ya casi dominás todo. Repasá los retos de abajo y sos imparable."; spoken = "Excellent! ¡Excelente trabajo! Ya casi lo dominás todo."; }
  else if (pct >= 0.5) { msg = "Good job! ¡Buen trabajo! Vamos por buen camino. Practicá otra vez los retos que fallaste."; spoken = "Good job! ¡Buen trabajo! Practicá una vez más y vas a mejorar."; }
  else { msg = "¡Ánimo! Practicing makes you better. Jugá otra vez y vas a ver cómo mejorás. 💪"; spoken = "¡Ánimo! Si practicás otra vez, lo vas a lograr. You can do it!"; }
  els.endMessage.textContent = msg;

  els.reviewList.innerHTML = "";
  if (state.wrongAnswers.length) {
    const title = document.createElement("p");
    title.innerHTML = "<strong>🦉 Buho dice: repasá estos retos</strong>";
    title.style.textAlign = "center";
    els.reviewList.appendChild(title);
    state.wrongAnswers.forEach((q) => {
      const item = document.createElement("div");
      item.className = "review-item";
      item.innerHTML = `<strong>${q.q}</strong> Respuesta: <em>${q.options[q.correct]}</em><br>${q.explain}`;
      els.reviewList.appendChild(item);
    });
  }
  speak([{ text: spoken, lang: "es" }]);
}

function toggleVoice() {
  state.voiceEnabled = !state.voiceEnabled;
  els.voiceToggle.setAttribute("aria-pressed", String(state.voiceEnabled));
  els.voiceToggle.textContent = state.voiceEnabled ? "🔊 Voz" : "🔇 Voz";
  if (!state.voiceEnabled) stopSpeaking();
}

/* ---------- init ---------- */
function init() {
  if ("speechSynthesis" in window) window.speechSynthesis.getVoices(); // warm-up

  els.topicButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      els.topicButtons.forEach((b) => { b.classList.remove("active"); b.setAttribute("aria-pressed", "false"); });
      btn.classList.add("active");
      btn.setAttribute("aria-pressed", "true");
      state.topic = btn.dataset.topic;
    });
  });

  els.startBtn.addEventListener("click", startGame);
  els.listenBtn.addEventListener("click", speakQuestion);
  els.voiceToggle.addEventListener("click", toggleVoice);
  els.nextBtn.addEventListener("click", nextQuestion);
  els.exitBtn.addEventListener("click", () => showScreen("start"));
  els.retryBtn.addEventListener("click", startGame);
  els.homeBtn.addEventListener("click", () => showScreen("start"));
}

document.addEventListener("DOMContentLoaded", init);
