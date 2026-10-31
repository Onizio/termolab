import React, { useMemo } from 'react'
import { formatNumber, parseNumber } from '../lib/calorimetria'
import { TABELA_SUBSTANCIAS } from '../data/substancias'

/**
 * Visualização Didática e Interativa de Calorimetria Fundamental (Q = m · c · ΔT):
 * - Representação visual da substância sob aquecimento ou resfriamento
 * - Placa térmica com fonte radiante (+Q) ou criogênica (-Q)
 * - Termômetro graduado responsivo
 * - Janela de agitação molecular microscópica (Teoria Cinética)
 * - Cards métricos organizados em CSS flexível (sem sobreposição de texto em SVG)
 */
export default function IlustracaoCalorimetria({
  material = 'Água (líquida)',
  values = { q: '', m: '200', c: '1', deltaT: '25' },
  resultValue,
  unknown = 'q',
  qUnit = 'cal',
  mUnit = 'g',
  cUnit = 'cal/g·°C',
  formatValue = formatNumber,
}) {
  const dt = parseNumber(values.deltaT) ?? (unknown === 'deltaT' && resultValue !== null ? resultValue : 25)
  const m = parseNumber(values.m) ?? (unknown === 'm' && resultValue !== null ? resultValue : 200)
  const c = parseNumber(values.c) ?? (unknown === 'c' && resultValue !== null ? resultValue : 1)
  const q = parseNumber(values.q) ?? (unknown === 'q' && resultValue !== null ? resultValue : (m * c * dt))

  const isHeating = dt > 0 || (unknown === 'deltaT' && q > 0)
  const isCooling = dt < 0 || (unknown === 'deltaT' && q < 0)
  const isNeutral = dt === 0 && q === 0

  // Obter cor e características do material selecionado
  const materialInfo = useMemo(() => {
    const item = TABELA_SUBSTANCIAS.find((s) => s.name === material)
    if (item) return item
    return { name: material, symbol: 'X', color: '#38bdf8', category: 'Personalizado' }
  }, [material])

  // Capacidade térmica total da amostra C = m · c
  const heatCapacity = Math.abs(m * c)

  // Altura da coluna do termômetro (-50 a +100°C)
  const thermoPercent = useMemo(() => {
    const clamped = Math.max(-40, Math.min(100, dt))
    return Math.max(10, Math.min(95, ((clamped + 40) / 140) * 85 + 10))
  }, [dt])

  // Cores dinâmicas para a atmosfera térmica
  const natureTheme = isHeating
    ? {
        name: 'Processo Endotérmico',
        desc: 'A amostra absorve energia térmica do ambiente, aumentando a agitação de suas partículas.',
        color: 'var(--orange, #ed613d)',
        badgeClass: 'endothermic',
        sign: '+',
        tag: '🔥 Aquecimento (+Q)',
      }
    : isCooling
      ? {
          name: 'Processo Exotérmico',
          desc: 'A amostra cede calor para o ambiente, reduzindo a energia cinética molecular.',
          color: 'var(--blue, #38bdf8)',
          badgeClass: 'exothermic',
          sign: '-',
          tag: '❄️ Resfriamento (-Q)',
        }
      : {
          name: 'Estado de Equilíbrio',
          desc: 'Sem variação de temperatura ou transferência líquida de energia.',
          color: 'var(--text-dim, #8b9298)',
          badgeClass: 'neutral',
          sign: '',
          tag: '⚖️ Estático (ΔT = 0)',
        }

  return (
    <div className="thermal-lab-widget">
      {/* CABEÇALHO DO WIDGET */}
      <div className="thermal-widget-header">
        <div className="widget-title-area">
          <span className="thermal-widget-kicker">✦ simulação física do calor</span>
          <h4>Comportamento Térmico da Matéria: Q = m · c · ΔT</h4>
        </div>

        <div className={`thermal-nature-pill ${natureTheme.badgeClass}`}>
          <span className="nature-dot" />
          <span>{natureTheme.tag}</span>
        </div>
      </div>

      <div className="thermal-widget-body">
        {/* COLUNA ESQUERDA: O APARATO DE LABORATÓRIO */}
        <div className="thermal-stage-column">
          <div className="thermal-apparatus-box">
            {/* TERMÔMETRO VERTICAL */}
            <div className="apparatus-thermometer-unit" title={`Variação de Temperatura: ${dt > 0 ? `+${dt}` : dt} °C`}>
              <span className="thermo-top-label">{dt > 0 ? `+${dt}°` : `${dt}°`}</span>
              <div className="thermo-glass-tube">
                <div
                  className="thermo-mercury-fill"
                  style={{
                    height: `${thermoPercent}%`,
                    backgroundColor: isHeating ? 'var(--orange, #ed613d)' : isCooling ? 'var(--blue, #38bdf8)' : '#94a3b8',
                  }}
                />
              </div>
              <div
                className="thermo-glass-bulb"
                style={{
                  backgroundColor: isHeating ? 'var(--orange, #ed613d)' : isCooling ? 'var(--blue, #38bdf8)' : '#94a3b8',
                }}
              />
              <span className="thermo-bottom-label">ΔT</span>
            </div>

            {/* O BÉQUER / RECIPIENTE COM A AMOSTRA */}
            <div className="sample-vessel-container">
              {/* ONDAS TÉRMICAS ASCENDENTES (QUANDO AQUECENDO) */}
              {isHeating && (
                <div className="thermal-vapor-stream" aria-hidden="true">
                  <span className="vapor-wave v1" />
                  <span className="vapor-wave v2" />
                  <span className="vapor-wave v3" />
                </div>
              )}

              {/* CRISTAIS DE GELO (QUANDO RESFRIANDO) */}
              {isCooling && (
                <div className="cooling-frost-layer" aria-hidden="true">
                  <span className="frost-star">❄</span>
                  <span className="frost-star f2">❅</span>
                </div>
              )}

              {/* CORPO DE VIDRO DO BÉQUER */}
              <div className="glass-beaker">
                {/* GRADUAÇÕES DE VIDRO */}
                <div className="beaker-ticks">
                  <span />
                  <span />
                  <span />
                </div>

                {/* CONTEÚDO / LÍQUIDO OU BLOCO DA SUBSTÂNCIA */}
                <div
                  className="substance-fill"
                  style={{
                    backgroundColor: `${materialInfo.color || '#38bdf8'}44`,
                    borderColor: materialInfo.color || '#38bdf8',
                  }}
                >
                  <div className="substance-identity-tag">
                    <span className="substance-sym-pill" style={{ borderColor: materialInfo.color, color: materialInfo.color }}>
                      {materialInfo.symbol}
                    </span>
                    <strong className="substance-name-text">{material}</strong>
                    <span className="substance-mass-text">{formatValue(m)} {mUnit}</span>
                  </div>
                </div>
              </div>

              {/* FONTE TÉRMICA INFERIOR (PLACA TÉRMICA OU GELO) */}
              <div className={`thermal-base-plate ${isHeating ? 'heating' : isCooling ? 'cooling' : 'idle'}`}>
                {isHeating ? (
                  <div className="burner-flames-row" aria-hidden="true">
                    <span className="burner-flame flame-1" />
                    <span className="burner-flame flame-2" />
                    <span className="burner-flame flame-3" />
                    <span className="burner-flame flame-4" />
                  </div>
                ) : isCooling ? (
                  <div className="cryo-base-chill" aria-hidden="true">
                    <span className="chill-bar" />
                  </div>
                ) : (
                  <div className="ambient-plate" />
                )}
                <span className="plate-label">
                  {isHeating ? 'Fonte Aquecedora (+Q)' : isCooling ? 'Banho Criogênico (-Q)' : 'Equilíbrio Ambiente'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* COLUNA DIREITA: JANELA MICROSCÓPICA E CARDS DE GRANDEZAS */}
        <div className="thermal-info-column">
          {/* LENTE DE VISUALIZAÇÃO MICROSCÓPICA (TEORIA CINÉTICA) */}
          <div className="microscopic-lens-card">
            <div className="lens-header">
              <span className="lens-icon">🔬</span>
              <div>
                <strong>Visão Microscópica (Teoria Cinética)</strong>
                <p>
                  {isHeating
                    ? 'Agitação molecular acelerada por ganho de energia cinética.'
                    : isCooling
                      ? 'Agitação molecular reduzida por perda de energia cinética.'
                      : 'Agitação térmica estável em temperatura constante.'}
                </p>
              </div>
            </div>

            {/* JANELA DE PARTÍCULAS EM MOVIMENTO */}
            <div className={`lens-viewport ${isHeating ? 'vibe-fast' : isCooling ? 'vibe-slow' : 'vibe-normal'}`}>
              <span className="atom-particle a1" style={{ backgroundColor: materialInfo.color }} />
              <span className="atom-particle a2" style={{ backgroundColor: materialInfo.color }} />
              <span className="atom-particle a3" style={{ backgroundColor: materialInfo.color }} />
              <span className="atom-particle a4" style={{ backgroundColor: materialInfo.color }} />
              <span className="atom-particle a5" style={{ backgroundColor: materialInfo.color }} />
              <span className="atom-particle a6" style={{ backgroundColor: materialInfo.color }} />
              <span className="atom-particle a7" style={{ backgroundColor: materialInfo.color }} />
            </div>
          </div>

          {/* GRID COM OS 4 CARDS DAS GRANDEZAS FÍSICAS */}
          <div className="thermal-metrics-grid">
            <div className="thermal-metric-card">
              <span className="metric-tag">ENERGIA TÉRMICA (Q)</span>
              <strong className="metric-value-text" style={{ color: natureTheme.color }}>
                {natureTheme.sign}{formatValue(Math.abs(q))} <small>{qUnit}</small>
              </strong>
              <span className="metric-desc-text">
                {isHeating ? 'Calor absorvido' : isCooling ? 'Calor liberado' : 'Sem fluxo'}
              </span>
            </div>

            <div className="thermal-metric-card">
              <span className="metric-tag">VARIAÇÃO TÉRMICA (ΔT)</span>
              <strong className="metric-value-text">
                {dt > 0 && '+'}{formatValue(dt)} <small>°C</small>
              </strong>
              <span className="metric-desc-text">
                {dt > 0 ? 'Temperatura subiu' : dt < 0 ? 'Temperatura desceu' : 'Inalterada'}
              </span>
            </div>

            <div className="thermal-metric-card">
              <span className="metric-tag">CALOR ESPECÍFICO (c)</span>
              <strong className="metric-value-text">
                {formatValue(c)} <small>{cUnit}</small>
              </strong>
              <span className="metric-desc-text">
                Inércia térmica do {materialInfo.name}
              </span>
            </div>

            <div className="thermal-metric-card">
              <span className="metric-tag">CAPACIDADE TÉRMICA (C)</span>
              <strong className="metric-value-text">
                {formatValue(heatCapacity)} <small>cal/°C</small>
              </strong>
              <span className="metric-desc-text">
                C = m · c para toda a amostra
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
