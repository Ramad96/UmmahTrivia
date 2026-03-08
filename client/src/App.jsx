import { useState, useEffect, useCallback, useRef } from "react";
import { HostPeer } from "./peer/hostPeer";
import { PlayerPeer } from "./peer/playerPeer";

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
  const [topicLabel, setTopicLabel] = useState("");
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [results, setResults] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);

  // Refs so callbacks inside HostPeer/PlayerPeer always see latest state setters
  const hostRef = useRef(null);
  const playerRef = useRef(null);

  const resetToHome = useCallback(() => {
    hostRef.current?.destroy();
    playerRef.current?.destroy();
    hostRef.current = null;
    playerRef.current = null;

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

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      hostRef.current?.destroy();
      playerRef.current?.destroy();
    };
  }, []);

  // ── Host: Create Game ──────────────────────────────────────────
  async function handleHostGame() {
    try {
      const host = new HostPeer({
        onPlayersChanged: (players) => setPlayers(players),
        onStartQuestion: (data) => {
          setQuestion({ text: data.text, answers: data.answers });
          setQuestionIndex(data.questionIndex);
          setTotalQuestions(data.total);
          setQuestionTime(data.timeLeft);
          setTimeLeft(data.timeLeft);
          setTopicLabel(data.topicLabel || "");
          setSelectedAnswer(null);
          setResults(null);
          setScreen(SCREENS.QUESTION);
        },
        onTick: (t) => setTimeLeft(t),
        onShowResults: (data) => {
          setResults(data);
          setScreen(SCREENS.RESULTS);
        },
        onUpdateLeaderboard: (lb) => {
          setLeaderboard(lb);
          setScreen(SCREENS.LEADERBOARD);
        },
        onFinished: (lb) => {
          setLeaderboard(lb);
          setScreen(SCREENS.GAME_OVER);
        },
        onError: (err) => alert(`Host error: ${err.message}`),
      });

      const { gameCode: code, topics: t } = await host.init();
      hostRef.current = host;
      setIsHost(true);
      setGameCode(code);
      setTopics(t);
      setPlayers([]);
      setScreen(SCREENS.LOBBY);
    } catch (err) {
      alert(`Failed to create game: ${err.message}`);
    }
  }

  // ── Player: Join Game ──────────────────────────────────────────
  async function handleJoinGame(code) {
    const peer = new PlayerPeer({
      onJoinAck: ({ success, playerName: name, players: pl, error }) => {
        if (success) {
          setPlayerName(name);
          setPlayers(pl);
          setScreen(SCREENS.LOBBY);
        } else {
          alert(error || "Failed to join game");
          peer.destroy();
        }
      },
      onPlayerJoined: ({ players: pl }) => setPlayers(pl),
      onPlayerLeft: ({ players: pl }) => setPlayers(pl),
      onStartQuestion: (data) => {
        setQuestion({ text: data.text, answers: data.answers });
        setQuestionIndex(data.questionIndex);
        setTotalQuestions(data.total);
        setQuestionTime(data.timeLeft);
        setTimeLeft(data.timeLeft);
        setTopicLabel(data.topicLabel || "");
        setSelectedAnswer(null);
        setResults(null);
        setScreen(SCREENS.QUESTION);
      },
      onTick: ({ timeLeft: t }) => setTimeLeft(t),
      onShowResults: (data) => {
        setResults(data);
        setScreen(SCREENS.RESULTS);
      },
      onUpdateLeaderboard: ({ leaderboard: lb }) => {
        setLeaderboard(lb);
        setScreen(SCREENS.LEADERBOARD);
      },
      onFinished: ({ leaderboard: lb }) => {
        setLeaderboard(lb);
        setScreen(SCREENS.GAME_OVER);
      },
      onHostLeft: () => {
        alert("The host has left the game.");
        resetToHome();
      },
    });

    try {
      await peer.join(code);
      playerRef.current = peer;
      setGameCode(code);
    } catch (err) {
      alert(err.message || "Failed to join game");
      peer.destroy();
    }
  }

  // ── Host: Start Game ───────────────────────────────────────────
  function handleStartGame({ topicKeys, topicLabel, difficulty, mode, timePerQuestion, together, questionCount }) {
    setTogetherMode(together);
    hostRef.current?.startGame({ topicKeys, topicLabel, difficulty, mode, timePerQuestion, together, questionCount });
  }

  // ── Player: Submit Answer ──────────────────────────────────────
  function handleAnswerSelect(answerIndex) {
    if (answerIndex === selectedAnswer) return;
    setSelectedAnswer(answerIndex);
    playerRef.current?.submitAnswer(answerIndex);
  }

  // ── Render ─────────────────────────────────────────────────────
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
          topicLabel={topicLabel}
          selectedAnswer={selectedAnswer}
          onAnswer={handleAnswerSelect}
          isHost={isHost && !togetherMode}
        />
      ) : null;

    case SCREENS.RESULTS:
      return results ? <Results results={results} togetherMode={togetherMode} /> : null;

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
