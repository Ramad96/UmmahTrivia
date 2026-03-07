export default function Home({ onHost, onJoin }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 to-purple-700 flex flex-col items-center justify-center p-4">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-extrabold text-white drop-shadow mb-3">
          Islamic Quiz
        </h1>
        <p className="text-indigo-200 text-lg">
          Real-time multiplayer knowledge challenge
        </p>
      </div>

      <div className="flex flex-col gap-4 w-full max-w-xs">
        <button
          onClick={onHost}
          className="bg-white text-indigo-700 font-bold text-xl py-4 rounded-2xl shadow-lg hover:bg-indigo-50 transition active:scale-95"
        >
          Host Game
        </button>
        <button
          onClick={onJoin}
          className="bg-indigo-500 text-white font-bold text-xl py-4 rounded-2xl shadow-lg border-2 border-white/30 hover:bg-indigo-400 transition active:scale-95"
        >
          Join Game
        </button>
      </div>
    </div>
  );
}
