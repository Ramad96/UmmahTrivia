const ADJECTIVES = [
  "Brave", "Wise", "Silent", "Swift", "Golden", "Clever", "Noble",
  "Loyal", "Bold", "Calm", "Sharp", "Fierce", "Mighty", "Gentle", "Radiant",
];

const ANIMALS = [
  "Falcon", "Lion", "Owl", "Camel", "Tiger", "Eagle", "Gazelle",
  "Hawk", "Wolf", "Bear", "Fox", "Deer", "Lynx", "Crane", "Panther",
];

// Generate a random name — Adjective + Animal
export function generatePlayerName(existingNames = new Set()) {
  const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);
  const adjs = shuffle(ADJECTIVES);
  const animals = shuffle(ANIMALS);

  for (const adj of adjs) {
    for (const animal of animals) {
      const name = `${adj} ${animal}`;
      if (!existingNames.has(name)) return name;
    }
  }

  // Fallback: append a number if all combinations are taken
  return `Player ${Math.floor(Math.random() * 9000) + 1000}`;
}

// Calculate score for a correct answer
// timeLeft: seconds remaining when answer was submitted (0–10)
export function calculateScore(timeLeft) {
  const base = 1000;
  const speedBonus = Math.round(500 * (timeLeft / 10));
  return base + speedBonus;
}
