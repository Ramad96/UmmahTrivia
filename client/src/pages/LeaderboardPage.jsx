import Leaderboard from "../components/Leaderboard";

export default function LeaderboardPage({ leaderboard, questionIndex, total }) {
  return (
    <div className="min-h-screen bg-brand-parchment dark:bg-brand-void flex flex-col items-center justify-center p-4">
      <h2 className="text-3xl font-extrabold text-brand-ink dark:text-brand-cream mb-2">Leaderboard</h2>
      <p className="text-brand-ink/50 dark:text-brand-cream/50 text-sm mb-6">
        After question {questionIndex + 1} of {total}
      </p>
      <Leaderboard leaderboard={leaderboard} />
      <p className="text-brand-ink/40 dark:text-brand-cream/40 text-sm mt-8 animate-pulse">
        Next question coming up…
      </p>
    </div>
  );
}
