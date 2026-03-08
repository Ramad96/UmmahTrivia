import { useState, useEffect, useCallback } from "react";
import socket from "./socket/socket";

import Home from "./pages/Home";
import Join from "./pages/Join";
import Lobby from "./pages/Lobby";
import Question from "./pages/Question";
import Results from "./pages/Results";
import LeaderboardPage from "./pages/LeaderboardPage";
import GameOver from "./pages/GameOver";

const SCREENS = {
  HOME: "home",
  JOIN: "join",
  LOBBY: "lobby",
  QUESTION: "question",
  RESULTS: "results",
  LEADERBOARD: "leaderboard",
  GAME_OVER: "game_over",
};

export default function App() {
  const [screen, setScreen] = useState(SCREENS.HOME);
  const [isHost, setIsHost] = useState(false);
  const [gameCode, setGameCode] = useState("");
  const [playerName, setPlayerName] = useState("");
  const [players, setPlayers] = useState([]);
  const [topics, setTopics] = useState([]);
  const [question, setQuestion] = useState(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(10);
  const [questionTime, setQuestionTime] = useState(10);
  const [timeLeft, setTimeLeft] = useState(10);
  const [togetherMode, setTogetherMode] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [results, setResults] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);

  // ── Socket Event Listeners ──────────────────────────────────
  useEffect(() => {
    socket.on("game:playerJoined", ({ players }) => {
      setPlayers(players);
    });

    socket.on("game:playerLeft", ({ players }) => {
      setPlayers(players);
    });

    socket.on("game:startQuestion", (data) => {
      setQuestion({ text: data.text, answers: data.answers });
      setQuestionIndex(data.questionIndex);
      setTotalQuestions(data.total);
      setQuestionTime(data.timeLeft); // first timeLeft = full question duration
      setTimeLeft(data.timeLeft);
      setSelectedAnswer(null);
      setResults(null);
      setScreen(SCREENS.QUESTION);
    });

    socket.on("game:tick", ({ timeLeft }) => {
      setTimeLeft(timeLeft);
    });

    socket.on("game:showResults", (data) => {
      setResults(data);
      setScreen(SCREENS.RESULTS);
    });

    socket.on("game:updateLeaderboard", ({ leaderboard }) => {
      setLeaderboard(leaderboard);
      setScreen(SCREENS.LEADERBOARD);
    });

    socket.on("game:finished", ({ leaderboard }) => {
      setLeaderboard(leaderboard);
      setScreen(SCREENS.GAME_OVER);
    });

    socket.on("game:hostLeft", () => {
      alert("The host has left the game.");
      resetToHome();
    });

    return () => {
      socket.off("game:playerJoined");
      socket.off("game:playerLeft");
      socket.off("game:startQuestion");
      socket.off("game:tick");
      socket.off("game:showResults");
      socket.off("game:updateLeaderboard");
      socket.off("game:finished");
      socket.off("game:hostLeft");
    };
  }, []);

  // ── Actions ─────────────────────────────────────────────────
  const resetToHome = useCallback(() => {
    setScreen(SCREENS.HOME);
    setIsHost(false);
    setGameCode("");
    setPlayerName("");
    setPlayers([]);
    setTopics([]);
    setQuestion(null);
    setResults(null);
    setLeaderboard([]);
    setSelectedAnswer(null);
    setTogetherMode(false);
  }, []);

  function handleHostGame() {
    socket.emit("host:createGame", ({ success, gameCode, topics }) => {
      if (success) {
        setIsHost(true);
        setGameCode(gameCode);
        setPlayers([]);
        setTopics(topics);
        setScreen(SCREENS.LOBBY);
      }
    });
  }

  function handleJoinGame(code) {
    socket.emit(
      "player:joinGame",
      { gameCode: code },
      ({ success, playerName, players, error }) => {
        if (success) {
          setIsHost(false);
          setGameCode(code);
          setPlayerName(playerName);
          setPlayers(players);
          setScreen(SCREENS.LOBBY);
        } else {
          alert(error || "Failed to join game");
        }
      }
    );
  }

  function handleStartGame({ topic, difficulty, mode, timePerQuestion, together }) {
    setTogetherMode(together);
    socket.emit("host:startGame", { gameCode, topic, difficulty, mode, timePerQuestion, together });
  }

  function handleAnswerSelect(answerIndex) {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(answerIndex);
    socket.emit("player:submitAnswer", { gameCode, answerIndex });
  }

  // ── Render ──────────────────────────────────────────────────
  switch (screen) {
    case SCREENS.HOME:
      return <Home onHost={handleHostGame} onJoin={() => setScreen(SCREENS.JOIN)} />;

    case SCREENS.JOIN:
      return <Join onJoin={handleJoinGame} onBack={() => setScreen(SCREENS.HOME)} />;

    case SCREENS.LOBBY:
      return (
        <Lobby
          gameCode={gameCode}
          players={players}
          isHost={isHost}
          playerName={playerName}
          topics={topics}
          onStart={handleStartGame}
        />
      );

    case SCREENS.QUESTION:
      return question ? (
        <Question
          question={question}
          questionIndex={questionIndex}
          total={totalQuestions}
          timeLeft={timeLeft}
          questionTime={questionTime}
          selectedAnswer={selectedAnswer}
          onAnswer={handleAnswerSelect}
          isHost={isHost && !togetherMode}
        />
      ) : null;

    case SCREENS.RESULTS:
      return results ? <Results results={results} /> : null;

    case SCREENS.LEADERBOARD:
      return (
        <LeaderboardPage
          leaderboard={leaderboard}
          questionIndex={questionIndex}
          total={totalQuestions}
        />
      );

    case SCREENS.GAME_OVER:
      return <GameOver leaderboard={leaderboard} onPlayAgain={resetToHome} />;

    default:
      return null;
  }
}
