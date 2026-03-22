import { useState } from "react";
import { generatePlayerName } from "../game/playerManager";

const suggestedName = generatePlayerName();

export default function Join({ onJoin, onBack }) {
  const [code, setCode] = useState("");
  const [name, setName] = useState(suggestedName);
  const [error, setError] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    const trimmedCode = code.trim();
    if (trimmedCode.length !== 6 || !/^\d+$/.test(trimmedCode)) {
      setError("Please enter a valid 6-digit game code");
      return;
    }
    setError("");
    const finalName = name.trim() || suggestedName;
    onJoin(trimmedCode, finalName);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-linen to-brand-parchment dark:from-brand-void dark:to-brand-surface flex flex-col items-center justify-center p-4">
      <div className="bg-white dark:bg-brand-deep border border-brand-ink/8 dark:border-brand-cream/10 rounded-3xl shadow-2xl p-8 w-full max-w-sm">
        <h2 className="text-2xl font-bold text-brand-midnight dark:text-brand-cream mb-6 text-center">
          Join a Game
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            inputMode="numeric"
            maxLength={6}
            placeholder="Enter 6-digit code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full border-2 border-gray-200 dark:border-brand-cream/15 dark:bg-brand-surface dark:text-brand-cream dark:placeholder-brand-cream/30 rounded-xl px-4 py-3 text-center text-2xl font-bold tracking-widest focus:border-brand-green dark:focus:border-brand-gold focus:outline-none"
          />

          <div>
            <label className="block text-xs font-semibold text-gray-400 dark:text-brand-cream/45 uppercase tracking-wider mb-1">
              Your Name
            </label>
            <input
              type="text"
              maxLength={30}
              placeholder={suggestedName}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border-2 border-gray-200 dark:border-brand-cream/15 dark:bg-brand-surface dark:text-brand-cream dark:placeholder-brand-cream/30 rounded-xl px-4 py-3 text-center text-base font-semibold focus:border-brand-green dark:focus:border-brand-gold focus:outline-none"
            />
            <p className="text-xs text-gray-400 dark:text-brand-cream/35 mt-1 text-center">
              Suggested: {suggestedName}
            </p>
          </div>

          {error && <p className="text-red-500 dark:text-red-400 text-sm text-center">{error}</p>}
          <button
            type="submit"
            className="w-full bg-brand-green dark:bg-brand-gold text-white dark:text-brand-void font-bold py-3 rounded-xl hover:opacity-85 transition active:scale-95"
          >
            Join
          </button>
        </form>
        <button
          onClick={onBack}
          className="mt-4 w-full text-gray-500 dark:text-brand-cream/45 text-sm hover:text-brand-green dark:hover:text-brand-gold transition"
        >
          Back
        </button>
      </div>
    </div>
  );
}
