import Timer from "../components/Timer";

// Answer button colors — distinct for quick visual identification
const ANSWER_COLORS = [
  "bg-red-500 hover:bg-red-600",
  "bg-[#1a6b8a] hover:bg-[#155a75]",
  "bg-brand-gold hover:opacity-90",
  "bg-brand-green hover:bg-brand-midnight",
];

const ANSWER_SHAPES = ["▲", "■", "●", "✦"];

export default function Question({
  question,
  questionIndex,
  total,
  timeLeft,
  selectedAnswer,
  onAnswer,
  isHost,
}) {
  return (
    <div className="min-h-screen bg-brand-green flex flex-col">
      {/* Header bar */}
      <div className="flex items-center justify-between px-6 py-3 bg-brand-midnight">
        <span className="text-brand-sky/70 text-sm font-medium">
          Question {questionIndex + 1} / {total}
        </span>
        <Timer timeLeft={timeLeft} total={10} />
        <span className="text-brand-sky/70 text-sm font-medium w-24 text-right">
          {isHost ? "HOST VIEW" : ""}
        </span>
      </div>

      {/* Question text */}
      <div className="flex-1 flex items-center justify-center px-6 py-8">
        <h2 className="text-2xl md:text-3xl font-bold text-white text-center max-w-2xl leading-snug">
          {question.text}
        </h2>
      </div>

      {/* Answer grid */}
      <div className="grid grid-cols-2 gap-3 p-4 pb-8 max-w-2xl mx-auto w-full">
        {question.answers.map((answer, i) => {
          const isSelected = selectedAnswer === i;
          return (
            <button
              key={i}
              onClick={() => !isHost && onAnswer(i)}
              disabled={selectedAnswer !== null || isHost}
              className={`
                ${ANSWER_COLORS[i]}
                text-white font-bold py-5 px-4 rounded-2xl text-left
                flex items-center gap-3 shadow-lg
                transition active:scale-95
                disabled:cursor-not-allowed
                ${isSelected ? "ring-4 ring-white scale-95" : ""}
                ${selectedAnswer !== null && !isSelected ? "opacity-60" : ""}
              `}
            >
              <span className="text-2xl">{ANSWER_SHAPES[i]}</span>
              <span className="text-sm md:text-base leading-tight">{answer}</span>
            </button>
          );
        })}
      </div>

      {selectedAnswer !== null && !isHost && (
        <p className="text-center text-brand-sky pb-4 text-sm animate-pulse">
          Answer locked in! Waiting for others…
        </p>
      )}
    </div>
  );
}
