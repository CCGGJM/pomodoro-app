import React from 'react'

export default function Controls({ isRunning, onStartPause, onReset }) {
  return (
    <div className="controls">
      <button
        className="icon-btn reset-btn"
        onClick={onReset}
        title="重置"
        aria-label="重置计时器"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
          <polyline points="1 4 1 10 7 10" />
          <path d="M3.51 15a9 9 0 1 0 .49-4.5" />
        </svg>
      </button>

      <button
        className="start-pause-btn"
        onClick={onStartPause}
        aria-label={isRunning ? '暂停计时器' : '开始计时器'}
      >
        {isRunning ? (
          <svg viewBox="0 0 24 24" fill="currentColor">
            <rect x="6" y="4" width="4" height="16" rx="1" />
            <rect x="14" y="4" width="4" height="16" rx="1" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="currentColor">
            <polygon points="5,3 19,12 5,21" />
          </svg>
        )}
        <span>{isRunning ? '暂停' : '开始'}</span>
      </button>

      <div className="icon-btn" aria-hidden="true" style={{ visibility: 'hidden' }} />
    </div>
  )
}
