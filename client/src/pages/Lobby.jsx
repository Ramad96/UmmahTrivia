import PlayerList from "../components/PlayerList";

export default function Lobby({ gameCode, players, isHost, playerName, onStart }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 to-purple-700 flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-lg text-center">
        <p className="text-gray-500 uppercase tracking-widest text-sm mb-1">
          Game Code
        </p>
        <h1 className="text-6xl font-extrabold text-indigo-600 tracking-widest mb-6">
          {gameCode}
        </h1>

        <div className="mb-6">
          <p className="text-gray-500 text-sm mb-3">
            {players.length === 0
              ? "Waiting for players to join…"
              : `${players.length} player${players.length === 1 ? "" : "s"} in lobby`}
          </p>
          <PlayerList players={players} />
        </div>

        {!isHost && playerName && (
          <div className="mb-4 px-4 py-2 bg-indigo-50 rounded-xl inline-block">
            <p className="text-indigo-700 font-semibold">
              You are: <span className="text-indigo-900 font-extrabold">{playerName}</span>
            </p>
          </div>
        )}

        {isHost ? (
          <button
            onClick={onStart}
            disabled={players.length === 0}
            className="w-full bg-green-500 text-white font-bold py-4 rounded-2xl text-xl hover:bg-green-600 transition disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
          >
            Start Game
          </button>
        ) : (
          <p className="text-gray-400 italic">
            Waiting for the host to start the game…
          </p>
        )}
      </div>
    </div>
  );
}
