import { useState } from "react";

function HowToPlayModal({ onClose }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-brand-midnight border border-white/10 rounded-3xl shadow-2xl w-full max-w-sm p-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/40 hover:text-white transition text-xl leading-none"
          aria-label="Close"
        >
          ✕
        </button>

        <h2 className="text-2xl font-extrabold text-white text-center mb-1">How to Play</h2>
        <p className="text-brand-gold text-center text-sm mb-5">Gather your crew and let's go! 🎉</p>

        <div className="space-y-5">
          <div className="flex gap-3 items-start">
            <span className="text-2xl">🏠</span>
            <div>
              <p className="text-white font-bold text-sm">Host a Game</p>
              <p className="text-white/60 text-xs leading-relaxed">
                Tap <span className="text-brand-gold font-semibold">Host Game</span>, pick your topics and how many questions you want, then share your <span className="text-brand-gold font-semibold">Room Code</span> with everyone joining.
              </p>
            </div>
          </div>

          <div className="flex gap-3 items-start">
            <span className="text-2xl">🔑</span>
            <div>
              <p className="text-white font-bold text-sm">Join a Game</p>
              <p className="text-white/60 text-xs leading-relaxed">
                Tap <span className="text-brand-gold font-semibold">Join Game</span>, enter the Room Code from your host, type your name, and you're in! Wait in the lobby until the host starts.
              </p>
            </div>
          </div>

          <div className="flex gap-3 items-start">
            <span className="text-2xl">⚡</span>
            <div>
              <p className="text-white font-bold text-sm">Play Together</p>
              <p className="text-white/60 text-xs leading-relaxed">
                Questions appear on everyone's screen at the same time — tap your answer fast! The quicker you answer correctly, the more points you score. After all rounds, check the leaderboard to see who reigns supreme. 👑
              </p>
            </div>
          </div>

          <div className="flex gap-3 items-start">
            <span className="text-2xl">💡</span>
            <div>
              <p className="text-white font-bold text-sm">Tips</p>
              <p className="text-white/60 text-xs leading-relaxed">
                Everyone needs to be on the <span className="text-brand-gold font-semibold">same Wi-Fi or hotspot</span> for the best experience. No app download needed — just open the link and play!
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="mt-6 w-full bg-brand-green text-white font-bold py-3 rounded-2xl hover:bg-brand-green/80 transition active:scale-95"
        >
          Let's Play! 🕌
        </button>
      </div>
    </div>
  );
}

export default function Home({ onHost, onJoin, onAudit }) {
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [versionTaps, setVersionTaps] = useState(0);

  return (
    <div className="h-screen bg-gradient-to-br from-brand-green to-brand-midnight flex flex-col items-center justify-center p-4 overflow-hidden">
      {showHowToPlay && <HowToPlayModal onClose={() => setShowHowToPlay(false)} />}

      <div className="text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-extrabold text-white drop-shadow mb-2 tracking-tight">
          Ummah Trivia
        </h1>
        <p className="text-brand-gold font-semibold text-base mb-2">
          Test Your Knowledge. Strengthen Your Iman.
        </p>
        <p className="text-brand-sky/80 text-sm max-w-xs mx-auto leading-relaxed">
          The interactive Islamic quiz platform for families, masjids, and friends to learn Islam together.
        </p>
      </div>

      <div className="flex flex-col gap-4 w-full max-w-xs mb-4">
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
        <button
          onClick={() => setShowHowToPlay(true)}
          className="text-brand-sky/70 text-sm font-medium hover:text-brand-sky transition text-center"
        >
          ❓ How to Play
        </button>
      </div>

      <div className="flex flex-col items-center gap-2 mt-4">
        <a
          href="https://amanahdigital.co.uk"
          target="_blank"
          rel="noopener noreferrer"
          className="text-brand-sky/50 text-xs hover:text-brand-sky transition"
        >
          Powered by <span className="underline">Amanah Digital</span>
        </a>
        <span
          className="text-white/30 text-xs cursor-default select-none"
          onClick={() => {
            const next = versionTaps + 1;
            setVersionTaps(next);
            if (next >= 10) {
              setVersionTaps(0);
              onAudit?.();
            }
          }}
        >
          v{__APP_VERSION__}
        </span>
      </div>
    </div>
  );
}
