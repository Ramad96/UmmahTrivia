import Leaderboard from "../components/Leaderboard";

export default function GameOver({ leaderboard, onPlayAgain }) {
  const winner = leaderboard[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 to-purple-700 flex flex-col items-center justify-center p-4">
      <div className="text-center mb-6">
        <div className="text-6xl mb-3">🏆</div>
        <h1 className="text-4xl font-extrabold text-white mb-1">Game Over!</h1>
        {winner && (
          <p className="text-indigo-200 text-lg">
            Winner: <span className="text-yellow-300 font-bold">{winner.name}</span> with{" "}
            <span className="text-yellow-300 font-bold">{winner.score.toLocaleString()}</span> pts
          </p>
        )}
      </div>

      <Leaderboard leaderboard={leaderboard} />

      <button
        onClick={onPlayAgain}
        className="mt-8 bg-white text-indigo-700 font-bold px-8 py-3 rounded-2xl shadow hover:bg-indigo-50 transition active:scale-95"
      >
        Back to Home
      </button>
    </div>
  );
}
