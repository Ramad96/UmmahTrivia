export default function Home({ onHost, onJoin }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-green to-brand-midnight flex flex-col items-center justify-center p-4">
      <div className="text-center mb-10">
        <img
          src="/logo.png"
          alt="Ummah Trivia"
          className="w-32 h-32 mx-auto mb-4 drop-shadow-lg"
        />
        <h1 className="text-5xl font-extrabold text-white drop-shadow mb-2 tracking-tight">
          Ummah Trivia
        </h1>
        <p className="text-brand-gold font-semibold text-base mb-3">
          Test Your Knowledge. Strengthen Your Iman.
        </p>
        <p className="text-brand-sky/80 text-sm max-w-xs mx-auto leading-relaxed">
          The interactive Islamic quiz platform for families, masjids, and friends to learn Islam together.
        </p>
      </div>

      <div className="flex flex-col gap-4 w-full max-w-xs mb-12">
        <button
          onClick={onHost}
          className="bg-white text-brand-green font-bold text-xl py-4 rounded-2xl shadow-lg hover:bg-brand-sky transition active:scale-95"
        >
          Host Game
        </button>
        <button
          onClick={onJoin}
          className="bg-brand-green/50 text-white font-bold text-xl py-4 rounded-2xl shadow-lg border-2 border-white/30 hover:bg-brand-green/70 transition active:scale-95"
        >
          Join Game
        </button>
      </div>

      <a
        href="https://amanahdigital.co.uk"
        target="_blank"
        rel="noopener noreferrer"
        className="text-brand-sky/50 text-xs hover:text-brand-sky transition"
      >
        Powered by AmanahDigital
      </a>
    </div>
  );
}
