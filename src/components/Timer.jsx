import React from 'react'

const RADIUS = 120
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

export default function Timer({ timeLeft, progress, isRunning }) {
  const minutes = String(Math.floor(timeLeft / 60)).padStart(2, '0')
  const seconds = String(timeLeft % 60).padStart(2, '0')

  const strokeDashoffset = CIRCUMFERENCE * (1 - progress)

  return (
    <div className="timer-container">
      <svg className="timer-ring" viewBox="0 0 280 280" xmlns="http://www.w3.org/2000/svg">
        {/* Background track */}
        <circle
          cx="140"
          cy="140"
          r={RADIUS}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="8"
        />
        {/* Progress arc */}
        <circle
          cx="140"
          cy="140"
          r={RADIUS}
          fill="none"
          stroke="var(--primary)"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={strokeDashoffset}
          transform="rotate(-90 140 140)"
          style={{
            transition: 'stroke-dashoffset 0.8s ease, stroke 0.5s ease',
            filter: `drop-shadow(0 0 8px var(--primary))`,
          }}
        />
      </svg>

      <div className="timer-display">
        <span className={`timer-digits ${isRunning ? 'running' : ''}`}>
          {minutes}:{seconds}
        </span>
      </div>
    </div>
  )
}
