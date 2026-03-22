// Results screen shown after each question
const ANSWER_COLORS = ["bg-emerald-700", "bg-blue-800", "bg-amber-600", "bg-purple-800"];
const ANSWER_SHAPES = ["☪", "✦", "✸", "۞"];

export default function Results({ results, togetherMode }) {
  const { correctIndex, correctAnswer, distribution, answers, explanation, source } = results;
  const total = distribution.reduce((a, b) => a + b, 0);

  return (
    <div className="min-h-screen bg-brand-parchment dark:bg-brand-void flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-xl">
        <div className="text-center mb-6">
          <p className="text-brand-ink/50 dark:text-brand-cream/50 text-sm uppercase tracking-widest mb-1">
            Correct Answer
          </p>
          <h2 className="text-3xl font-extrabold text-brand-ink dark:text-brand-cream">{correctAnswer}</h2>
        </div>

        {/* Explanation */}
        {explanation && (
          <div className="bg-brand-linen dark:bg-brand-surface border border-brand-ink/8 dark:border-brand-cream/8 rounded-2xl px-4 py-3 mb-5">
            <p className="text-brand-ink dark:text-brand-cream/90 text-sm leading-relaxed">{explanation}</p>
            {source && (
              <p className="text-brand-ink/45 dark:text-brand-cream/45 text-xs mt-2 italic">
                📖 {source.reference || source.name}
              </p>
            )}
          </div>
        )}

        {/* Answer distribution bar chart */}
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
                    <div className="flex justify-between text-sm text-brand-ink dark:text-brand-cream mb-1">
                      <span className={isCorrect ? "font-bold" : ""}>{answer}</span>
                      <span className="text-brand-ink/55 dark:text-brand-cream/55">
                        {count} {count === 1 ? "player" : "players"} ({pct}%)
                      </span>
                    </div>
                    <div className="h-4 bg-brand-ink/10 dark:bg-brand-cream/10 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${
                          isCorrect
                            ? "bg-brand-amber dark:bg-brand-gold"
                            : "bg-brand-ink/20 dark:bg-brand-cream/25"
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                  {isCorrect && (
                    <span className="text-brand-amber dark:text-brand-gold text-xl flex-shrink-0">✓</span>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <p className="text-center text-brand-ink/40 dark:text-brand-cream/40 mt-8 text-sm animate-pulse">
          Leaderboard coming up…
        </p>
      </div>
    </div>
  );
}
