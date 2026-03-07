// Grid of player name chips displayed in the lobby
export default function PlayerList({ players }) {
  return (
    <div className="flex flex-wrap gap-2 justify-center">
      {players.map((p) => (
        <span
          key={p.id}
          className="bg-indigo-100 text-indigo-800 font-medium px-3 py-1 rounded-full text-sm"
        >
          {p.name}
        </span>
      ))}
    </div>
  );
}
