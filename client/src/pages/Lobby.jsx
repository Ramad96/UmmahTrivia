import { useState } from "react";
import PlayerList from "../components/PlayerList";

// topics prop is now an array of { key, label, icon } objects from the server
// No hardcoded maps needed — adding a topic only requires sync-topics + restart

const DIFFICULTY_LABELS = { easy: "Easy", medium: "Medium", hard: "Hard" };
const TIMER_OPTIONS = [10, 15, 20];
const QUESTION_COUNT_OPTIONS = [6, 10, 14, 18];

export default function Lobby({ gameCode, players, isHost, playerName, topics, onStart }) {
  const [selectedTopics, setSelectedTopics] = useState(new Set());
  const [selectedDifficulty, setSelectedDifficulty] = useState("easy");
  const [mode, setMode] = useState("normal"); // "normal" | "increasing"
  const [timePerQuestion, setTimePerQuestion] = useState(10);
  const [together, setTogether] = useState(false);
  const [questionCount, setQuestionCount] = useState(10);
  const [bonusTimeEnabled, setBonusTimeEnabled] = useState(true);

  const canStart = (together || players.length > 0) && selectedTopics.size > 0;

  function toggleTopic(key) {
    setSelectedTopics((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function toggleAllTopics() {
    if (selectedTopics.size === topics.length) {
      setSelectedTopics(new Set());
    } else {
      setSelectedTopics(new Set(topics.map((t) => t.key)));
    }
  }

  function handleStart() {
    const topicKeys = [...selectedTopics];
    const topicLabel =
      topicKeys.length === topics.length
        ? "All Topics"
        : topicKeys.length === 1
        ? topics.find((t) => t.key === topicKeys[0])?.label ?? ""
        : "Mixed Topics";
    onStart({ topicKeys, topicLabel, difficulty: selectedDifficulty, mode, timePerQuestion, together, questionCount, bonusTimeEnabled });
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

            {/* Topic selection — multi-select */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Topics
                </p>
                <button
                  onClick={toggleAllTopics}
                  className="text-xs text-brand-green font-semibold hover:underline"
                >
                  {selectedTopics.size === topics.length ? "Deselect all" : "Select all"}
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {topics.map(({ key, label, icon }) => {
                  const isSelected = selectedTopics.has(key);
                  return (
                    <button
                      key={key}
                      onClick={() => toggleTopic(key)}
                      className={`flex items-center gap-2 px-3 py-3 rounded-xl border-2 text-left font-semibold text-sm transition active:scale-95
                        ${isSelected
                          ? "border-brand-green bg-brand-sky text-brand-green"
                          : "border-gray-200 text-gray-600 hover:border-brand-green/40"
                        }`}
                    >
                      <span className="text-xl">{icon}</span>
                      <span className="flex-1">{label}</span>
                      {isSelected && <span className="text-brand-green text-xs">✓</span>}
                    </button>
                  );
                })}
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
                  onClick={() => setMode("increasing")}
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

            {/* Bonus Time */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Bonus Time
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  ⚡ +10s for questions with long answers
                </p>
              </div>
              <button
                onClick={() => setBonusTimeEnabled((v) => !v)}
                className={`relative inline-flex w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none shrink-0 ${
                  bonusTimeEnabled ? "bg-brand-green" : "bg-gray-300"
                }`}
                role="switch"
                aria-checked={bonusTimeEnabled}
              >
                <span
                  className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${
                    bonusTimeEnabled ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {/* Number of Questions */}
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Questions
              </p>
              <div className="flex gap-2">
                {QUESTION_COUNT_OPTIONS.map((n) => (
                  <button
                    key={n}
                    onClick={() => setQuestionCount(n)}
                    className={`flex-1 py-2 rounded-xl border-2 text-sm font-semibold transition active:scale-95
                      ${questionCount === n
                        ? "border-brand-green bg-brand-sky text-brand-green"
                        : "border-gray-200 text-gray-500 hover:border-brand-green/40"
                      }`}
                  >
                    {n}
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
                : "Pick at least one topic to start"}
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
