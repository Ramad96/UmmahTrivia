// Circular countdown timer displayed during questions
export default function Timer({ timeLeft, total = 10, isBonusTime = false }) {
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const progress = (timeLeft / total) * circumference;
  const color =
    timeLeft > 5 ? "#22c55e" : timeLeft > 2 ? "#f59e0b" : "#ef4444";

  return (
    <div className="flex flex-col items-center">
      <svg width="100" height="100" viewBox="0 0 100 100">
        {/* Background ring */}
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth="8"
        />
        {/* Progress ring */}
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - progress}
          strokeLinecap="round"
          transform="rotate(-90 50 50)"
          style={{ transition: "stroke-dashoffset 0.9s linear, stroke 0.3s" }}
        />
        <text
          x="50"
          y="56"
          textAnchor="middle"
          fontSize="24"
          fontWeight="bold"
          fill={color}
        >
          {timeLeft}
        </text>
      </svg>
      {isBonusTime && (
        <span className="text-xs text-brand-amber dark:text-brand-gold font-bold -mt-1">
          ⚡ +10s
        </span>
      )}
    </div>
  );
}
