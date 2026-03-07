// Results screen shown after each question
const ANSWER_COLORS = ["bg-red-500", "bg-blue-500", "bg-yellow-500", "bg-green-500"];
const ANSWER_SHAPES = ["▲", "■", "●", "✦"];

export default function Results({ results }) {
  const { correctIndex, correctAnswer, distribution, answers } = results;
  const total = distribution.reduce((a, b) => a + b, 0);

  return (
    <div className="min-h-screen bg-indigo-700 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-xl">
        <div className="text-center mb-8">
          <p className="text-indigo-300 text-sm uppercase tracking-widest mb-1">
            Correct Answer
          </p>
          <h2 className="text-3xl font-extrabold text-white">{correctAnswer}</h2>
        </div>

        {/* Bar chart of answer distribution */}
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
                        isCorrect ? "bg-green-400" : "bg-white/50"
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
                {isCorrect && (
                  <span className="text-green-400 text-xl flex-shrink-0">✓</span>
                )}
              </div>
            );
          })}
        </div>

        <p className="text-center text-indigo-300 mt-8 text-sm animate-pulse">
          Leaderboard coming up…
        </p>
      </div>
    </div>
  );
}
