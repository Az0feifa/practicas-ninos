const test = require("node:test");
const assert = require("node:assert/strict");

const {
  shuffle,
  selectActivities,
  evaluateAnswer,
  getSubjectCounts
} = require("../game-engine.js");
const ACTIVITIES = require("../activities.js");

const FIXTURES = [
  { id: "c1", subject: "Ciencias", options: ["A", "B", "C"], correct: "A" },
  { id: "e1", subject: "Español", options: ["A", "B", "C"], correct: "B" },
  { id: "s1", subject: "Estudios Sociales", options: ["A", "B", "C"], correct: "C" },
  { id: "s2", subject: "Estudios Sociales", options: ["A", "B", "C"], correct: ["A", "B"] }
];

test("shuffle returns a new array without losing values", () => {
  const original = [1, 2, 3, 4];
  const shuffled = shuffle(original, () => 0.25);
  assert.notStrictEqual(shuffled, original);
  assert.deepEqual([...shuffled].sort(), original);
  assert.deepEqual(original, [1, 2, 3, 4]);
});

test("selectActivities filters by subject and shuffles answer choices", () => {
  const selected = selectActivities(FIXTURES, "Estudios Sociales", "all", () => 0);
  assert.equal(selected.length, 2);
  assert.ok(selected.every((item) => item.subject === "Estudios Sociales"));
  assert.ok(selected.every((item) => Array.isArray(item.shuffledOptions)));
  assert.notStrictEqual(selected[0].shuffledOptions, selected[0].options);
});

test("selectActivities mixes all subjects when Todos is selected", () => {
  const selected = selectActivities(FIXTURES, "Todos", "all", () => 0.5);
  assert.deepEqual(new Set(selected.map((item) => item.subject)), new Set(["Ciencias", "Español", "Estudios Sociales"]));
});

test("evaluateAnswer validates single and multiple selections independent of order", () => {
  assert.equal(evaluateAnswer("A", "A"), true);
  assert.equal(evaluateAnswer("B", "A"), false);
  assert.equal(evaluateAnswer(["B", "A"], ["A", "B"]), true);
  assert.equal(evaluateAnswer(["A", "C"], ["A", "B"]), false);
});

test("getSubjectCounts reports the real activity coverage", () => {
  assert.deepEqual(getSubjectCounts(FIXTURES), {
    Ciencias: 1,
    "Español": 1,
    "Estudios Sociales": 2
  });
});

test("the published practice includes substantial coverage of all three supplied subjects", () => {
  const counts = getSubjectCounts(ACTIVITIES);
  assert.ok(counts.Ciencias >= 20);
  assert.ok(counts["Español"] >= 20);
  assert.ok(counts["Estudios Sociales"] >= 10);
  assert.equal(new Set(ACTIVITIES.map((item) => item.id)).size, ACTIVITIES.length);
});

test("source-specific answers from the worksheets are represented accurately", () => {
  const byId = Object.fromEntries(ACTIVITIES.map((item) => [item.id, item]));
  assert.equal(byId["science-fish-breathing"].correct, "Branquias");
  assert.equal(byId["science-apple-energy"].correct, "Energía potencial");
  assert.equal(byId["spanish-touch-sky"].correct, "Que estaba muy feliz por la noticia");
  assert.equal(byId["social-compass"].correct, "Brújula");
  assert.deepEqual(byId["social-cardinal-points"].correct, ["Norte", "Este", "Oeste", "Sur"]);
});

test("every activity has enough feedback information for spoken correction", () => {
  for (const activity of ACTIVITIES) {
    assert.ok(activity.question.length >= 12, activity.id);
    assert.ok(activity.options.length >= 3, activity.id);
    assert.ok(activity.explanation.length >= 20, activity.id);
  }
});
