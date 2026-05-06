import React, { useState } from 'react'

const FIELDS = [
  { key: 'workDuration',       label: '专注时长', min: 1, max: 60, color: '#007AFF', unit: '分钟' },
  { key: 'shortBreakDuration', label: '短暂休息', min: 1, max: 30, color: '#30D158', unit: '分钟' },
  { key: 'longBreakDuration',  label: '长时休息', min: 1, max: 60, color: '#BF5AF2', unit: '分钟' },
]

export default function Settings({ settings, onSave, onClose }) {
  const [local, setLocal] = useState({ ...settings })

  const handleChange = (key, value) => {
    const num = parseInt(value, 10)
    if (!isNaN(num)) {
      setLocal((prev) => ({ ...prev, [key]: num }))
    }
  }

  const handleSave = () => {
    const clamped = {}
    for (const { key, min, max } of FIELDS) {
      clamped[key] = Math.min(max, Math.max(min, local[key]))
    }
    onSave(clamped)
  }

  return (
    <div className="settings-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="settings-panel">
        <div className="settings-header">
          <h2>计时器设置</h2>
          <button className="icon-btn close-btn" onClick={onClose} aria-label="关闭设置">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="settings-fields">
          {FIELDS.map(({ key, label, min, max, color, unit }) => {
            const val = local[key]
            const pct = ((val - min) / (max - min)) * 100
            return (
              <div className="settings-field" key={key}>
                <div className="settings-field-header">
                  <label htmlFor={key} style={{ color }}>
                    {label}
                  </label>
                  <div className="settings-number-input">
                    <button
                      className="num-btn"
                      onClick={() => handleChange(key, val - 1)}
                      disabled={val <= min}
                    >
                      −
                    </button>
                    <input
                      id={key}
                      type="number"
                      value={val}
                      min={min}
                      max={max}
                      onChange={(e) => handleChange(key, e.target.value)}
                    />
                    <button
                      className="num-btn"
                      onClick={() => handleChange(key, val + 1)}
                      disabled={val >= max}
                    >
                      +
                    </button>
                    <span className="unit">{unit}</span>
                  </div>
                </div>
                <div className="slider-track">
                  <div
                    className="slider-fill"
                    style={{ width: `${pct}%`, background: color }}
                  />
                  <input
                    type="range"
                    min={min}
                    max={max}
                    value={val}
                    onChange={(e) => handleChange(key, e.target.value)}
                    style={{ '--thumb-color': color }}
                  />
                </div>
              </div>
            )
          })}
        </div>

        <div className="settings-footer">
          <button className="btn-secondary" onClick={onClose}>
            取消
          </button>
          <button className="btn-primary" onClick={handleSave}>
            保存设置
          </button>
        </div>
      </div>
    </div>
  )
}
