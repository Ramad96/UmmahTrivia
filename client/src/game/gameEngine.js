// Client-side game engine — mirrors server-side gameManager.js
// Runs entirely in the host's browser.

import { generatePlayerName, calculateScore } from "./playerManager.js";

export function createGameState() {
  return {
    status: "lobby", // lobby | question | results | leaderboard | finished
    players: new Map(), // peerId → { id, name, score, answeredThisRound }
    questions: [],
    questionTime: 10,
    together: false,
    topicLabel: "",
    bonusTimeEnabled: true,
    currentQuestionIndex: 0,
    currentAnswers: new Map(), // peerId → { answerIndex, timeLeft }
    timerInterval: null,
    timeLeft: 10,
  };
}

export function addPlayer(game, peerId, preferredName = "") {
  const existingNames = new Set([...game.players.values()].map((p) => p.name));
  const trimmed = preferredName.trim().slice(0, 30);
  const name = trimmed && !existingNames.has(trimmed) ? trimmed : generatePlayerName(existingNames);
  game.players.set(peerId, { id: peerId, name, score: 0, answeredThisRound: false });
  return name;
}

export function removePlayer(game, peerId) {
  game.players.delete(peerId);
}

export function getPlayersArray(game) {
  return [...game.players.values()].map((p) => ({ id: p.id, name: p.name }));
}

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

export function recordAnswer(game, peerId, answerIndex) {
  const player = game.players.get(peerId);
  if (!player || player.answeredThisRound) return false;
  player.answeredThisRound = true;
  game.currentAnswers.set(peerId, { answerIndex, timeLeft: game.timeLeft });
  return true;
}

export function allPlayersAnswered(game) {
  return [...game.players.values()].every((p) => p.answeredThisRound);
}

export function buildResults(game) {
  const q = game.questions[game.currentQuestionIndex];
  const correctIndex = q.correctIndex;

  const distribution = [0, 0, 0, 0];
  for (const { answerIndex } of game.currentAnswers.values()) {
    if (answerIndex >= 0 && answerIndex <= 3) distribution[answerIndex]++;
  }

  for (const [peerId, { answerIndex, timeLeft }] of game.currentAnswers) {
    if (answerIndex === correctIndex) {
      const player = game.players.get(peerId);
      if (player) player.score += calculateScore(timeLeft);
    }
  }

  return {
    questionIndex: game.currentQuestionIndex,
    correctIndex,
    correctAnswer: q.answers[correctIndex],
    distribution,
    questionText: q.text,
    answers: q.answers,
    explanation: q.explanation || null,
    source: q.source || null,
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

export function hasMoreQuestions(game) {
  return game.currentQuestionIndex < game.questions.length - 1;
}
