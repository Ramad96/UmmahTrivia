import { useState, useEffect } from "react";

const DIFFICULTY_ORDER = ["easy", "medium", "hard"];
const DIFFICULTY_COLOURS = {
  easy: "text-green-600 dark:text-green-400",
  medium: "text-yellow-600 dark:text-yellow-400",
  hard: "text-red-600 dark:text-red-400",
};

function QuestionCard({ q, index }) {
  const keys = ["A", "B", "C", "D"];

  return (
    <div className="bg-brand-ink/5 dark:bg-brand-cream/5 border border-brand-ink/10 dark:border-brand-cream/8 rounded-2xl p-4 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <span className="text-brand-ink/35 dark:text-brand-cream/30 text-xs font-mono">{q.id}</span>
        <span className={`text-xs font-bold uppercase ${DIFFICULTY_COLOURS[q.difficulty] ?? "text-brand-ink/35 dark:text-brand-cream/30"}`}>
          {q.difficulty}
        </span>
      </div>

      {/* Question */}
      <p className="text-brand-ink dark:text-brand-cream font-semibold leading-snug">
        <span className="text-brand-ink/35 dark:text-brand-cream/30 mr-1">Q{index + 1}.</span>
        {q.question}
      </p>

      {/* Options */}
      <div className="grid grid-cols-1 gap-1">
        {keys.map((k) => {
          const isCorrect = k === q.correct_answer;
          return (
            <div
              key={k}
              className={`flex gap-2 rounded-xl px-3 py-2 text-sm ${
                isCorrect
                  ? "bg-green-500/15 border border-green-500/35 text-green-700 dark:text-green-300 font-semibold"
                  : "bg-brand-ink/4 dark:bg-brand-cream/5 text-brand-ink/55 dark:text-brand-cream/55"
              }`}
            >
              <span className={`font-bold w-4 shrink-0 ${isCorrect ? "text-green-600 dark:text-green-400" : "text-brand-ink/25 dark:text-brand-cream/25"}`}>{k}</span>
              <span>{q.options[k]}</span>
              {isCorrect && <span className="ml-auto text-green-600 dark:text-green-400 text-xs font-bold">✓ Correct</span>}
            </div>
          );
        })}
      </div>

      {/* Explanation */}
      {q.explanation && (
        <div className="bg-brand-linen dark:bg-brand-deep rounded-xl px-3 py-2 text-xs text-brand-ink/65 dark:text-brand-cream/65 leading-relaxed">
          <span className="text-brand-amber dark:text-brand-gold font-semibold">Explanation: </span>
          {q.explanation}
        </div>
      )}

      {/* Source */}
      {q.source && (
        <div className="text-xs text-brand-ink/35 dark:text-brand-cream/35 flex flex-wrap gap-x-3 gap-y-1">
          <span><span className="text-brand-ink/20 dark:text-brand-cream/20">Source:</span> {q.source.name}</span>
          {q.source.reference && <span><span className="text-brand-ink/20 dark:text-brand-cream/20">Ref:</span> {q.source.reference}</span>}
          {q.source.type && <span><span className="text-brand-ink/20 dark:text-brand-cream/20">Type:</span> {q.source.type}</span>}
        </div>
      )}
    </div>
  );
}

function TopicSection({ topic, questions }) {
  const [open, setOpen] = useState(true);

  const byDifficulty = DIFFICULTY_ORDER.reduce((acc, d) => {
    acc[d] = questions.filter((q) => q.difficulty === d);
    return acc;
  }, {});

  const counts = DIFFICULTY_ORDER.map((d) => `${byDifficulty[d].length} ${d}`).join(" · ");

  return (
    <section className="space-y-3">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between bg-brand-linen dark:bg-brand-surface border border-brand-ink/10 dark:border-brand-cream/8 rounded-2xl px-4 py-3 text-left hover:bg-brand-elevated dark:hover:bg-brand-deep transition"
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">{topic.icon}</span>
          <div>
            <p className="text-brand-ink dark:text-brand-cream font-bold">{topic.label}</p>
            <p className="text-brand-ink/35 dark:text-brand-cream/35 text-xs">{questions.length} questions · {counts}</p>
          </div>
        </div>
        <span className="text-brand-ink/25 dark:text-brand-cream/25 text-sm">{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div className="space-y-3 pl-2">
          {DIFFICULTY_ORDER.map((diff) =>
            byDifficulty[diff].length > 0 ? (
              <div key={diff} className="space-y-2">
                <p className={`text-xs font-bold uppercase tracking-widest px-1 ${DIFFICULTY_COLOURS[diff]}`}>
                  {diff} ({byDifficulty[diff].length})
                </p>
                {byDifficulty[diff].map((q, i) => (
                  <QuestionCard key={q.id} q={q} index={i} />
                ))}
              </div>
            ) : null
          )}
        </div>
      )}
    </section>
  );
}

export default function AuditPage({ onBack }) {
  const [topics, setTopics] = useState([]);
  const [questionsByTopic, setQuestionsByTopic] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const topicsRes = await fetch("/data/topics.json");
        const topicsData = await topicsRes.json();
        setTopics(topicsData);

        const entries = await Promise.all(
          topicsData.map(async ({ key }) => {
            const res = await fetch(`/data/questions_${key}.json`);
            const data = await res.json();
            return [key, data];
          })
        );

        setQuestionsByTopic(Object.fromEntries(entries));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const totalQuestions = Object.values(questionsByTopic).reduce((sum, qs) => sum + qs.length, 0);

  return (
    <div className="min-h-screen bg-brand-parchment dark:bg-brand-void">
      {/* Sticky header */}
      <div className="sticky top-0 z-10 bg-brand-linen/90 dark:bg-brand-surface/90 backdrop-blur border-b border-brand-ink/10 dark:border-brand-cream/8 px-4 py-3 flex items-center gap-3">
        <button
          onClick={onBack}
          className="text-brand-ink/55 dark:text-brand-cream/50 hover:text-brand-ink dark:hover:text-brand-cream transition text-sm font-medium flex items-center gap-1"
        >
          ← Back
        </button>
        <div className="flex-1">
          <p className="text-brand-ink dark:text-brand-cream font-bold text-sm">Question Audit</p>
          {!loading && !error && (
            <p className="text-brand-ink/35 dark:text-brand-cream/35 text-xs">{topics.length} topics · {totalQuestions} questions total</p>
          )}
        </div>
        <span className="text-brand-ink/18 dark:text-brand-cream/18 text-xs font-mono">AUDIT</span>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {loading && (
          <div className="text-center text-brand-ink/35 dark:text-brand-cream/35 py-16">Loading questions…</div>
        )}

        {error && (
          <div className="text-center text-red-500 dark:text-red-400 py-16">Failed to load: {error}</div>
        )}

        {!loading && !error && topics.map((topic) => (
          <TopicSection
            key={topic.key}
            topic={topic}
            questions={questionsByTopic[topic.key] ?? []}
          />
        ))}
      </div>
    </div>
  );
}
