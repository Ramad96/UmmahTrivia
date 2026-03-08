// Results screen shown after each question
const ANSWER_COLORS = ["bg-emerald-700", "bg-blue-800", "bg-amber-600", "bg-purple-800"];
const ANSWER_SHAPES = ["☪", "✦", "✸", "۞"];

export default function Results({ results, togetherMode }) {
  const { correctIndex, correctAnswer, distribution, answers, explanation, source } = results;
  const total = distribution.reduce((a, b) => a + b, 0);

  return (
    <div className="min-h-screen bg-brand-green flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-xl">
        <div className="text-center mb-6">
          <p className="text-brand-sky/70 text-sm uppercase tracking-widest mb-1">
            Correct Answer
          </p>
          <h2 className="text-3xl font-extrabold text-white">{correctAnswer}</h2>
        </div>

        {/* Explanation */}
        {explanation && (
          <div className="bg-white/10 rounded-2xl px-4 py-3 mb-5">
            <p className="text-white/90 text-sm leading-relaxed">{explanation}</p>
            {source && (
              <p className="text-brand-sky/60 text-xs mt-2 italic">
                📖 {source.reference || source.name}
              </p>
            )}
          </div>
        )}

        {/* Bar chart of answer distribution — hidden in together mode */}
        {!togetherMode && (
          <div className="space-y-3">
            {answers.map((answer, i) => {
              const count = distribution[i];
              const pct = total > 0 ? Math.round((count / total) * 100) : 0;
              const isCorrect = i === correctIndex;

              return (
                <div key={i} className="flex items-center gap-3">
                  <span
                    className={`${ANSWER_COLORS[i]} text-white text-xl w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0`}
                  >
                    {ANSWER_SHAPES[i]}
                  </span>
                  <div className="flex-1">
                    <div className="flex justify-between text-sm text-white mb-1">
                      <span className={isCorrect ? "font-bold" : ""}>{answer}</span>
                      <span>
                        {count} {count === 1 ? "player" : "players"} ({pct}%)
                      </span>
                    </div>
                    <div className="h-4 bg-white/20 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${
                          isCorrect ? "bg-brand-gold" : "bg-white/50"
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                  {isCorrect && (
                    <span className="text-brand-gold text-xl flex-shrink-0">✓</span>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <p className="text-center text-brand-sky/70 mt-8 text-sm animate-pulse">
          Leaderboard coming up…
        </p>
      </div>
    </div>
  );
}
