const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const { JSDOM, VirtualConsole } = require("jsdom");

const projectRoot = path.resolve(__dirname, "..");

async function loadApp() {
  const spoken = [];
  const virtualConsole = new VirtualConsole();
  const errors = [];
  virtualConsole.on("jsdomError", (error) => errors.push(error.message));
  const dom = await JSDOM.fromFile(path.join(projectRoot, "index.html"), {
    resources: "usable",
    runScripts: "dangerously",
    url: `file://${path.join(projectRoot, "index.html")}`,
    virtualConsole,
    beforeParse(window) {
      window.scrollTo = () => {};
      window.speechSynthesis = {
        cancel() {},
        getVoices() { return []; },
        speak(utterance) { spoken.push(utterance.text); }
      };
      window.SpeechSynthesisUtterance = function (text) { this.text = text; };
    }
  });
  await new Promise((resolve) => dom.window.addEventListener("load", resolve, { once: true }));
  return { dom, spoken, errors };
}

test("the start screen reports the real number of activities in each subject", async () => {
  const { dom } = await loadApp();
  const document = dom.window.document;
  assert.equal(document.querySelector("#science-count").textContent, "24 actividades");
  assert.equal(document.querySelector("#spanish-count").textContent, "27 actividades");
  assert.equal(document.querySelector("#social-count").textContent, "12 actividades");
  dom.window.close();
});

test("selecting Estudios Sociales starts a social-studies-only round", async () => {
  const { dom, errors } = await loadApp();
  const document = dom.window.document;
  document.querySelector('[data-subject="Estudios Sociales"]').click();
  document.querySelector("#question-count").value = "10";
  document.querySelector("#start-btn").click();
  assert.equal(document.querySelector("#subject-badge").textContent, "Estudios Sociales");
  assert.equal(document.querySelector("#game-screen").classList.contains("active"), true);
  assert.deepEqual(errors, []);
  dom.window.close();
});

test("an incorrect answer reveals and speaks the correct explanation", async () => {
  const { dom, spoken } = await loadApp();
  const { document, ACTIVITIES } = dom.window;
  document.querySelector('[data-subject="Ciencias"]').click();
  document.querySelector("#question-count").value = "10";
  document.querySelector("#start-btn").click();

  const text = document.querySelector("#question-text").textContent;
  const activity = ACTIVITIES.find((item) => item.question === text);
  const correct = Array.isArray(activity.correct) ? activity.correct : [activity.correct];
  const buttons = [...document.querySelectorAll(".answer-btn")];
  const wrong = buttons.find((button) => !correct.includes(button.textContent));
  wrong.click();

  assert.equal(document.querySelector("#feedback").classList.contains("wrong"), true);
  assert.match(document.querySelector("#feedback-title").textContent, /Respuesta correcta:/);
  assert.equal(spoken.length, 1);
  assert.match(spoken[0], /La respuesta correcta es/);
  dom.window.close();
});
