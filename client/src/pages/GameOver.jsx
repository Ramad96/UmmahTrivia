import { useState } from "react";
import Leaderboard from "../components/Leaderboard";

const ANSWER_COLORS = ["bg-emerald-700", "bg-blue-800", "bg-amber-600", "bg-purple-800"];
const ANSWER_SHAPES = ["☪", "✦", "✸", "۞"];

function QuestionReview({ item, index }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="bg-white/10 rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full text-left px-4 py-3 flex items-start gap-3"
      >
        <span className="text-brand-sky/60 text-xs font-bold shrink-0 mt-0.5">
          Q{index + 1}
        </span>
        <span className="text-white text-sm flex-1 leading-snug">{item.questionText}</span>
        <span className="text-brand-sky/50 text-xs shrink-0 mt-0.5">{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-2">
          {item.answers.map((answer, i) => {
            const isCorrect = i === item.correctIndex;
            return (
              <div
                key={i}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm ${
                  isCorrect
                    ? "bg-brand-gold/20 border border-brand-gold/40"
                    : "bg-white/5"
                }`}
              >
                <span
                  className={`${ANSWER_COLORS[i]} text-white text-base w-7 h-7 rounded-lg flex items-center justify-center shrink-0`}
                >
                  {ANSWER_SHAPES[i]}
                </span>
                <span className={`flex-1 ${isCorrect ? "text-brand-gold font-semibold" : "text-white/70"}`}>
                  {answer}
                </span>
                {isCorrect && <span className="text-brand-gold text-sm">✓</span>}
              </div>
            );
          })}

          {item.explanation && (
            <div className="mt-2 bg-white/10 rounded-xl px-3 py-2">
              <p className="text-white/85 text-xs leading-relaxed">{item.explanation}</p>
              {item.source && (
                <p className="text-brand-sky/60 text-xs mt-1 italic">
                  📖 {item.source.reference || item.source.name}
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function GameOver({ leaderboard, gameHistory = [], onPlayAgain }) {
  const isTogetherMode = leaderboard.length === 0;
  const winner = leaderboard[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-green to-brand-midnight flex flex-col items-center p-4 py-8">
      <div className="w-full max-w-xl">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="text-6xl mb-3">{isTogetherMode ? "✅" : "🏆"}</div>
          <h1 className="text-4xl font-extrabold text-white mb-1">
            {isTogetherMode ? "Session Complete!" : "Game Over!"}
          </h1>
          {isTogetherMode ? (
            <p className="text-brand-sky text-base max-w-xs mx-auto leading-relaxed">
              You've finished all the questions. JazakAllahu Khayran for learning today.
            </p>
          ) : (
            winner && (
              <p className="text-brand-sky text-lg">
                Winner: <span className="text-brand-gold font-bold">{winner.name}</span> with{" "}
                <span className="text-brand-gold font-bold">{winner.score.toLocaleString()}</span> pts
              </p>
            )
          )}
        </div>

        {!isTogetherMode && <Leaderboard leaderboard={leaderboard} />}

        {/* Question Review */}
        {gameHistory.length > 0 && (
          <div className="mt-8">
            <h2 className="text-white font-bold text-base mb-3 px-1">
              📋 Question Review ({gameHistory.length})
            </h2>
            <div className="space-y-2">
              {gameHistory.map((item, i) => (
                <QuestionReview key={i} item={item} index={i} />
              ))}
            </div>
          </div>
        )}

        <button
          onClick={onPlayAgain}
          className="mt-8 w-full bg-white text-brand-green font-bold px-8 py-3 rounded-2xl shadow hover:bg-brand-sky transition active:scale-95"
        >
          Back to Home
        </button>
      </div>
    </div>
  );
}
