(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.GameEngine = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  function shuffle(array, random = Math.random) {
    const copy = [...array];
    for (let i = copy.length - 1; i > 0; i -= 1) {
      const j = Math.floor(random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  function selectActivities(activities, subject, count, random = Math.random) {
    const pool = subject === "Todos"
      ? activities
      : activities.filter((activity) => activity.subject === subject);
    const wanted = count === "all" ? pool.length : Math.min(Number(count), pool.length);
    return shuffle(pool, random)
      .slice(0, wanted)
      .map((activity) => ({
        ...activity,
        shuffledOptions: shuffle(activity.options, random)
      }));
  }

  function evaluateAnswer(selected, correct) {
    if (!Array.isArray(correct)) return selected === correct;
    if (!Array.isArray(selected) || selected.length !== correct.length) return false;
    const left = [...selected].sort();
    const right = [...correct].sort();
    return left.every((value, index) => value === right[index]);
  }

  function getSubjectCounts(activities) {
    return activities.reduce((counts, activity) => {
      counts[activity.subject] = (counts[activity.subject] || 0) + 1;
      return counts;
    }, {});
  }

  return { shuffle, selectActivities, evaluateAnswer, getSubjectCounts };
});
