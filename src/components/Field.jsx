import React from 'react'

export default function Field({ id, label, symbol, value, disabled, placeholder, onChange, suffix, helper }) {
  return (
    <div className={`field-wrapper ${disabled ? 'disabled' : ''}`}>
      <label className="field-label" htmlFor={id}>
        {symbol && <span className="field-symbol">{symbol}</span>}
        <span className="field-title">{label}</span>
      </label>
      <div className="field-input-box">
        <input
          id={id}
          type="text"
          inputMode="decimal"
          value={value ?? ''}
          disabled={disabled}
          placeholder={placeholder}
          autoComplete="off"
          onChange={(event) => onChange(event.target.value)}
          aria-label={label}
        />
        {suffix && <span className="field-suffix">{suffix}</span>}
      </div>
      {helper && <span className="field-helper">{helper}</span>}
    </div>
  )
}

