// Ranked player list used on leaderboard and game-over screens
const MEDALS = ["🥇", "🥈", "🥉"];

export default function Leaderboard({ leaderboard }) {
  return (
    <div className="w-full max-w-md mx-auto space-y-2">
      {leaderboard.map((entry) => (
        <div
          key={entry.name}
          className="flex items-center justify-between bg-white rounded-xl px-4 py-3 shadow"
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl w-8 text-center">
              {MEDALS[entry.rank - 1] ?? `${entry.rank}`}
            </span>
            <span className="font-semibold text-gray-800">{entry.name}</span>
          </div>
          <span className="font-bold text-indigo-600">{entry.score.toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
}
