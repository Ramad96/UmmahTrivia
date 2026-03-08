import { generatePlayerName, calculateScore } from "./playerManager.js";

// In-memory store: gameCode → gameState
const games = new Map();

function generateGameCode() {
  let code;
  do {
    code = String(Math.floor(100000 + Math.random() * 900000));
  } while (games.has(code));
  return code;
}

export function createGame(hostSocketId) {
  const code = generateGameCode();
  const game = {
    code,
    hostId: hostSocketId,
    status: "lobby", // lobby | question | results | leaderboard | finished
    players: new Map(), // socketId → { id, name, score, answeredThisRound }
    questions: [], // set when the host starts the game
    questionTime: 10, // seconds per question, set on start
    together: false, // together mode — no leaderboard between questions
    currentQuestionIndex: 0,
    currentAnswers: new Map(), // socketId → { answerIndex, timeLeft }
    timerInterval: null,
    timeLeft: 10,
  };
  games.set(code, game);
  return game;
}

export function setGameQuestions(game, questions) {
  game.questions = questions;
}

export function getGame(code) {
  return games.get(code) || null;
}

export function deleteGame(code) {
  const game = games.get(code);
  if (game?.timerInterval) clearInterval(game.timerInterval);
  games.delete(code);
}

export function addPlayer(game, socketId) {
  const existingNames = new Set([...game.players.values()].map((p) => p.name));
  const name = generatePlayerName(existingNames);
  game.players.set(socketId, {
    id: socketId,
    name,
    score: 0,
    answeredThisRound: false,
  });
  return name;
}

export function removePlayer(game, socketId) {
  game.players.delete(socketId);
}

// Returns the current question safe to send to clients (no correctIndex)
export function getCurrentQuestion(game) {
  const q = game.questions[game.currentQuestionIndex];
  return {
    id: q.id,
    text: q.text,
    answers: q.answers,
    questionIndex: game.currentQuestionIndex,
    total: game.questions.length,
  };
}

export function recordAnswer(game, socketId, answerIndex) {
  const player = game.players.get(socketId);
  if (!player || player.answeredThisRound) return false;

  player.answeredThisRound = true;
  game.currentAnswers.set(socketId, {
    answerIndex,
    timeLeft: game.timeLeft,
  });
  return true;
}

// Build results for current question
export function buildResults(game) {
  const q = game.questions[game.currentQuestionIndex];
  const correctIndex = q.correctIndex;

  // Answer distribution: count per option (0–3)
  const distribution = [0, 0, 0, 0];
  for (const { answerIndex } of game.currentAnswers.values()) {
    if (answerIndex >= 0 && answerIndex <= 3) distribution[answerIndex]++;
  }

  // Update scores
  for (const [socketId, { answerIndex, timeLeft }] of game.currentAnswers) {
    if (answerIndex === correctIndex) {
      const player = game.players.get(socketId);
      if (player) player.score += calculateScore(timeLeft);
    }
  }

  return {
    correctIndex,
    correctAnswer: q.answers[correctIndex],
    distribution,
    questionText: q.text,
    answers: q.answers,
  };
}

export function buildLeaderboard(game) {
  return [...game.players.values()]
    .sort((a, b) => b.score - a.score)
    .map((p, i) => ({ rank: i + 1, name: p.name, score: p.score }));
}

export function advanceQuestion(game) {
  game.currentQuestionIndex++;
  game.currentAnswers.clear();
  for (const player of game.players.values()) {
    player.answeredThisRound = false;
  }
  game.timeLeft = game.questionTime;
  game.status = "question";
}

export function getPlayersArray(game) {
  return [...game.players.values()].map((p) => ({ id: p.id, name: p.name }));
}

export function hasMoreQuestions(game) {
  return game.currentQuestionIndex < game.questions.length - 1;
}

export function getGameByHostId(hostId) {
  for (const game of games.values()) {
    if (game.hostId === hostId) return game;
  }
  return null;
}

export function getGameByPlayerId(playerId) {
  for (const game of games.values()) {
    if (game.players.has(playerId)) return game;
  }
  return null;
}
