# Misión Comunidad — English Practice Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a separate bilingual English practice for an eight-year-old at `/ingles/`, link it from the existing home page, and publish it through the repository's existing GitHub Pages workflow.

**Architecture:** Keep the current application unchanged except for a new English entry point. Build the English section as a dependency-free static app with structured lesson data, a pure UMD game engine, a browser controller, and a speech adapter around `window.speechSynthesis`; all paths remain relative for project-page hosting.

**Tech Stack:** Semantic HTML5, modern CSS, vanilla JavaScript, Web Speech API, Node.js built-in test runner, GitHub Actions, GitHub Pages.

**Spec:** `docs/superpowers/specs/2026-09-17-mision-comunidad-english-design.md`

## Global Constraints

- Preserve the existing Science, Spanish, and Social Studies practice.
- Publish the new experience at `/practicas-ninos/ingles/`.
- Use no runtime dependencies, external services, tracking, microphone access, or personal-data collection.
- Explain every activity visibly in Spanish and English; voice reads Spanish first and English second.
- Use word-family terminology for `-op` and `-og`; do not call them vowel combinations.
- Categorize `school` as a place, `education` as a service, and `dentist`/`firefighter` as helpers.
- Maintain 48 px minimum touch targets, keyboard access, visible focus, status announcements, and `prefers-reduced-motion` support.
- A missing speech voice must never block the lesson.
- Use relative URLs so the app works under the GitHub Pages project subdirectory.

## File Map

- `ingles/index.html`: semantic screen shell, navigation, live regions, result areas, and script loading.
- `ingles/styles.css`: responsive visual system, component states, accessibility, and reduced motion.
- `ingles/activities.js`: bilingual vocabulary, lessons, story, and assessment items as immutable data.
- `ingles/game-engine.js`: pure selection, evaluation, date, sequence, progress, and report functions.
- `ingles/speech.js`: language-aware voice selection, bilingual queueing, cancellation, and graceful fallback.
- `ingles/app.js`: state machine, rendering, events, persistence, feedback, and screen transitions.
- `tests/english-game-engine.test.js`: pure behavior and data integrity tests.
- `tests/english-ui.integration.test.js`: static DOM contract, accessibility, routes, and content tests.
- `tests/english-speech.test.js`: speech adapter tests with mocked synthesis.
- `index.html`: one new card/link to the independent English section.
- `styles.css`: styles for the new English entry card only.
- `README.md`: usage, English feature, local testing, and public URLs.

---

### Task 1: English Game Engine

**Files:**
- Create: `ingles/game-engine.js`
- Create: `tests/english-game-engine.test.js`

**Interfaces:**
- Produces `EnglishGameEngine.shuffle(items, random) -> Array`.
- Produces `EnglishGameEngine.pickQuestions(items, count, random) -> Array`.
- Produces `EnglishGameEngine.evaluate(question, response) -> { correct: boolean, expected: unknown }`.
- Produces `EnglishGameEngine.buildProgress(current, total) -> { current, total, percent }`.
- Produces `EnglishGameEngine.summarize(results) -> { total, correct, percent, bySkill }`.
- Produces `EnglishGameEngine.buildEnglishDate({ weekday, month, day, year }) -> string`.

- [ ] **Step 1: Write failing engine tests**

```js
const test = require('node:test');
const assert = require('node:assert/strict');
const Engine = require('../ingles/game-engine.js');

test('evaluate handles one answer, many answers, ordered words and sequences', () => {
  assert.equal(Engine.evaluate({ type: 'choice', answer: 'doctor' }, 'doctor').correct, true);
  assert.equal(Engine.evaluate({ type: 'multi', answer: ['goods', 'services'] }, ['services', 'goods']).correct, true);
  assert.equal(Engine.evaluate({ type: 'order', answer: ['I', 'see', 'a', 'dog'] }, ['I', 'see', 'a', 'dog']).correct, true);
  assert.equal(Engine.evaluate({ type: 'sequence', answer: ['beginning', 'middle', 'end'] }, ['middle', 'beginning', 'end']).correct, false);
});

test('buildEnglishDate uses an ordinal day', () => {
  assert.equal(Engine.buildEnglishDate({ weekday: 'Friday', month: 'September', day: 18, year: 2026 }), 'Friday, September 18th, 2026');
});

test('summarize reports overall and per-skill results', () => {
  const report = Engine.summarize([
    { skill: 'helpers', correct: true },
    { skill: 'helpers', correct: false },
    { skill: 'phonics', correct: true }
  ]);
  assert.deepEqual(report, {
    total: 3,
    correct: 2,
    percent: 67,
    bySkill: {
      helpers: { total: 2, correct: 1, percent: 50 },
      phonics: { total: 1, correct: 1, percent: 100 }
    }
  });
});
```

- [ ] **Step 2: Run the test and confirm the red state**

Run: `node --test tests/english-game-engine.test.js`  
Expected: FAIL because `../ingles/game-engine.js` does not exist.

- [ ] **Step 3: Implement the pure UMD engine**

Implement Fisher–Yates shuffling without mutating input, selection with safe count bounds, type-aware comparison, rounded percentage calculations, per-skill accumulation, and ordinal suffixes including the 11th/12th/13th exceptions. Export through `module.exports` and `globalThis.EnglishGameEngine`.

- [ ] **Step 4: Run the engine tests**

Run: `node --test tests/english-game-engine.test.js`  
Expected: PASS for selection, evaluation, progress, reports, and dates.

- [ ] **Step 5: Commit**

```bash
git add ingles/game-engine.js tests/english-game-engine.test.js
git commit -m "feat: add English practice game engine"
```

### Task 2: Bilingual Curriculum Data

**Files:**
- Create: `ingles/activities.js`
- Modify: `tests/english-game-engine.test.js`

**Interfaces:**
- Produces global/CommonJS `EnglishCurriculum` with `vocabulary`, `lessons`, `story`, and `exam` arrays.
- Every vocabulary record has `{ id, skill, english, spanish, visual, exampleEn, exampleEs }`.
- Every question has `{ id, mode, skill, type, instructionEs, instructionEn, promptEs, promptEn, visual, options, answer, explanationEs, explanationEn }`.

- [ ] **Step 1: Add failing curriculum integrity tests**

```js
const Curriculum = require('../ingles/activities.js');

test('curriculum covers every source skill with bilingual copy', () => {
  const skills = new Set(Curriculum.exam.map((item) => item.skill));
  assert.deepEqual([...skills].sort(), ['date', 'goods-services', 'helpers', 'phonics', 'places', 'reading', 'sentences'].sort());
  for (const item of [...Curriculum.lessons, ...Curriculum.exam]) {
    assert.ok(item.instructionEs && item.instructionEn);
    assert.ok(item.explanationEs && item.explanationEn);
    assert.notEqual(item.options.length, 0);
  }
});

test('curriculum teaches corrected categories and required word families', () => {
  const serialized = JSON.stringify(Curriculum);
  assert.match(serialized, /education/);
  assert.match(serialized, /school/);
  for (const word of ['hop', 'mop', 'pop', 'top', 'dog', 'fog', 'log', 'jog']) assert.match(serialized, new RegExp(word));
});
```

- [ ] **Step 2: Run the curriculum tests and confirm failure**

Run: `node --test tests/english-game-engine.test.js`  
Expected: FAIL because `../ingles/activities.js` does not exist.

- [ ] **Step 3: Add complete age-appropriate data**

Add the required helpers (`farmer`, `doctor`, `nurse`, `mechanic`, `teacher`, `baker`, `dentist`, `firefighter`, `butcher`), places (`farm`, `hospital`, `school`, `bakery`, `church`, `drugstore`, `garage`, `fire station`, `butcher shop`), goods (`shoes`, `food`, `medicine`, `fruit`, `bread`, `meat`), service concepts, eight `-op/-og` words, sentence ordering, date construction, and the three-scene story “Ana's Busy Morning.” Provide at least 24 lesson questions and 14 balanced exam questions.

- [ ] **Step 4: Run all data and engine tests**

Run: `npm test`  
Expected: all existing and new Node tests PASS.

- [ ] **Step 5: Commit**

```bash
git add ingles/activities.js tests/english-game-engine.test.js
git commit -m "feat: add bilingual English curriculum"
```

### Task 3: Semantic English App Shell

**Files:**
- Create: `ingles/index.html`
- Create: `tests/english-ui.integration.test.js`

**Interfaces:**
- Provides screens `welcome-screen`, `mission-screen`, `lesson-screen`, `result-screen`.
- Provides controls `start-button`, `voice-toggle`, `speak-instructions`, `repeat-english`, `check-answer`, `next-button`, `home-button`.
- Provides live regions `voice-status` and `feedback`.

- [ ] **Step 1: Write the failing static integration test**

```js
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const html = fs.readFileSync(path.join(__dirname, '../ingles/index.html'), 'utf8');

test('English page exposes accessible screens and voice controls', () => {
  for (const id of ['welcome-screen', 'mission-screen', 'lesson-screen', 'result-screen', 'start-button', 'voice-toggle', 'speak-instructions', 'repeat-english', 'feedback']) {
    assert.match(html, new RegExp(`id=["']${id}["']`));
  }
  assert.match(html, /lang="es"/);
  assert.match(html, /aria-live="polite"/);
  assert.match(html, /activities\.js/);
  assert.match(html, /game-engine\.js/);
  assert.match(html, /speech\.js/);
  assert.match(html, /app\.js/);
});
```

- [ ] **Step 2: Run the integration test and confirm failure**

Run: `node --test tests/english-ui.integration.test.js`  
Expected: FAIL because `ingles/index.html` does not exist.

- [ ] **Step 3: Build the semantic shell**

Create a no-JavaScript notice, skip link, four sections where only the welcome screen is initially active, mission buttons for learn/practice/read/exam, progress and star indicators, bilingual instruction blocks, answer region, feedback region, and result breakdown. Load scripts in the order `game-engine.js`, `activities.js`, `speech.js`, `app.js` with `defer`.

- [ ] **Step 4: Run the integration test**

Run: `node --test tests/english-ui.integration.test.js`  
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add ingles/index.html tests/english-ui.integration.test.js
git commit -m "feat: add accessible English practice shell"
```

### Task 4: Responsive Visual System

**Files:**
- Create: `ingles/styles.css`
- Modify: `tests/english-ui.integration.test.js`

**Interfaces:**
- Consumes the class names in `ingles/index.html`.
- Produces `.screen.active`, `.mission-card`, `.answer-option`, `.feedback`, `.progress-fill`, `.word-chip`, `.story-scene`, and responsive states.

- [ ] **Step 1: Add failing CSS contract tests**

```js
const css = fs.readFileSync(path.join(__dirname, '../ingles/styles.css'), 'utf8');

test('styles include touch, focus, responsive and reduced-motion rules', () => {
  assert.match(css, /min-height:\s*48px/);
  assert.match(css, /:focus-visible/);
  assert.match(css, /@media\s*\(max-width:\s*640px\)/);
  assert.match(css, /prefers-reduced-motion:\s*reduce/);
});
```

- [ ] **Step 2: Run the test and confirm failure**

Run: `node --test tests/english-ui.integration.test.js`  
Expected: FAIL because `ingles/styles.css` does not exist.

- [ ] **Step 3: Implement the visual system**

Use CSS custom properties for deep blue `#173F5F`, turquoise `#18A999`, yellow `#FFC857`, coral `#F26B5B`, ink `#183153`, and warm canvas `#FFF9EF`. Build a compact header, rounded white learning surface, two-column mission grid collapsing to one column below 640 px, 48 px controls, clear correct/incorrect icons plus text, sticky mobile action area, visible focus rings, and reduced-motion overrides.

- [ ] **Step 4: Run static tests**

Run: `npm test`  
Expected: all tests PASS.

- [ ] **Step 5: Commit**

```bash
git add ingles/styles.css tests/english-ui.integration.test.js
git commit -m "feat: style bilingual English practice"
```

### Task 5: Speech Adapter

**Files:**
- Create: `ingles/speech.js`
- Create: `tests/english-speech.test.js`

**Interfaces:**
- Produces `EnglishSpeech.createSpeechController({ synthesis, Utterance })`.
- Controller methods: `isSupported()`, `speak(text, lang, options)`, `speakBilingual(spanish, english)`, `cancel()`, `setEnabled(value)`, `getEnabled()`.

- [ ] **Step 1: Write failing speech tests**

```js
const test = require('node:test');
const assert = require('node:assert/strict');
const Speech = require('../ingles/speech.js');

test('bilingual speech queues Spanish before English and cancels old speech', async () => {
  const calls = [];
  class Utterance { constructor(text) { this.text = text; } }
  const synthesis = {
    getVoices: () => [{ lang: 'es-CR', name: 'Spanish' }, { lang: 'en-US', name: 'English' }],
    cancel: () => calls.push('cancel'),
    speak: (utterance) => { calls.push(`${utterance.lang}:${utterance.text}`); queueMicrotask(() => utterance.onend?.()); }
  };
  const controller = Speech.createSpeechController({ synthesis, Utterance });
  await controller.speakBilingual('Elegí una respuesta.', 'Choose one answer.');
  assert.deepEqual(calls, ['cancel', 'es-CR:Elegí una respuesta.', 'en-US:Choose one answer.']);
});
```

- [ ] **Step 2: Run the test and confirm failure**

Run: `node --test tests/english-speech.test.js`  
Expected: FAIL because `ingles/speech.js` does not exist.

- [ ] **Step 3: Implement speech behavior**

Select exact locale first, then same-language prefix, then any voice. Set English rate to `0.82` and Spanish rate to `0.9`. Cancel before a new queue, resolve promises on `onend`/`onerror`, make disabled or unsupported calls resolve without speaking, and export for CommonJS and `globalThis.EnglishSpeech`.

- [ ] **Step 4: Run speech and full test suites**

Run: `npm test`  
Expected: all tests PASS, including unsupported-synthesis coverage.

- [ ] **Step 5: Commit**

```bash
git add ingles/speech.js tests/english-speech.test.js
git commit -m "feat: add resilient bilingual speech"
```

### Task 6: Interactive Controller and Persistence

**Files:**
- Create: `ingles/app.js`
- Modify: `tests/english-ui.integration.test.js`

**Interfaces:**
- Consumes `EnglishCurriculum`, `EnglishGameEngine`, and `EnglishSpeech` globals.
- Persists `{ version: 1, mode, index, stars, answers, questionIds }` under `mision-comunidad-progress-v1`.
- Exposes no new global API.

- [ ] **Step 1: Add failing controller contract tests**

```js
const app = fs.readFileSync(path.join(__dirname, '../ingles/app.js'), 'utf8');

test('controller handles voice, persistence, answer review and every screen', () => {
  assert.match(app, /mision-comunidad-progress-v1/);
  assert.match(app, /speakBilingual/);
  assert.match(app, /localStorage/);
  assert.match(app, /renderQuestion/);
  assert.match(app, /showResults/);
  assert.match(app, /beforeunload|visibilitychange/);
});
```

- [ ] **Step 2: Run the integration test and confirm failure**

Run: `node --test tests/english-ui.integration.test.js`  
Expected: FAIL because `ingles/app.js` does not exist.

- [ ] **Step 3: Implement the state machine**

Implement screen switching, mission selection, shuffled question setup, choice/multi/order/sequence rendering, answer locking, bilingual feedback, stars awarded only for progress, retry without penalty, next-question handling, result reports, voice controls, cancellation on navigation, save-after-answer, resume prompt after reload, restart, and home navigation. Invalid records must be skipped with `console.warn` and the session must continue.

- [ ] **Step 4: Run all automated tests**

Run: `npm test`  
Expected: all existing and English tests PASS.

- [ ] **Step 5: Run local smoke test**

Run: `python3 -m http.server 4173`  
Open: `http://127.0.0.1:4173/ingles/`  
Expected: welcome → mission → three answered questions → result works; voice buttons do not produce console errors.

- [ ] **Step 6: Commit**

```bash
git add ingles/app.js tests/english-ui.integration.test.js
git commit -m "feat: make English practice interactive"
```

### Task 7: Existing Home Integration and Documentation

**Files:**
- Modify: `index.html`
- Modify: `styles.css`
- Modify: `README.md`
- Modify: `tests/english-ui.integration.test.js`

**Interfaces:**
- Root page links to relative URL `ingles/`.
- Existing subject selectors and game controls retain their IDs and behavior.

- [ ] **Step 1: Add failing root integration tests**

```js
const rootHtml = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');

test('existing home links to English without removing current subjects', () => {
  assert.match(rootHtml, /href="ingles\/"/);
  for (const subject of ['Ciencias', 'Español', 'Estudios Sociales']) assert.match(rootHtml, new RegExp(subject));
  assert.match(rootHtml, /English|Inglés/);
});
```

- [ ] **Step 2: Run the integration test and confirm failure**

Run: `node --test tests/english-ui.integration.test.js`  
Expected: FAIL because the root page has no `ingles/` link.

- [ ] **Step 3: Add the independent English entry**

Insert a visually distinct card after the intro and before the subject picker. Copy: “Nueva misión: Inglés”, “Practicá ayudantes, lugares, bienes, servicios y sonidos con instrucciones en español e inglés”, and CTA “Entrar a Misión Comunidad”. Add only scoped CSS classes so existing controls remain unchanged.

- [ ] **Step 4: Update README**

Document `npm test`, local serving, existing root URL, English URL, browser speech requirements, no microphone use, and graceful no-voice behavior.

- [ ] **Step 5: Run regression tests**

Run: `npm test`  
Expected: all pre-existing and new tests PASS.

- [ ] **Step 6: Commit**

```bash
git add index.html styles.css README.md tests/english-ui.integration.test.js
git commit -m "feat: link English mission from learning home"
```

### Task 8: Browser QA and GitHub Pages Release

**Files:**
- Modify only files with defects discovered during QA.

**Interfaces:**
- Public URL: `https://az0feifa.github.io/practicas-ninos/ingles/`.
- Deployment workflow: `.github/workflows/pages.yml` on pushes to `main`.

- [ ] **Step 1: Run the complete automated suite**

Run: `npm test`  
Expected: zero failures.

- [ ] **Step 2: Perform browser interaction QA**

At 390 × 844, 768 × 1024, and 1440 × 900, verify: landing layout; every mission entry; Spanish→English instruction order; English-only repeat; correct and incorrect feedback; ordered-word activity; story sequencing; date activity; result breakdown; resume after reload; voice-off mode; keyboard-only completion; and no console errors.

- [ ] **Step 3: Verify accessibility and motion**

Confirm 200% zoom has no horizontal content loss, focus remains visible, live feedback is announced, color is not the only feedback signal, touch targets are at least 48 px, and reduced-motion mode removes nonessential transitions.

- [ ] **Step 4: Fix any defects with a focused red-green cycle**

For each defect, add a reproducing test where automation is possible, confirm failure, patch the smallest relevant file, and rerun the focused test plus `npm test`.

- [ ] **Step 5: Commit verified fixes**

```bash
git add ingles/ index.html styles.css README.md tests/
git commit -m "fix: resolve English practice QA findings"
```

- [ ] **Step 6: Integrate the verified branch into `main`**

Create and merge a pull request from `codex/mision-comunidad-ingles` to `main` only after tests and browser evidence are complete.

- [ ] **Step 7: Verify GitHub Pages deployment**

Confirm the newest “Deploy to GitHub Pages” workflow run succeeds, then open the public English URL and repeat the start → answer → feedback path. Verify the deployed page has no failed assets and no console errors.
