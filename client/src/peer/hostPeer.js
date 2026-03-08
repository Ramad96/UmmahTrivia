// Host-side PeerJS layer
// The host's browser acts as the game server.
// Peer ID: "ut-{gameCode}" so players can connect directly with the code.

import Peer from "peerjs";
import {
  createGameState,
  addPlayer,
  removePlayer,
  getPlayersArray,
  getCurrentQuestion,
  recordAnswer,
  allPlayersAnswered,
  buildResults,
  buildLeaderboard,
  advanceQuestion,
  hasMoreQuestions,
} from "../game/gameEngine.js";
import {
  loadTopics,
  getQuestions,
  getIncreasingDifficultyQuestions,
  getQuestionsFromTopics,
} from "../game/questions.js";

const RESULTS_DISPLAY_TIME = 5000;
const LEADERBOARD_DISPLAY_TIME = 4000;
const ALLOWED_QUESTION_TIMES = [10, 15, 20];
const DEFAULT_QUESTION_TIME = 10;

export class HostPeer {
  constructor(callbacks) {
    // callbacks: { onPlayersChanged, onError }
    this.callbacks = callbacks;
    this.peer = null;
    this.game = null;
    this.gameCode = null;
    this.connections = new Map(); // peerId → DataConnection
    this.topics = [];
  }

  async init() {
    this.topics = await loadTopics();
    const code = String(Math.floor(100000 + Math.random() * 900000));
    this.gameCode = code;
    this.game = createGameState();

    return new Promise((resolve, reject) => {
      const peer = new Peer(`ut-${code}`);
      this.peer = peer;

      peer.on("open", () => {
        resolve({ gameCode: code, topics: this.topics });
      });

      peer.on("error", (err) => {
        // If peer ID is taken, retry with a new code
        if (err.type === "unavailable-id") {
          peer.destroy();
          this.init().then(resolve).catch(reject);
        } else {
          reject(err);
        }
      });

      peer.on("connection", (conn) => {
        this._handleConnection(conn);
      });
    });
  }

  _handleConnection(conn) {
    conn.on("open", () => {
      // Guard: only accept during lobby
      if (this.game.status !== "lobby") {
        conn.send({ type: "player:joinAck", success: false, error: "Game already started" });
        conn.close();
        return;
      }

      const preferredName = conn.metadata?.name || "";
      const name = addPlayer(this.game, conn.peer, preferredName);
      this.connections.set(conn.peer, conn);

      const players = getPlayersArray(this.game);

      // Ack the joining player
      conn.send({ type: "player:joinAck", success: true, playerName: name, players });

      // Notify all (including host UI) of updated player list
      this.broadcast({ type: "game:playerJoined", players });
      this.callbacks.onPlayersChanged(players);

      conn.on("data", (msg) => this._handleMessage(conn.peer, msg));

      conn.on("close", () => this._handlePlayerLeft(conn.peer));
      conn.on("error", () => this._handlePlayerLeft(conn.peer));
    });
  }

  _handlePlayerLeft(peerId) {
    if (!this.game.players.has(peerId)) return;
    const leavingName = this.game.players.get(peerId)?.name || "A player";
    removePlayer(this.game, peerId);
    this.connections.delete(peerId);
    const players = getPlayersArray(this.game);
    this.broadcast({ type: "game:playerLeft", players, playerName: leavingName });
    this.callbacks.onPlayersChanged(players);
    this.callbacks.onPlayerLeft?.(leavingName);
  }

  _handleMessage(peerId, msg) {
    if (msg.type === "player:submitAnswer") {
      if (this.game.status !== "question") return;
      const recorded = recordAnswer(this.game, peerId, msg.answerIndex);
      if (!recorded) return;

      // Ack back to the answering player
      const conn = this.connections.get(peerId);
      if (conn) conn.send({ type: "game:answerReceived", answerIndex: msg.answerIndex });

      if (allPlayersAnswered(this.game)) {
        this._endQuestion();
      }
    }
  }

  broadcast(msg) {
    for (const conn of this.connections.values()) {
      if (conn.open) conn.send(msg);
    }
  }

  async startGame({ topicKeys, topicLabel, difficulty, mode, timePerQuestion, together, questionCount, bonusTimeEnabled }) {
    if (this.game.status !== "lobby") return;
    if (!together && this.game.players.size === 0) return;

    this.game.questionTime = ALLOWED_QUESTION_TIMES.includes(timePerQuestion)
      ? timePerQuestion
      : DEFAULT_QUESTION_TIME;
    this.game.together = !!together;
    this.game.topicLabel = topicLabel || "";
    this.game.bonusTimeEnabled = bonusTimeEnabled !== false;

    let questions;
    if (topicKeys.length === 1) {
      questions = mode === "increasing"
        ? await getIncreasingDifficultyQuestions(topicKeys[0])
        : await getQuestions(topicKeys[0], difficulty);
    } else {
      questions = await getQuestionsFromTopics(topicKeys, difficulty, mode);
    }

    this.game.questions = questions.slice(0, questionCount || 10);
    this.game.status = "question";

    this._startQuestion();
  }

  _startQuestion() {
    this.game.status = "question";

    const question = getCurrentQuestion(this.game);

    // Add bonus time for questions with any long answer (> 10 words)
    const hasLongAnswer = this.game.bonusTimeEnabled && question.answers.some(
      (a) => a.trim().split(/\s+/).length > 10
    );
    const bonusTime = hasLongAnswer ? 10 : 0;
    const totalTime = this.game.questionTime + bonusTime;

    this.game.timeLeft = totalTime;

    const questionData = {
      ...question,
      timeLeft: totalTime,
      questionTime: totalTime,
      isBonusTime: hasLongAnswer,
      topicLabel: this.game.topicLabel,
    };
    this.broadcast({ type: "game:startQuestion", ...questionData });
    // Also fire callback so host UI updates
    this.callbacks.onStartQuestion(questionData);

    this.game.timerInterval = setInterval(() => {
      this.game.timeLeft--;
      const tickMsg = { type: "game:tick", timeLeft: this.game.timeLeft };
      this.broadcast(tickMsg);
      this.callbacks.onTick(this.game.timeLeft);

      if (this.game.timeLeft <= 0) {
        this._endQuestion();
      }
    }, 1000);
  }

  _endQuestion() {
    if (this.game.timerInterval) {
      clearInterval(this.game.timerInterval);
      this.game.timerInterval = null;
    }
    if (this.game.status === "results") return;
    this.game.status = "results";

    const results = buildResults(this.game);
    this.broadcast({ type: "game:showResults", ...results });
    this.callbacks.onShowResults(results);

    setTimeout(() => {
      if (this.game.together) {
        if (hasMoreQuestions(this.game)) {
          advanceQuestion(this.game);
          this._startQuestion();
        } else {
          this.game.status = "finished";
          this.broadcast({ type: "game:finished", leaderboard: [] });
          this.callbacks.onFinished([]);
        }
      } else {
        const leaderboard = buildLeaderboard(this.game);
        this.game.status = "leaderboard";
        this.broadcast({ type: "game:updateLeaderboard", leaderboard });
        this.callbacks.onUpdateLeaderboard(leaderboard);

        setTimeout(() => {
          if (hasMoreQuestions(this.game)) {
            advanceQuestion(this.game);
            this._startQuestion();
          } else {
            this.game.status = "finished";
            const finalLeaderboard = buildLeaderboard(this.game);
            this.broadcast({ type: "game:finished", leaderboard: finalLeaderboard });
            this.callbacks.onFinished(finalLeaderboard);
          }
        }, LEADERBOARD_DISPLAY_TIME);
      }
    }, RESULTS_DISPLAY_TIME);
  }

  destroy() {
    if (this.game?.timerInterval) clearInterval(this.game.timerInterval);
    this.broadcast({ type: "game:hostLeft" });
    for (const conn of this.connections.values()) conn.close();
    this.peer?.destroy();
    this.game = null;
    this.connections.clear();
  }
}
