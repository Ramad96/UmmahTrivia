import { useState } from "react";
import { useTheme } from "../context/ThemeContext";

const THEME_CYCLE = { light: "dark", dark: "system", system: "light" };
const THEME_ICON  = { light: "☀️", dark: "🌙", system: "💻" };
const THEME_LABEL = { light: "Light", dark: "Dark", system: "Auto" };

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  return (
    <button
      onClick={() => setTheme(THEME_CYCLE[theme])}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-brand-ink/15 dark:border-brand-cream/15 text-brand-ink/50 dark:text-brand-cream/40 hover:text-brand-ink dark:hover:text-brand-cream hover:border-brand-ink/30 dark:hover:border-brand-cream/30 transition text-xs font-medium"
      title={`Theme: ${THEME_LABEL[theme]} — click to cycle`}
    >
      <span>{THEME_ICON[theme]}</span>
      <span>{THEME_LABEL[theme]}</span>
    </button>
  );
}

function HowToPlayModal({ onClose }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-brand-linen dark:bg-brand-deep border border-brand-ink/10 dark:border-brand-cream/10 rounded-3xl shadow-2xl w-full max-w-sm p-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-brand-ink/40 dark:text-brand-cream/40 hover:text-brand-ink dark:hover:text-brand-cream transition text-xl leading-none"
          aria-label="Close"
        >
          ✕
        </button>

        <h2 className="text-2xl font-extrabold text-brand-ink dark:text-brand-cream text-center mb-1">How to Play</h2>
        <p className="text-brand-amber dark:text-brand-gold text-center text-sm mb-5">Gather your crew and let's go! 🎉</p>

        <div className="space-y-5">
          <div className="flex gap-3 items-start">
            <span className="text-2xl">🏠</span>
            <div>
              <p className="text-brand-ink dark:text-brand-cream font-bold text-sm">Host a Game</p>
              <p className="text-brand-ink/60 dark:text-brand-cream/55 text-xs leading-relaxed">
                Tap <span className="text-brand-amber dark:text-brand-gold font-semibold">Host Game</span>, pick your topics and how many questions you want, then share your <span className="text-brand-amber dark:text-brand-gold font-semibold">Room Code</span> with everyone joining.
              </p>
            </div>
          </div>

          <div className="flex gap-3 items-start">
            <span className="text-2xl">🔑</span>
            <div>
              <p className="text-brand-ink dark:text-brand-cream font-bold text-sm">Join a Game</p>
              <p className="text-brand-ink/60 dark:text-brand-cream/55 text-xs leading-relaxed">
                Tap <span className="text-brand-amber dark:text-brand-gold font-semibold">Join Game</span>, enter the Room Code from your host, type your name, and you're in! Wait in the lobby until the host starts.
              </p>
            </div>
          </div>

          <div className="flex gap-3 items-start">
            <span className="text-2xl">⚡</span>
            <div>
              <p className="text-brand-ink dark:text-brand-cream font-bold text-sm">Play Together</p>
              <p className="text-brand-ink/60 dark:text-brand-cream/55 text-xs leading-relaxed">
                Questions appear on everyone's screen at the same time — tap your answer fast! The quicker you answer correctly, the more points you score. After all rounds, check the leaderboard to see who reigns supreme. 👑
              </p>
            </div>
          </div>

          <div className="flex gap-3 items-start">
            <span className="text-2xl">💡</span>
            <div>
              <p className="text-brand-ink dark:text-brand-cream font-bold text-sm">Tips</p>
              <p className="text-brand-ink/60 dark:text-brand-cream/55 text-xs leading-relaxed">
                Everyone needs to be on the <span className="text-brand-amber dark:text-brand-gold font-semibold">same Wi-Fi or hotspot</span> for the best experience. No app download needed — just open the link and play!
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="mt-6 w-full bg-brand-green dark:bg-brand-gold text-white dark:text-brand-void font-bold py-3 rounded-2xl hover:opacity-85 transition active:scale-95"
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
    <div className="h-screen bg-gradient-to-br from-brand-linen to-brand-parchment dark:from-brand-void dark:to-brand-surface flex flex-col items-center justify-center p-4 overflow-hidden">
      {showHowToPlay && <HowToPlayModal onClose={() => setShowHowToPlay(false)} />}

      {/* Theme toggle — top right */}
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-extrabold text-brand-ink dark:text-brand-cream drop-shadow mb-2 tracking-tight">
          Ummah Trivia
        </h1>
        <p className="text-brand-amber dark:text-brand-gold font-semibold text-base mb-2">
          Test Your Knowledge. Strengthen Your Iman.
        </p>
        <p className="text-brand-ink/55 dark:text-brand-cream/55 text-sm max-w-xs mx-auto leading-relaxed">
          The interactive Islamic quiz platform for families, masjids, and friends to learn Islam together.
        </p>
      </div>

      <div className="flex flex-col gap-4 w-full max-w-xs mb-4">
        {/* Primary CTA — gold on void in dark mode (brand guide style) */}
        <button
          onClick={onHost}
          className="bg-brand-green text-white dark:bg-brand-gold dark:text-brand-void font-bold text-xl py-4 rounded-2xl shadow-lg hover:opacity-85 transition active:scale-95"
        >
          Host Game
        </button>
        {/* Ghost CTA — gold ghost in dark mode */}
        <button
          onClick={onJoin}
          className="bg-brand-ink/8 text-brand-ink border-2 border-brand-ink/20 dark:bg-brand-gold/10 dark:text-brand-gold dark:border-brand-gold/30 font-bold text-xl py-4 rounded-2xl shadow-lg hover:opacity-85 transition active:scale-95"
        >
          Join Game
        </button>
        <button
          onClick={() => setShowHowToPlay(true)}
          className="text-brand-ink/50 dark:text-brand-cream/45 text-sm font-medium hover:text-brand-ink dark:hover:text-brand-cream transition text-center"
        >
          ❓ How to Play
        </button>
      </div>

      <div className="flex flex-col items-center gap-2 mt-4">
        <a
          href="https://amanahdigital.co.uk"
          target="_blank"
          rel="noopener noreferrer"
          className="text-brand-ink/40 dark:text-brand-cream/30 text-xs hover:text-brand-ink/70 dark:hover:text-brand-cream/55 transition"
        >
          Powered by <span className="underline">Amanah Digital</span>
        </a>
        <span
          className="text-brand-ink/20 dark:text-brand-cream/20 text-xs cursor-default select-none"
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
