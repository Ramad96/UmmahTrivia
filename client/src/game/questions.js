// Loads question data from /public/data/ at runtime (browser fetch)

function shuffle(arr) {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function toGameFormat(q) {
  const keys = ["A", "B", "C", "D"];
  return {
    id: q.id,
    text: q.question,
    answers: keys.map((k) => q.options[k]),
    correctIndex: keys.indexOf(q.correct_answer),
  };
}

// Cache fetched topic data so we don't re-fetch mid-game
const cache = {};

async function loadTopic(key) {
  if (cache[key]) return cache[key];
  const res = await fetch(`/data/questions_${key}.json`);
  const data = await res.json();
  cache[key] = data;
  return data;
}

export async function loadTopics() {
  const res = await fetch("/data/topics.json");
  return res.json();
}

export async function getQuestions(topicKey, difficulty) {
  const raw = await loadTopic(topicKey);
  const pool = raw.filter((q) => q.difficulty === difficulty).map(toGameFormat);
  return shuffle(pool).slice(0, 10);
}

export async function getIncreasingDifficultyQuestions(topicKey) {
  const raw = await loadTopic(topicKey);
  const result = [];
  for (const diff of ["easy", "medium", "hard"]) {
    const pool = raw.filter((q) => q.difficulty === diff).map(toGameFormat);
    result.push(...shuffle(pool).slice(0, 5));
  }
  return result;
}

export async function getRandomTopicQuestions(topics, difficulty, mode) {
  const topicKey = topics[Math.floor(Math.random() * topics.length)].key;
  const questions =
    mode === "increasing"
      ? await getIncreasingDifficultyQuestions(topicKey)
      : await getQuestions(topicKey, difficulty);
  return { topic: topicKey, questions };
}
