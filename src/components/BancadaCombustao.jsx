import React, { useEffect, useRef, useState } from 'react'
import { formatNumber } from '../lib/calorimetria'

export default function BancadaCombustao({
  waterMass = 100,
  initialTemp = 25,
  finalTemp = 52,
  lampBefore = 150,
  lampAfter = 147.5,
  fuelName = 'Etanol',
  fuelFormula = 'C2H5OH',
  burnedMass = 2.5,
  efficiency = 28.5,
  heat = 2700,
  includeBeaker = false,
  beakerMass = 0,
}) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [simProgress, setSimProgress] = useState(1)
  const animRef = useRef(null)

  const wMass = Math.max(10, Math.min(500, Number(waterMass) || 100))
  const tInit = Number(initialTemp) || 20
  const tFinal = Number(finalTemp) || 50
  const lBefore = Number(lampBefore) || 150
  const lAfter = Number(lampAfter) || 147.5
  const bMass = Number(burnedMass) || Math.max(0, lBefore - lAfter)

  const currentTemp = isPlaying || simProgress < 1
    ? tInit + (tFinal - tInit) * simProgress
    : tFinal
  const currentLampMass = isPlaying || simProgress < 1
    ? lBefore - (lBefore - lAfter) * simProgress
    : lAfter

  const liquidHeightPercent = Math.min(100, Math.max(20, (wMass / 300) * 80 + 10))
  const thermoPercent = Math.min(95, Math.max(5, (currentTemp / 100) * 85 + 5))

  const getWaterHue = (temp) => {
    const ratio = Math.min(1, Math.max(0, (temp - 15) / 75))
    return Math.round(205 - ratio * (205 - 12))
  }
  const waterHue = getWaterHue(currentTemp)
  const waterColor = `hsl(${waterHue}, 80%, 55%)`
  const waterColorDark = `hsl(${waterHue}, 85%, 40%)`

  const handleToggleSimulation = () => {
    if (isPlaying) {
      if (animRef.current) cancelAnimationFrame(animRef.current)
      setIsPlaying(false)
      return
    }

    setIsPlaying(true)
    setSimProgress(0)
    const duration = 3200
    const startTime = performance.now()

    const loop = (now) => {
      const elapsed = now - startTime
      const progress = Math.min(1, elapsed / duration)
      const ease = progress < 0.5 ? 2 * progress * progress : 1 - Math.pow(-2 * progress + 2, 2) / 2
      setSimProgress(ease)

      if (progress < 1) {
        animRef.current = requestAnimationFrame(loop)
      } else {
        setIsPlaying(false)
        setSimProgress(1)
      }
    }

    animRef.current = requestAnimationFrame(loop)
  }

  const handleReset = () => {
    if (animRef.current) cancelAnimationFrame(animRef.current)
    setIsPlaying(false)
    setSimProgress(0)
  }

  const handleSetFinal = () => {
    if (animRef.current) cancelAnimationFrame(animRef.current)
    setIsPlaying(false)
    setSimProgress(1)
  }

  useEffect(() => {
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current)
    }
  }, [])

  const isHot = currentTemp >= 45
  const isBoiling = currentTemp >= 80

  return (
    <div className="apparatus-card">
      <div className="apparatus-header">
        <div className="apparatus-title-group">
          <span className="apparatus-kicker">⚗️ bancada experimental ilustrada</span>
          <h4>Aparato de Calorimetria por Combustão</h4>
          <p className="apparatus-desc">
            Visualização científica do arranjo com lamparina, béquer graduado, termômetro e troca de calor.
          </p>
        </div>

        <div className="apparatus-controls">
          <button
            type="button"
            className={`apparatus-btn ${isPlaying ? 'active' : ''}`}
            onClick={handleToggleSimulation}
            title={isPlaying ? 'Pausar simulação' : 'Iniciar simulação da queima da lamparina'}
          >
            {isPlaying ? '⏸ Pausar' : '▶ Simular Queima'}
          </button>
          <button
            type="button"
            className="apparatus-btn ghost"
            onClick={handleReset}
            title="Voltar para a temperatura inicial antes da queima"
          >
            ↺ Antes da Queima
          </button>
          <button
            type="button"
            className="apparatus-btn ghost"
            onClick={handleSetFinal}
            title="Avançar diretamente para o estado final"
          >
            🔥 Após a Queima
          </button>
        </div>
      </div>

      <div className="apparatus-stage-container">
        <svg
          className="apparatus-svg"
          viewBox="0 0 680 420"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-label="Ilustração do aparato de bancada de calorimetria com béquer e lamparina"
        >
          <defs>
            <radialGradient id="flameInner" cx="50%" cy="80%" r="55%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
              <stop offset="35%" stopColor="#ffd13b" stopOpacity="0.95" />
              <stop offset="70%" stopColor="#ff7a18" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#e02600" stopOpacity="0.65" />
            </radialGradient>

            <linearGradient id="flameBaseBlue" x1="0" y1="1" x2="0" y2="0">
              <stop offset="0%" stopColor="#2563eb" stopOpacity="0.8" />
              <stop offset="40%" stopColor="#38bdf8" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
            </linearGradient>

            <linearGradient id="waterGradient" x1="0" y1="1" x2="0" y2="0">
              <stop offset="0%" stopColor={waterColorDark} stopOpacity="0.75" />
              <stop offset="70%" stopColor={waterColor} stopOpacity="0.55" />
              <stop offset="100%" stopColor={waterColor} stopOpacity="0.35" />
            </linearGradient>

            <linearGradient id="glassReflection" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.18" />
              <stop offset="12%" stopColor="#ffffff" stopOpacity="0.05" />
              <stop offset="88%" stopColor="#ffffff" stopOpacity="0.03" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0.15" />
            </linearGradient>

            <radialGradient id="glowGauze" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ff5722" stopOpacity={isPlaying || simProgress > 0 ? 0.75 : 0.15} />
              <stop offset="60%" stopColor="#ff9800" stopOpacity={isPlaying || simProgress > 0 ? 0.45 : 0.05} />
              <stop offset="100%" stopColor="#000000" stopOpacity="0" />
            </radialGradient>

            <filter id="flameGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* 1. MESA */}
          <rect x="20" y="385" width="640" height="20" rx="3" fill="var(--border-line, #dfdacF)" opacity="0.6" />
          <line x1="20" y1="385" x2="660" y2="385" stroke="var(--text-muted, #646a70)" strokeWidth="1.5" strokeOpacity="0.4" />

          {/* 2. SUPORTE UNIVERSAL */}
          <g className="universal-stand" opacity="0.85">
            <rect x="80" y="375" width="130" height="12" rx="2" fill="#334155" />
            <rect x="85" y="373" width="120" height="3" fill="#64748b" />
            <rect x="110" y="40" width="8" height="335" rx="2" fill="#475569" />
            <line x1="112" y1="40" x2="112" y2="375" stroke="#94a3b8" strokeWidth="1" />
            <rect x="105" y="70" width="18" height="16" rx="2" fill="#1e293b" />
            <circle cx="120" cy="78" r="3.5" fill="#94a3b8" />
            <path d="M123 78 L 332 78" stroke="#475569" strokeWidth="4" strokeLinecap="round" />
            <line x1="123" y1="77" x2="332" y2="77" stroke="#94a3b8" strokeWidth="1" />
            <rect x="328" y="72" width="12" height="12" rx="2" fill="#ef4444" opacity="0.85" />
          </g>

          {/* 3. TRIPÉ E TELA DE AQUECIMENTO */}
          <g className="tripod-group">
            <path d="M 230 385 L 265 240" stroke="#334155" strokeWidth="6" strokeLinecap="round" />
            <path d="M 430 385 L 395 240" stroke="#334155" strokeWidth="6" strokeLinecap="round" />
            <path d="M 330 380 L 330 240" stroke="#1e293b" strokeWidth="4.5" strokeLinecap="round" opacity="0.6" />
            <ellipse cx="330" cy="240" rx="72" ry="10" fill="none" stroke="#334155" strokeWidth="7" />
            <ellipse cx="330" cy="240" rx="72" ry="10" fill="none" stroke="#64748b" strokeWidth="1.5" />
            <rect x="250" y="235" width="160" height="4" rx="2" fill="#94a3b8" />
            <ellipse cx="330" cy="237" rx="36" ry="6" fill="url(#glowGauze)" />
            <ellipse cx="330" cy="237" rx="60" ry="8" fill="#e2e8f0" fillOpacity="0.25" stroke="#64748b" strokeWidth="1" strokeDasharray="3 3" />
          </g>

          {/* 4. LAMPARINA */}
          <g className="lamp-group">
            <ellipse cx="330" cy="385" rx="55" ry="6" fill="#000000" fillOpacity="0.2" />
            <path
              d="M 292 380 C 285 350, 290 320, 315 315 L 315 295 L 345 295 L 345 315 C 370 320, 375 350, 368 380 Z"
              fill="url(#glassReflection)"
              stroke="#64748b"
              strokeWidth="1.5"
            />
            {(() => {
              const fuelLevelY = 335 + simProgress * 8
              return (
                <path
                  d={`M 290 376 C 288 355, 295 340, 305 ${fuelLevelY} Q 330 ${fuelLevelY - 2} 355 ${fuelLevelY} C 365 340, 372 355, 370 376 Z`}
                  fill="#38bdf8"
                  fillOpacity="0.3"
                  stroke="#38bdf8"
                  strokeOpacity="0.4"
                  strokeWidth="1"
                />
              )
            })()}

            <rect x="312" y="290" width="36" height="10" rx="2" fill="#d97706" />
            <rect x="316" y="286" width="28" height="5" rx="1.5" fill="#f59e0b" />
            <path d="M 328 286 L 330 268 L 332 286 Z" fill="#475569" />

            {(isPlaying || simProgress > 0) && (
              <g className="flame-active" filter="url(#flameGlow)">
                <ellipse cx="330" cy="245" rx="28" ry="38" fill="url(#flameInner)" opacity="0.35" className="flame-halo-anim" />
                <path
                  className="flame-outer-anim"
                  d="M 322 270 Q 312 250 325 228 Q 330 215 334 228 Q 348 250 338 270 Q 330 274 322 270 Z"
                  fill="url(#flameInner)"
                />
                <path
                  className="flame-middle-anim"
                  d="M 324 268 Q 318 252 328 238 Q 331 228 333 238 Q 342 252 336 268 Z"
                  fill="#fef08a"
                  opacity="0.9"
                />
                <ellipse cx="330" cy="269" rx="11" ry="5" fill="url(#flameBaseBlue)" />
              </g>
            )}

            {(isPlaying || simProgress > 0) && (
              <g className="heat-waves" opacity="0.75">
                <path d="M 315 220 Q 310 205 316 195" stroke="#ff8c00" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="3 3" className="heat-wave-1" />
                <path d="M 330 215 Q 335 200 329 190" stroke="#ff5722" strokeWidth="1.8" strokeLinecap="round" strokeDasharray="3 3" className="heat-wave-2" />
                <path d="M 345 220 Q 350 205 344 195" stroke="#ff8c00" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="3 3" className="heat-wave-3" />
              </g>
            )}
          </g>

          {/* 5. BÉQUER GRADUADO */}
          <g className="beaker-group">
            <path
              d="M 270 120 L 270 232 Q 270 236 276 236 L 384 236 Q 390 236 390 232 L 390 120 L 396 116 L 390 114 L 270 114 L 264 116 L 270 120 Z"
              fill="rgba(255, 255, 255, 0.04)"
              stroke="#64748b"
              strokeWidth="2"
            />
            {(() => {
              const maxLiquidH = 95
              const h = (liquidHeightPercent / 100) * maxLiquidH
              const topY = 234 - h
              return (
                <g className="beaker-liquid">
                  <rect x="272" y={topY} width="116" height={h} rx="2" fill="url(#waterGradient)" />
                  <ellipse cx="330" cy={topY} rx="58" ry="4.5" fill={waterColor} fillOpacity="0.6" stroke={waterColorDark} strokeWidth="1" />
                  {isHot && (
                    <g className="convection-bubbles" opacity={isBoiling ? 0.9 : 0.6}>
                      <circle cx="310" cy={topY + h * 0.7} r="2.5" fill="#ffffff" opacity="0.6" className="bubble-1" />
                      <circle cx="345" cy={topY + h * 0.5} r="3" fill="#ffffff" opacity="0.7" className="bubble-2" />
                      <circle cx="325" cy={topY + h * 0.3} r="2" fill="#ffffff" opacity="0.5" className="bubble-3" />
                      <circle cx="355" cy={topY + h * 0.8} r="2" fill="#ffffff" opacity="0.6" className="bubble-4" />
                    </g>
                  )}
                </g>
              )
            })()}
            <g className="beaker-scales" opacity="0.6" stroke="#94a3b8" strokeWidth="1.2">
              <line x1="272" y1="215" x2="284" y2="215" />
              <line x1="272" y1="195" x2="288" y2="195" />
              <line x1="272" y1="175" x2="284" y2="175" />
              <line x1="272" y1="155" x2="288" y2="155" />
              <line x1="272" y1="135" x2="284" y2="135" />
            </g>
            <text x="292" y="198" fill="#94a3b8" fontSize="8" fontFamily="var(--font-mono)">100 mL</text>
            <text x="292" y="158" fill="#94a3b8" fontSize="8" fontFamily="var(--font-mono)">200 mL</text>
            <rect x="370" y="120" width="12" height="112" fill="url(#glassReflection)" />
          </g>

          {/* 6. TERMÔMETRO */}
          <g className="thermometer-group">
            <rect x="331" y="55" width="7" height="160" rx="3.5" fill="#f8fafc" fillOpacity="0.2" stroke="#64748b" strokeWidth="1" />
            <line x1="334.5" y1="58" x2="334.5" y2="200" stroke="#cbd5e1" strokeWidth="1.2" />
            <ellipse cx="334.5" cy="208" rx="6.5" ry="8" fill="#ef4444" stroke="#b91c1c" strokeWidth="1" />
            <circle cx="333" cy="206" r="2" fill="#ffffff" opacity="0.6" />
            {(() => {
              const maxCapillaryH = 135
              const h = (thermoPercent / 100) * maxCapillaryH
              const y = 200 - h
              return (
                <line
                  x1="334.5"
                  y1="200"
                  x2="334.5"
                  y2={y}
                  stroke="#ef4444"
                  strokeWidth="3.2"
                  strokeLinecap="round"
                />
              )
            })()}
            <g stroke="#64748b" strokeWidth="0.8" opacity="0.7">
              <line x1="331" y1="85" x2="333" y2="85" />
              <line x1="331" y1="115" x2="333" y2="115" />
              <line x1="331" y1="145" x2="333" y2="145" />
              <line x1="331" y1="175" x2="333" y2="175" />
            </g>
          </g>

          {/* 7. BALÕES DE VALORES */}
          <g className="annotation-tag" transform="translate(355, 65)">
            <rect x="0" y="0" width="130" height="38" rx="6" fill="var(--bg-card, #ffffff)" stroke="var(--border-line, #dfdacF)" strokeWidth="1.2" />
            <line x1="0" y1="18" x2="-14" y2="18" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="2 2" />
            <circle cx="-14" cy="18" r="2.5" fill="#ef4444" />
            <text x="10" y="15" fill="var(--text-muted, #646a70)" fontSize="9" fontWeight="600" fontFamily="var(--font-heading)">TERMÔMETRO</text>
            <text x="10" y="30" fill="var(--red, #ef4444)" fontSize="14" fontWeight="700" fontFamily="var(--font-mono)">
              {formatNumber(currentTemp)} °C
            </text>
            <text x="65" y="30" fill="var(--text-dim, #8b9298)" fontSize="9" fontFamily="var(--font-mono)">
              ({initialTemp}° → {finalTemp}°)
            </text>
          </g>

          <g className="annotation-tag" transform="translate(425, 150)">
            <rect x="0" y="0" width="150" height="52" rx="6" fill="var(--bg-card, #ffffff)" stroke="var(--border-line, #dfdacF)" strokeWidth="1.2" />
            <path d="M 0 26 L -35 185" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="2 2" opacity="0.6" />
            <circle cx="-35" cy="185" r="2.5" fill="#38bdf8" />
            <text x="10" y="16" fill="var(--text-muted, #646a70)" fontSize="9" fontWeight="600" fontFamily="var(--font-heading)">ÁGUA NO BÉQUER</text>
            <text x="10" y="32" fill="var(--text-main, #1c2024)" fontSize="13" fontWeight="700" fontFamily="var(--font-mono)">
              {formatNumber(wMass)} g de H2O
            </text>
            <text x="10" y="45" fill="var(--text-dim, #8b9298)" fontSize="9" fontFamily="var(--font-sans)">
              c = 1,0 cal/g·°C {includeBeaker ? `+ béquer ${beakerMass}g` : ''}
            </text>
          </g>

          <g className="annotation-tag" transform="translate(425, 305)">
            <rect x="0" y="0" width="155" height="54" rx="6" fill="var(--bg-card, #ffffff)" stroke="var(--border-line, #dfdacF)" strokeWidth="1.2" />
            <path d="M 0 27 L -50 40" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="2 2" opacity="0.7" />
            <circle cx="-50" cy="40" r="2.5" fill="#f59e0b" />
            <text x="10" y="15" fill="var(--text-muted, #646a70)" fontSize="9" fontWeight="600" fontFamily="var(--font-heading)">
              LAMPARINA ({fuelFormula})
            </text>
            <text x="10" y="32" fill="var(--text-main, #1c2024)" fontSize="13" fontWeight="700" fontFamily="var(--font-mono)">
              m = {formatNumber(currentLampMass)} g
            </text>
            <text x="10" y="46" fill="var(--orange, #ed613d)" fontSize="9.5" fontWeight="600" fontFamily="var(--font-mono)">
              Δm consumido = {formatNumber(bMass)} g
            </text>
          </g>

          <g className="annotation-tag" transform="translate(30, 240)">
            <rect x="0" y="0" width="145" height="58" rx="6" fill="var(--bg-card, #ffffff)" stroke="var(--border-line, #dfdacF)" strokeWidth="1.2" />
            <text x="10" y="16" fill="var(--text-muted, #646a70)" fontSize="9" fontWeight="600" fontFamily="var(--font-heading)">
              CALOR CAPTURADO (Q)
            </text>
            <text x="10" y="34" fill="var(--green, #10b981)" fontSize="14" fontWeight="700" fontFamily="var(--font-mono)">
              {formatNumber(heat)} cal
            </text>
            <text x="10" y="48" fill="var(--text-dim, #8b9298)" fontSize="9.5" fontFamily="var(--font-sans)">
              Rendimento útil: <strong>{formatNumber(efficiency)}%</strong>
            </text>
          </g>
        </svg>

        <div className="apparatus-status-bar">
          <div className="status-item">
            <span className="status-label">Combustível:</span>
            <strong>{fuelName} ({fuelFormula})</strong>
          </div>
          <div className="status-item">
            <span className="status-label">Status da Chama:</span>
            <span className={isPlaying || simProgress > 0 ? 'flame-badge on' : 'flame-badge off'}>
              {isPlaying ? '🔥 Queima ativa' : simProgress === 1 ? '✓ Queima concluída' : '● Apagada'}
            </span>
          </div>
          <div className="status-item">
            <span className="status-label">Variação da Água:</span>
            <strong>ΔT = +{formatNumber(tFinal - tInit)} °C</strong>
          </div>
          <div className="status-item">
            <span className="status-label">Progresso do Teste:</span>
            <strong>{Math.round(simProgress * 100)}%</strong>
          </div>
        </div>
      </div>
    </div>
  )
}
