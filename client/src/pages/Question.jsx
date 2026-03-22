import Timer from "../components/Timer";

// Answer button colors — Islamic-inspired palette (same in both modes)
const ANSWER_COLORS = [
  "bg-emerald-700 hover:bg-emerald-800",
  "bg-blue-800 hover:bg-blue-900",
  "bg-amber-600 hover:bg-amber-700",
  "bg-purple-800 hover:bg-purple-900",
];

const ANSWER_SHAPES = ["☪", "✦", "✸", "۞"];

export default function Question({
  question,
  questionIndex,
  total,
  timeLeft,
  questionTime,
  topicLabel,
  selectedAnswer,
  onAnswer,
  isHost,
  playerName,
  isBonusTime,
}) {
  return (
    <div className="h-screen bg-brand-parchment dark:bg-brand-void flex flex-col overflow-hidden">
      {/* Header bar */}
      <div className="flex items-center justify-between px-6 py-3 bg-brand-linen dark:bg-brand-surface shrink-0">
        <div className="flex flex-col">
          <span className="text-brand-ink/60 dark:text-brand-cream/60 text-sm font-medium">
            Q {questionIndex + 1} / {total}
          </span>
          {topicLabel && (
            <span className="text-brand-ink/35 dark:text-brand-cream/35 text-xs">{topicLabel}</span>
          )}
        </div>
        <Timer timeLeft={timeLeft} total={questionTime} isBonusTime={isBonusTime} />
        <span className="text-brand-ink/60 dark:text-brand-cream/60 text-sm font-medium w-24 text-right">
          {isHost ? "HOST VIEW" : playerName || ""}
        </span>
      </div>

      {/* Centered content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-4 gap-5 min-h-0">
        <h2 className="text-xl md:text-3xl font-bold text-brand-ink dark:text-brand-cream text-center max-w-2xl leading-snug px-2">
          {question.text}
        </h2>

        <div className="grid grid-cols-2 gap-2 w-full max-w-2xl">
          {question.answers.map((answer, i) => {
            const isSelected = selectedAnswer === i;
            return (
              <button
                key={i}
                onClick={() => !isHost && onAnswer(i)}
                disabled={isHost}
                className={`
                  ${ANSWER_COLORS[i]}
                  text-white font-bold py-3 px-3 rounded-2xl text-left
                  flex items-center gap-2 shadow-lg
                  transition active:scale-95
                  disabled:cursor-not-allowed
                  ${isSelected ? "ring-4 ring-white scale-[0.97]" : ""}
                  ${selectedAnswer !== null && !isSelected ? "opacity-60" : ""}
                `}
              >
                <span className="text-xl shrink-0">{ANSWER_SHAPES[i]}</span>
                <span className="text-sm leading-tight">{answer}</span>
              </button>
            );
          })}
        </div>

        <p className="text-brand-amber dark:text-brand-gold text-sm h-5">
          {selectedAnswer !== null && !isHost ? "Answer selected – tap another to change" : ""}
        </p>
      </div>
    </div>
  );
}
