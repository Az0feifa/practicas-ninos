const { selectActivities, evaluateAnswer, getSubjectCounts } = window.GameEngine;

const state = {
  subject: "Todos", questions: [], currentIndex: 0, score: 0, streak: 0,
  correctCount: 0, answered: false, voiceEnabled: true, wrongAnswers: [],
  multiSelection: new Set()
};

const $ = (id) => document.getElementById(id);
const els = {
  startScreen: $("start-screen"), gameScreen: $("game-screen"), endScreen: $("end-screen"),
  startBtn: $("start-btn"), restartBtn: $("restart-btn"), homeBtn: $("home-btn"), exitBtn: $("exit-btn"),
  nextBtn: $("next-btn"), submitMultiBtn: $("submit-multi-btn"), questionCount: $("question-count"),
  score: $("score"), streak: $("streak"), progressLabel: $("progress-label"), progressBar: $("progress-bar"),
  subjectBadge: $("subject-badge"), categoryBadge: $("category-badge"), questionVisual: $("question-visual"),
  activityLabel: $("activity-label"), questionText: $("question-text"), answers: $("answers"),
  feedback: $("feedback"), feedbackIcon: $("feedback-icon"), feedbackTitle: $("feedback-title"),
  feedbackText: $("feedback-text"), voiceToggle: $("voice-toggle"), finalScore: $("final-score"),
  finalCorrect: $("final-correct"), resultMessage: $("result-message"), reviewBox: $("review-box"),
  confetti: $("confetti")
};

function init() {
  const counts = getSubjectCounts(window.ACTIVITIES);
  $("science-count").textContent = `${counts.Ciencias} actividades`;
  $("spanish-count").textContent = `${counts.Español} actividades`;
  $("social-count").textContent = `${counts["Estudios Sociales"]} actividades`;

  document.querySelectorAll(".subject-option").forEach((button) => {
    button.addEventListener("click", () => chooseSubject(button));
  });
  els.startBtn.addEventListener("click", startGame);
  els.restartBtn.addEventListener("click", startGame);
  els.homeBtn.addEventListener("click", () => showScreen(els.startScreen));
  els.exitBtn.addEventListener("click", () => showScreen(els.startScreen));
  els.nextBtn.addEventListener("click", nextQuestion);
  els.submitMultiBtn.addEventListener("click", submitMulti);
  els.voiceToggle.addEventListener("click", toggleVoice);
  if ("speechSynthesis" in window) window.speechSynthesis.getVoices();
}

function chooseSubject(selectedButton) {
  state.subject = selectedButton.dataset.subject;
  document.querySelectorAll(".subject-option").forEach((button) => {
    const selected = button === selectedButton;
    button.classList.toggle("active", selected);
    button.setAttribute("aria-pressed", String(selected));
  });
}

function showScreen(target) {
  if ("speechSynthesis" in window) window.speechSynthesis.cancel();
  [els.startScreen, els.gameScreen, els.endScreen].forEach((screen) => {
    screen.classList.toggle("active", screen === target);
  });
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function startGame() {
  state.questions = selectActivities(window.ACTIVITIES, state.subject, els.questionCount.value);
  Object.assign(state, {
    currentIndex: 0, score: 0, streak: 0, correctCount: 0,
    answered: false, wrongAnswers: [], multiSelection: new Set()
  });
  updateStats();
  showScreen(els.gameScreen);
  renderQuestion();
}

function renderQuestion() {
  state.answered = false;
  state.multiSelection = new Set();
  els.feedback.className = "feedback hidden";
  els.nextBtn.classList.add("hidden");
  els.submitMultiBtn.classList.add("hidden");
  els.answers.replaceChildren();

  const question = state.questions[state.currentIndex];
  const number = state.currentIndex + 1;
  const total = state.questions.length;
  els.progressLabel.textContent = `Reto ${number} de ${total}`;
  els.progressBar.style.width = `${((state.currentIndex + 1) / total) * 100}%`;
  els.subjectBadge.textContent = question.subject;
  els.subjectBadge.dataset.subject = question.subject;
  els.categoryBadge.textContent = question.category;
  els.questionVisual.textContent = question.visual;
  els.activityLabel.textContent = question.type === "multi"
    ? `${question.activity} (máximo ${question.choose})`
    : question.activity;
  els.questionText.textContent = question.question;

  question.shuffledOptions.forEach((option) => {
    const button = document.createElement("button");
    button.className = "answer-btn";
    button.type = "button";
    button.textContent = option;
    button.addEventListener("click", () => {
      if (question.type === "multi") toggleMulti(option, button, question.choose);
      else resolveAnswer(option, button);
    });
    els.answers.appendChild(button);
  });
  if (question.type === "multi") els.submitMultiBtn.classList.remove("hidden");
}

function toggleMulti(option, button, maxChoices) {
  if (state.answered) return;
  if (state.multiSelection.has(option)) {
    state.multiSelection.delete(option);
    button.classList.remove("selected");
  } else if (state.multiSelection.size < maxChoices) {
    state.multiSelection.add(option);
    button.classList.add("selected");
  }
}

function submitMulti() {
  const question = state.questions[state.currentIndex];
  if (state.answered) return;
  if (state.multiSelection.size !== question.choose) {
    showFeedback("notice", "☝️", `Elegí exactamente ${question.choose} respuestas.`, "Después presioná “Revisar selección”.");
    return;
  }
  resolveAnswer([...state.multiSelection], null);
}

function resolveAnswer(selected, selectedButton) {
  if (state.answered) return;
  state.answered = true;
  const question = state.questions[state.currentIndex];
  const isCorrect = evaluateAnswer(selected, question.correct);
  const correctValues = Array.isArray(question.correct) ? question.correct : [question.correct];

  [...els.answers.children].forEach((button) => {
    button.disabled = true;
    if (correctValues.includes(button.textContent)) button.classList.add("correct");
    const wasSelected = Array.isArray(selected)
      ? selected.includes(button.textContent)
      : button === selectedButton;
    if (wasSelected && !correctValues.includes(button.textContent)) button.classList.add("wrong");
  });
  els.submitMultiBtn.classList.add("hidden");

  if (isCorrect) {
    state.streak += 1;
    state.correctCount += 1;
    state.score += 10 + Math.min(state.streak - 1, 5) * 2;
    showFeedback("correct", "✅", "¡Correcto!", state.streak >= 3
      ? `¡Ya llevás ${state.streak} respuestas correctas seguidas!`
      : "Muy bien. Continuemos con el próximo reto.");
    playTone("correct");
    if (state.streak % 4 === 0) createConfetti(24);
  } else {
    state.streak = 0;
    const correctText = correctValues.join(" y ");
    state.wrongAnswers.push({
      question: question.question, correct: correctText, explanation: question.explanation
    });
    showFeedback("wrong", "💡", `Respuesta correcta: ${correctText}`, question.explanation);
    playTone("wrong");
    speakExplanation(correctText, question.explanation);
  }

  updateStats();
  els.nextBtn.textContent = state.currentIndex === state.questions.length - 1
    ? "Ver resultado 🏆"
    : "Siguiente reto →";
  els.nextBtn.classList.remove("hidden");
}

function showFeedback(kind, icon, title, text) {
  els.feedback.className = `feedback ${kind}`;
  els.feedbackIcon.textContent = icon;
  els.feedbackTitle.textContent = title;
  els.feedbackText.textContent = text;
}

function updateStats() {
  els.score.textContent = state.score;
  els.streak.textContent = `${state.streak} 🔥`;
}

function nextQuestion() {
  if (!state.answered) return;
  if (state.currentIndex < state.questions.length - 1) {
    state.currentIndex += 1;
    renderQuestion();
  } else finishGame();
}

function finishGame() {
  if ("speechSynthesis" in window) window.speechSynthesis.cancel();
  const total = state.questions.length;
  const percentage = Math.round((state.correctCount / total) * 100);
  els.finalScore.textContent = state.score;
  els.finalCorrect.textContent = `${state.correctCount}/${total}`;
  els.resultMessage.textContent = percentage >= 90
    ? "Excelente resultado. Repetí la práctica para comprobarlo con un orden diferente."
    : percentage >= 70
      ? "Buen resultado. Revisá los errores y volvé a intentarlo."
      : "Revisá las explicaciones y repetí la práctica. El orden cambiará en la siguiente ronda.";
  if (percentage >= 70) createConfetti(percentage >= 90 ? 60 : 35);
  renderReview();
  showScreen(els.endScreen);
}

function renderReview() {
  if (!state.wrongAnswers.length) {
    els.reviewBox.innerHTML = '<h2>Repaso</h2><div class="review-item">🎯 No tuviste respuestas incorrectas.</div>';
    return;
  }
  const items = state.wrongAnswers.map((item) => `
    <details class="review-item">
      <summary>${escapeHtml(item.question)}</summary>
      <p><strong>Respuesta:</strong> ${escapeHtml(item.correct)}</p>
      <p>${escapeHtml(item.explanation)}</p>
    </details>`).join("");
  els.reviewBox.innerHTML = `<h2>📚 Repasá estos temas</h2>${items}`;
}

function speakExplanation(correctText, explanation) {
  if (!state.voiceEnabled || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const speech = new SpeechSynthesisUtterance(
    `Esa respuesta no es correcta. La respuesta correcta es ${correctText}. ${explanation}`
  );
  speech.lang = "es-CR";
  speech.rate = 0.88;
  speech.pitch = 1.04;
  const voices = window.speechSynthesis.getVoices();
  speech.voice = voices.find((voice) => voice.lang.toLowerCase() === "es-cr")
    || voices.find((voice) => voice.lang.toLowerCase().startsWith("es")) || null;
  window.speechSynthesis.speak(speech);
}

function toggleVoice() {
  state.voiceEnabled = !state.voiceEnabled;
  els.voiceToggle.setAttribute("aria-pressed", String(state.voiceEnabled));
  els.voiceToggle.textContent = state.voiceEnabled ? "🔊 Voz" : "🔇 Voz";
  if (!state.voiceEnabled && "speechSynthesis" in window) window.speechSynthesis.cancel();
}

function playTone(type) {
  try {
    const Context = window.AudioContext || window.webkitAudioContext;
    if (!Context) return;
    const context = new Context();
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.frequency.value = type === "correct" ? 620 : 210;
    gain.gain.setValueAtTime(0.0001, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.07, context.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.18);
    oscillator.start();
    oscillator.stop(context.currentTime + 0.2);
  } catch (_) {}
}

function createConfetti(count) {
  const colors = ["#6d28d9", "#f59e0b", "#22c55e", "#38bdf8", "#ec4899"];
  for (let i = 0; i < count; i += 1) {
    const piece = document.createElement("span");
    piece.className = "confetti-piece";
    piece.style.left = `${Math.random() * 100}%`;
    piece.style.background = colors[Math.floor(Math.random() * colors.length)];
    piece.style.setProperty("--drift", `${Math.random() * 180 - 90}px`);
    piece.style.animationDelay = `${Math.random() * 0.35}s`;
    els.confetti.appendChild(piece);
    setTimeout(() => piece.remove(), 2000);
  }
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;").replaceAll("'", "&#039;");
}

init();
