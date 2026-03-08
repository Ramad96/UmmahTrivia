import {
  createGame,
  getGame,
  deleteGame,
  addPlayer,
  removePlayer,
  getCurrentQuestion,
  recordAnswer,
  buildResults,
  buildLeaderboard,
  advanceQuestion,
  getPlayersArray,
  hasMoreQuestions,
  getGameByHostId,
  getGameByPlayerId,
  setGameQuestions,
} from "../game/gameManager.js";
import {
  TOPICS,
  getQuestions,
  getIncreasingDifficultyQuestions,
  getRandomTopicQuestions,
} from "../game/questions.js";

const ALLOWED_QUESTION_TIMES = [10, 15, 20];
const DEFAULT_QUESTION_TIME = 10;
const RESULTS_DISPLAY_TIME = 5000; // ms before leaderboard
const LEADERBOARD_DISPLAY_TIME = 4000; // ms before next question

export function registerSocketHandlers(io, socket) {
  // ── Host: Create Game ────────────────────────────────────────
  socket.on("host:createGame", (callback) => {
    const game = createGame(socket.id);
    socket.join(game.code);
    socket.join(`host:${game.code}`);
    console.log(`[Game] Created: ${game.code} by host ${socket.id}`);
    callback({ success: true, gameCode: game.code, topics: TOPICS });
  });

  // ── Player: Join Game ────────────────────────────────────────
  socket.on("player:joinGame", ({ gameCode }, callback) => {
    const game = getGame(gameCode);

    if (!game) return callback({ success: false, error: "Game not found" });
    if (game.status !== "lobby")
      return callback({ success: false, error: "Game already started" });

    const playerName = addPlayer(game, socket.id);
    socket.join(gameCode);
    socket.join(`player:${gameCode}`);

    const players = getPlayersArray(game);

    // Notify host of new player
    io.to(`host:${gameCode}`).emit("game:playerJoined", { players });

    console.log(`[Game] ${playerName} joined ${gameCode}`);
    callback({ success: true, playerName, players });
  });

  // ── Host: Start Game ─────────────────────────────────────────
  // topic: "duas"|"fiqh"|"places"|"prophets"|"random"
  // mode:  "normal"|"increasing"
  // difficulty: "easy"|"medium"|"hard" (ignored when mode is "increasing")
  socket.on("host:startGame", ({ gameCode, topic, difficulty, mode, timePerQuestion, together }) => {
    const game = getGame(gameCode);
    if (!game || game.hostId !== socket.id) return;
    if (game.status !== "lobby") return;
    // Together mode: host plays solo — no other players required
    if (!together && game.players.size === 0) return;
    if (together) {
      // Add the host as a participant so their answers are recorded
      addPlayer(game, socket.id);
      socket.join(`player:${gameCode}`);
      game.together = true;
    }

    game.questionTime = ALLOWED_QUESTION_TIMES.includes(timePerQuestion)
      ? timePerQuestion
      : DEFAULT_QUESTION_TIME;

    let questions;
    let resolvedTopic = topic;

    if (topic === "random") {
      const result = getRandomTopicQuestions(difficulty, mode);
      questions = result.questions;
      resolvedTopic = result.topic;
    } else if (mode === "increasing") {
      questions = getIncreasingDifficultyQuestions(topic);
    } else {
      questions = getQuestions(topic, difficulty);
    }

    setGameQuestions(game, questions);
    game.status = "question";

    console.log(
      `[Game] ${game.code} started — topic: ${resolvedTopic}, mode: ${mode}, difficulty: ${difficulty}, time: ${game.questionTime}s, questions: ${questions.length}${together ? " [TOGETHER]" : ""}`
    );

    startQuestion(io, game);
  });

  // ── Player: Submit Answer ────────────────────────────────────
  socket.on("player:submitAnswer", ({ gameCode, answerIndex }) => {
    const game = getGame(gameCode);
    if (!game || game.status !== "question") return;

    const recorded = recordAnswer(game, socket.id, answerIndex);
    if (!recorded) return;

    // Tell the player their answer was received
    socket.emit("game:answerReceived", { answerIndex });

    // Check if all players have answered — trigger early end
    const allAnswered = [...game.players.values()].every(
      (p) => p.answeredThisRound
    );
    if (allAnswered) {
      endQuestion(io, game);
    }
  });

  // ── Disconnect ───────────────────────────────────────────────
  socket.on("disconnect", () => {
    // Was this the host?
    const hostedGame = getGameByHostId(socket.id);
    if (hostedGame) {
      io.to(hostedGame.code).emit("game:hostLeft");
      deleteGame(hostedGame.code);
      console.log(`[Game] Host left, deleted game ${hostedGame.code}`);
      return;
    }

    // Was this a player?
    const joinedGame = getGameByPlayerId(socket.id);
    if (joinedGame) {
      const player = joinedGame.players.get(socket.id);
      removePlayer(joinedGame, socket.id);
      const players = getPlayersArray(joinedGame);
      io.to(`host:${joinedGame.code}`).emit("game:playerLeft", { players });
      console.log(`[Game] Player ${player?.name} left ${joinedGame.code}`);
    }
  });
}

// ── Internal: Start a question ───────────────────────────────
function startQuestion(io, game) {
  game.status = "question";
  game.timeLeft = game.questionTime;

  const question = getCurrentQuestion(game);
  io.to(game.code).emit("game:startQuestion", {
    ...question,
    timeLeft: game.questionTime,
  });

  // Countdown ticker
  game.timerInterval = setInterval(() => {
    game.timeLeft--;
    io.to(game.code).emit("game:tick", { timeLeft: game.timeLeft });

    if (game.timeLeft <= 0) {
      endQuestion(io, game);
    }
  }, 1000);
}

// ── Internal: End a question (timer expired or all answered) ─
function endQuestion(io, game) {
  if (game.timerInterval) {
    clearInterval(game.timerInterval);
    game.timerInterval = null;
  }
  // Guard: only end once
  if (game.status === "results") return;
  game.status = "results";

  const results = buildResults(game);
  io.to(game.code).emit("game:showResults", results);

  // After results — skip leaderboard in together mode
  setTimeout(() => {
    if (game.together) {
      // Go straight to next question or end
      if (hasMoreQuestions(game)) {
        advanceQuestion(game);
        startQuestion(io, game);
      } else {
        game.status = "finished";
        io.to(game.code).emit("game:finished", { leaderboard: [] });
      }
    } else {
      const leaderboard = buildLeaderboard(game);
      game.status = "leaderboard";
      io.to(game.code).emit("game:updateLeaderboard", { leaderboard });

      setTimeout(() => {
        if (hasMoreQuestions(game)) {
          advanceQuestion(game);
          startQuestion(io, game);
        } else {
          game.status = "finished";
          io.to(game.code).emit("game:finished", {
            leaderboard: buildLeaderboard(game),
          });
        }
      }, LEADERBOARD_DISPLAY_TIME);
    }
  }, RESULTS_DISPLAY_TIME);
}
