import { useState } from "react";
import PlayerList from "../components/PlayerList";

// topics prop is now an array of { key, label, icon } objects from the server
// No hardcoded maps needed — adding a topic only requires sync-topics + restart

const DIFFICULTY_LABELS = { easy: "Easy", medium: "Medium", hard: "Hard" };
const TIMER_OPTIONS = [10, 15, 20];

export default function Lobby({ gameCode, players, isHost, playerName, topics, onStart }) {
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState("easy");
  const [mode, setMode] = useState("normal"); // "normal" | "increasing"
  const [timePerQuestion, setTimePerQuestion] = useState(10);
  const [together, setTogether] = useState(false);

  const canStart = (together || players.length > 0) && selectedTopic !== null;

  function handleStart() {
    onStart({ topic: selectedTopic, difficulty: selectedDifficulty, mode, timePerQuestion, together });
  }

  function handleRandomTopic() {
    setSelectedTopic("random");
    setMode("normal");
  }

  function handleIncreasingDifficulty() {
    setMode("increasing");
    if (!selectedTopic) setSelectedTopic("random");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-green to-brand-midnight flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-6 w-full max-w-xl">

        {/* Game code */}
        <div className="text-center mb-5">
          <p className="text-gray-400 uppercase tracking-widest text-xs mb-1">Game Code</p>
          <h1 className="text-5xl font-extrabold text-brand-green tracking-widest">
            {gameCode}
          </h1>
        </div>

        {/* Players */}
        <div className="mb-5">
          <p className="text-gray-400 text-xs text-center mb-2">
            {players.length === 0
              ? together ? "Together mode — no players needed" : "Waiting for players to join…"
              : `${players.length} player${players.length === 1 ? "" : "s"} in lobby`}
          </p>
          <PlayerList players={players} />
        </div>

        {!isHost && playerName && (
          <div className="mb-4 px-4 py-2 bg-brand-sky rounded-xl text-center">
            <p className="text-brand-green font-semibold text-sm">
              You are: <span className="text-brand-midnight font-extrabold">{playerName}</span>
            </p>
          </div>
        )}

        {/* ── Host controls ── */}
        {isHost && (
          <div className="border-t border-gray-100 pt-5 space-y-5">

            {/* Topic selection — driven entirely by server manifest */}
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Topic
              </p>
              <div className="grid grid-cols-2 gap-2">
                {topics.map(({ key, label, icon }) => (
                  <button
                    key={key}
                    onClick={() => { setSelectedTopic(key); setMode("normal"); }}
                    className={`flex items-center gap-2 px-3 py-3 rounded-xl border-2 text-left font-semibold text-sm transition active:scale-95
                      ${selectedTopic === key && mode !== "increasing"
                        ? "border-brand-green bg-brand-sky text-brand-green"
                        : "border-gray-200 text-gray-600 hover:border-brand-green/40"
                      }`}
                  >
                    <span className="text-xl">{icon}</span>
                    {label}
                  </button>
                ))}

                {/* Random topic */}
                <button
                  onClick={handleRandomTopic}
                  className={`flex items-center gap-2 px-3 py-3 rounded-xl border-2 text-left font-semibold text-sm transition active:scale-95 col-span-2
                    ${selectedTopic === "random" && mode !== "increasing"
                      ? "border-brand-gold bg-amber-50 text-brand-midnight"
                      : "border-dashed border-gray-300 text-gray-400 hover:border-brand-gold/60 hover:text-brand-midnight"
                    }`}
                >
                  <span className="text-xl">🎲</span>
                  Random Topic
                </button>
              </div>
            </div>

            {/* Difficulty / Mode */}
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Difficulty
              </p>
              <div className="flex gap-2">
                {Object.entries(DIFFICULTY_LABELS).map(([diff, label]) => (
                  <button
                    key={diff}
                    onClick={() => { setSelectedDifficulty(diff); setMode("normal"); }}
                    className={`flex-1 py-2 rounded-xl border-2 text-sm font-semibold transition active:scale-95
                      ${mode === "normal" && selectedDifficulty === diff
                        ? "border-brand-green bg-brand-sky text-brand-green"
                        : "border-gray-200 text-gray-500 hover:border-brand-green/40"
                      }`}
                  >
                    {label}
                  </button>
                ))}

                {/* Increasing difficulty mode */}
                <button
                  onClick={handleIncreasingDifficulty}
                  className={`flex-1 py-2 rounded-xl border-2 text-sm font-semibold transition active:scale-95
                    ${mode === "increasing"
                      ? "border-brand-gold bg-amber-50 text-brand-midnight"
                      : "border-dashed border-gray-300 text-gray-400 hover:border-brand-gold/60 hover:text-brand-midnight"
                    }`}
                >
                  Increasing
                </button>
              </div>
              {mode === "increasing" && (
                <p className="text-xs text-gray-400 mt-1 text-center">
                  5 easy → 5 medium → 5 hard (15 questions)
                </p>
              )}
            </div>

            {/* Timer per question */}
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Time per Question
              </p>
              <div className="flex gap-2">
                {TIMER_OPTIONS.map((secs) => (
                  <button
                    key={secs}
                    onClick={() => setTimePerQuestion(secs)}
                    className={`flex-1 py-2 rounded-xl border-2 text-sm font-semibold transition active:scale-95
                      ${timePerQuestion === secs
                        ? "border-brand-green bg-brand-sky text-brand-green"
                        : "border-gray-200 text-gray-500 hover:border-brand-green/40"
                      }`}
                  >
                    {secs}s
                  </button>
                ))}
              </div>
            </div>

            {/* Play Mode */}
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Play Mode
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setTogether(false)}
                  className={`flex-1 py-2 rounded-xl border-2 text-sm font-semibold transition active:scale-95
                    ${!together
                      ? "border-brand-green bg-brand-sky text-brand-green"
                      : "border-gray-200 text-gray-500 hover:border-brand-green/40"
                    }`}
                >
                  Multiplayer
                </button>
                <button
                  onClick={() => setTogether(true)}
                  className={`flex-1 py-2 rounded-xl border-2 text-sm font-semibold transition active:scale-95
                    ${together
                      ? "border-brand-gold bg-amber-50 text-brand-midnight"
                      : "border-dashed border-gray-300 text-gray-400 hover:border-brand-gold/60 hover:text-brand-midnight"
                    }`}
                >
                  Together
                </button>
              </div>
              {together && (
                <p className="text-xs text-gray-400 mt-1 text-center">
                  No players needed — go through questions yourself
                </p>
              )}
            </div>

            {/* Start button */}
            <button
              onClick={handleStart}
              disabled={!canStart}
              className="w-full bg-brand-gold text-brand-midnight font-bold py-4 rounded-2xl text-xl hover:opacity-90 transition disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
            >
              {canStart
                ? together ? "Start Session" : "Start Game"
                : "Pick a topic to start"}
            </button>
          </div>
        )}

        {!isHost && (
          <p className="text-gray-400 italic text-center text-sm mt-2">
            Waiting for the host to start the game…
          </p>
        )}
      </div>
    </div>
  );
}
