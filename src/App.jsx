import React, { useState, useEffect, useRef, useCallback } from 'react'
import Settings from './components/Settings.jsx'
import Controls from './components/Controls.jsx'
import Timer from './components/Timer.jsx'

const MODES = {
  WORK: 'work',
  SHORT_BREAK: 'shortBreak',
  LONG_BREAK: 'longBreak',
}

const MODE_LABELS = {
  [MODES.WORK]: '专注工作',
  [MODES.SHORT_BREAK]: '短暂休息',
  [MODES.LONG_BREAK]: '长时休息',
}

const MODE_COLORS = {
  [MODES.WORK]: {
    primary: '#007AFF',
    secondary: '#409CFF',
    bg: '#001a3d',
    glow: 'rgba(0, 122, 255, 0.25)',
  },
  [MODES.SHORT_BREAK]: {
    primary: '#30D158',
    secondary: '#34C759',
    bg: '#00200f',
    glow: 'rgba(48, 209, 88, 0.25)',
  },
  [MODES.LONG_BREAK]: {
    primary: '#BF5AF2',
    secondary: '#DA8FFF',
    bg: '#1a0030',
    glow: 'rgba(191, 90, 242, 0.25)',
  },
}

const DEFAULT_SETTINGS = {
  workDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
}

function sendNotification(title, body) {
  if (window.electronAPI) {
    window.electronAPI.sendNotification(title, body)
  } else if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(title, { body })
  }
}

export default function App() {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS)
  const [mode, setMode] = useState(MODES.WORK)
  const [timeLeft, setTimeLeft] = useState(DEFAULT_SETTINGS.workDuration * 60)
  const [isRunning, setIsRunning] = useState(false)
  const [sessionCount, setSessionCount] = useState(0)
  const [completedSessions, setCompletedSessions] = useState(0)
  const [showSettings, setShowSettings] = useState(false)

  const intervalRef = useRef(null)
  const colors = MODE_COLORS[mode]

  const getDuration = useCallback(
    (m) => {
      if (m === MODES.WORK) return settings.workDuration * 60
      if (m === MODES.SHORT_BREAK) return settings.shortBreakDuration * 60
      return settings.longBreakDuration * 60
    },
    [settings]
  )

  const switchMode = useCallback(
    (nextMode) => {
      setIsRunning(false)
      clearInterval(intervalRef.current)
      setMode(nextMode)
      setTimeLeft(getDuration(nextMode))
    },
    [getDuration]
  )

  const handleTimerComplete = useCallback(() => {
    setIsRunning(false)
    clearInterval(intervalRef.current)

    if (mode === MODES.WORK) {
      const newCompleted = completedSessions + 1
      setCompletedSessions(newCompleted)
      const newSessionCount = sessionCount + 1

      if (newSessionCount % 4 === 0) {
        setSessionCount(newSessionCount)
        sendNotification(
          '番茄钟完成！',
          '太棒了！休息一下，你赢得了长时休息。'
        )
        switchMode(MODES.LONG_BREAK)
      } else {
        setSessionCount(newSessionCount)
        sendNotification(
          '番茄钟完成！',
          '干得好！去休息一小会儿吧。'
        )
        switchMode(MODES.SHORT_BREAK)
      }
    } else {
      sendNotification(
        '休息结束！',
        '休息时间结束了，继续专注工作吧！'
      )
      switchMode(MODES.WORK)
    }
  }, [mode, completedSessions, sessionCount, switchMode])

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current)
            // Use setTimeout to avoid calling state updates inside setState
            setTimeout(() => handleTimerComplete(), 0)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } else {
      clearInterval(intervalRef.current)
    }
    return () => clearInterval(intervalRef.current)
  }, [isRunning, handleTimerComplete])

  useEffect(() => {
    if (!isRunning) {
      setTimeLeft(getDuration(mode))
    }
  }, [settings]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleStartPause = () => {
    setIsRunning((prev) => !prev)
  }

  const handleReset = () => {
    setIsRunning(false)
    clearInterval(intervalRef.current)
    setTimeLeft(getDuration(mode))
  }

  const handleModeChange = (newMode) => {
    setIsRunning(false)
    clearInterval(intervalRef.current)
    setMode(newMode)
    setTimeLeft(getDuration(newMode))
  }

  const handleSaveSettings = (newSettings) => {
    setSettings(newSettings)
    setShowSettings(false)
    setIsRunning(false)
    clearInterval(intervalRef.current)
    setMode(MODES.WORK)
    setTimeLeft(newSettings.workDuration * 60)
    setSessionCount(0)
    setCompletedSessions(0)
  }

  const totalDuration = getDuration(mode)
  const progress = totalDuration > 0 ? (totalDuration - timeLeft) / totalDuration : 0

  useEffect(() => {
    const mm = String(Math.floor(timeLeft / 60)).padStart(2, '0')
    const ss = String(timeLeft % 60).padStart(2, '0')
    document.title = `${mm}:${ss} — ${MODE_LABELS[mode]}`
  }, [timeLeft, mode])

  return (
    <div
      className="app"
      style={{
        '--primary': colors.primary,
        '--secondary': colors.secondary,
        '--bg-accent': colors.bg,
        '--glow': colors.glow,
      }}
    >
      <div className="app-bg" />

      <div className="app-container">
        {/* Header */}
        <header className="app-header">
          <h1 className="app-title">番茄钟</h1>
          <button
            className="icon-btn settings-btn"
            onClick={() => setShowSettings(true)}
            title="设置"
            aria-label="打开设置"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          </button>
        </header>

        {/* Mode Selector */}
        <div className="mode-tabs">
          {Object.values(MODES).map((m) => (
            <button
              key={m}
              className={`mode-tab ${mode === m ? 'active' : ''}`}
              onClick={() => handleModeChange(m)}
            >
              {MODE_LABELS[m]}
            </button>
          ))}
        </div>

        {/* Timer */}
        <Timer timeLeft={timeLeft} progress={progress} isRunning={isRunning} />

        {/* Session Dots */}
        <div className="session-tracker">
          <span className="session-label">第 {(sessionCount % 4) + (mode === MODES.WORK && isRunning ? 1 : 0)}/4 个番茄</span>
          <div className="session-dots">
            {Array.from({ length: 4 }).map((_, i) => {
              const currentDot = mode === MODES.WORK && i === sessionCount % 4
              return (
                <div
                  key={i}
                  className={`session-dot ${i < sessionCount % 4 ? 'filled' : ''} ${currentDot && isRunning ? 'current' : ''}`}
                />
              )
            })}
          </div>
          <span className="completed-label">已完成 {completedSessions} 个</span>
        </div>

        {/* Controls */}
        <Controls
          isRunning={isRunning}
          onStartPause={handleStartPause}
          onReset={handleReset}
        />
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <Settings
          settings={settings}
          onSave={handleSaveSettings}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  )
}
