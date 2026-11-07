import React, { useEffect, useMemo, useRef, useState } from 'react'
import { SUBSTANCIAS } from '../data/substancias'
import {
  formatInputValue,
  formatNumber,
  parseNumber,
  thermalEquilibrium,
  thermalEquilibriumSteps,
} from '../lib/calorimetria'

const EQUILIBRIUM_PRESETS = [
  {
    name: 'Água Fria (20 °C) + Ferro Aquecido (100 °C)',
    mat1: 'Água (líquida)',
    mat2: 'Ferro',
    values: { m1: '250', t1: '20', m2: '150', t2: '100' },
  },
  {
    name: 'Água (20 °C) + Alumínio Quente (80 °C)',
    mat1: 'Água (líquida)',
    mat2: 'Alumínio',
    values: { m1: '100', t1: '20', m2: '100', t2: '80' },
  },
  {
    name: 'Água Fria (10 °C) + Água Quente (90 °C) [Média 50 °C]',
    mat1: 'Água (líquida)',
    mat2: 'Água (líquida)',
    values: { m1: '200', t1: '10', m2: '200', t2: '90' },
  },
  {
    name: 'Cobre a 150 °C + Álcool Etílico a 20 °C',
    mat1: 'Álcool etílico (etanol)',
    mat2: 'Cobre',
    values: { m1: '150', t1: '20', m2: '200', t2: '150' },
  },
  {
    name: 'Chumbo a 100 °C + Água a 20 °C (Baixo c do Chumbo)',
    mat1: 'Água (líquida)',
    mat2: 'Chumbo',
    values: { m1: '200', t1: '20', m2: '300', t2: '100' },
  },
]

export default function EquilibrioTermico() {
  const [substance1, setSubstance1] = useState(() =>
    SUBSTANCIAS.find((s) => s.name === 'Água (líquida)') || SUBSTANCIAS[0]
  )
  const [substance2, setSubstance2] = useState(() =>
    SUBSTANCIAS.find((s) => s.name === 'Alumínio') || SUBSTANCIAS[1]
  )

  const [m1, setM1] = useState('100')
  const [t1, setT1] = useState('20')
  const [m2, setM2] = useState('100')
  const [t2, setT2] = useState('80')

  const [customC1, setCustomC1] = useState('')
  const [customC2, setCustomC2] = useState('')

  const [draggedItem, setDraggedItem] = useState(null)
  const [dragOverSlot, setDragOverSlot] = useState(null)

  const [activeCategory, setActiveCategory] = useState('Todos')
  const [searchTerm, setSearchTerm] = useState('')

  const [isSimulating, setIsSimulating] = useState(false)
  const rafRef = useRef(null)

  useEffect(() => () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
  }, [])
  const [simProgress, setSimProgress] = useState(100)
  const [copied, setCopied] = useState(false)

  const categoryStats = useMemo(() => {
    const rawCategories = ['Todos', ...new Set(SUBSTANCIAS.map((s) => s.category).filter(Boolean))]
    return rawCategories.map((cat) => {
      const count = cat === 'Todos'
        ? SUBSTANCIAS.length
        : SUBSTANCIAS.filter((s) => s.category === cat).length
      return { name: cat, count }
    })
  }, [])

  const filteredSubstances = useMemo(() => {
    return SUBSTANCIAS.filter((s) => {
      const matchCat = activeCategory === 'Todos' || s.category === activeCategory
      const matchSearch =
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.symbol.toLowerCase().includes(searchTerm.toLowerCase())
      return matchCat && matchSearch
    })
  }, [activeCategory, searchTerm])

  const effectiveC1 = customC1 !== '' ? customC1 : String(substance1?.value ?? '1')
  const effectiveC2 = customC2 !== '' ? customC2 : String(substance2?.value ?? '0.22')

  const calculationValues = useMemo(
    () => ({
      m1,
      c1: effectiveC1,
      t1,
      m2,
      c2: effectiveC2,
      t2,
    }),
    [m1, effectiveC1, t1, m2, effectiveC2, t2]
  )

  const [calculatedValues, setCalculatedValues] = useState(null)

  const canCalculate = useMemo(() => Boolean(thermalEquilibrium(calculationValues)), [calculationValues])

  const isCalculationCurrent =
    calculatedValues !== null &&
    Object.keys(calculationValues).every((k) => calculationValues[k] === calculatedValues[k])

  const result = useMemo(
    () => (isCalculationCurrent ? thermalEquilibrium(calculatedValues) : null),
    [isCalculationCurrent, calculatedValues]
  )
  const steps = useMemo(
    () => (isCalculationCurrent ? thermalEquilibriumSteps(calculatedValues) : []),
    [isCalculationCurrent, calculatedValues]
  )

  const runSimulation = () => {
    if (!canCalculate) return
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    setCalculatedValues({ ...calculationValues })
    setIsSimulating(true)
    setSimProgress(0)
    const startTime = performance.now()
    const duration = 1400

    const animate = (time) => {
      const elapsed = time - startTime
      const progress = Math.min(1, elapsed / duration)
      const ease = 1 - Math.pow(1 - progress, 3)
      setSimProgress(Math.round(ease * 100))

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate)
      } else {
        rafRef.current = null
        setIsSimulating(false)
        setSimProgress(100)
      }
    }
    rafRef.current = requestAnimationFrame(animate)
  }

  const assignSubstance = (slot, substance) => {
    if (slot === 1) {
      setSubstance1(substance)
      setCustomC1('')
    } else {
      setSubstance2(substance)
      setCustomC2('')
    }
  }

  const handleDragStart = (e, substance) => {
    setDraggedItem(substance)
    e.dataTransfer.setData('text/plain', substance.name)
    e.dataTransfer.effectAllowed = 'copyMove'
  }

  const handleDragEnd = () => {
    setDraggedItem(null)
    setDragOverSlot(null)
  }

  const handleDragOver = (e, slot) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'copy'
    if (dragOverSlot !== slot) {
      setDragOverSlot(slot)
    }
  }

  const handleDragLeave = (slot) => {
    if (dragOverSlot === slot) {
      setDragOverSlot(null)
    }
  }

  const handleDrop = (e, slot) => {
    e.preventDefault()
    setDragOverSlot(null)
    const substanceName = e.dataTransfer.getData('text/plain')
    const item = SUBSTANCIAS.find((s) => s.name === substanceName) || draggedItem
    if (item) {
      assignSubstance(slot, item)
    }
    setDraggedItem(null)
  }

  const swapSlots = () => {
    const prevSub1 = substance1
    const prevC1 = customC1
    const prevM1 = m1
    const prevT1 = t1

    setSubstance1(substance2)
    setCustomC1(customC2)
    setM1(m2)
    setT1(t2)

    setSubstance2(prevSub1)
    setCustomC2(prevC1)
    setM2(prevM1)
    setT2(prevT1)
  }

  const applyPreset = (preset) => {
    const mat1 = SUBSTANCIAS.find((s) => s.name === preset.mat1)
    const mat2 = SUBSTANCIAS.find((s) => s.name === preset.mat2)
    if (mat1) {
      setSubstance1(mat1)
      setCustomC1('')
    }
    if (mat2) {
      setSubstance2(mat2)
      setCustomC2('')
    }
    setM1(preset.values.m1)
    setT1(preset.values.t1)
    setM2(preset.values.m2)
    setT2(preset.values.t2)
  }
  const copyResolution = () => {
    if (!result) return
    const text = [
      '==========================================================',
      '      TermoLab — Simulação de Equilíbrio Térmico',
      '==========================================================',
      `Corpo 1 (${substance1?.name}):`,
      `  • Símbolo/Fórmula: ${substance1?.symbol || '—'}`,
      `  • Massa (m1): ${m1} g`,
      `  • Calor Específico (c1): ${effectiveC1} cal/g·°C`,
      `  • Temperatura Inicial (T1): ${t1} °C`,
      `  • Capacidade Térmica (C1 = m1·c1): ${formatNumber(result.cap1)} cal/°C`,
      '----------------------------------------------------------',
      `Corpo 2 (${substance2?.name}):`,
      `  • Símbolo/Fórmula: ${substance2?.symbol || '—'}`,
      `  • Massa (m2): ${m2} g`,
      `  • Calor Específico (c2): ${effectiveC2} cal/g·°C`,
      `  • Temperatura Inicial (T2): ${t2} °C`,
      `  • Capacidade Térmica (C2 = m2·c2): ${formatNumber(result.cap2)} cal/°C`,
      '----------------------------------------------------------',
      'Passo a Passo da Dedução Algébrica:',
      ...steps.map((s, idx) => `  ${idx + 1}. ${s}`),
      '----------------------------------------------------------',
      'RESULTADOS DO EQUILÍBRIO:',
      `  • Temperatura Final de Equilíbrio: Teq = ${formatNumber(result.equilibrium)} °C (${formatNumber(result.equilibrium + 273.15)} K)`,
      `  • Calor Trocado (|Q|): ${formatNumber(result.heatExchanged)} cal (${formatNumber(result.heatExchanged * 4.18)} J)`,
      `  • Variação do Corpo 1 (Q1): ${formatNumber(result.q1)} cal (${result.q1 >= 0 ? 'calor absorvido' : 'calor cedido'})`,
      `  • Variação do Corpo 2 (Q2): ${formatNumber(result.q2)} cal (${result.q2 >= 0 ? 'calor absorvido' : 'calor cedido'})`,
      `  • Conservação estrita: Q1 + Q2 = ${formatNumber(result.sum)} cal ≈ 0 cal ✓`,
      '==========================================================',
    ].join('\n')

    navigator.clipboard?.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2200)
  }

  const simT1 = useMemo(() => {
    if (!result) return parseNumber(t1) || 0
    const start = parseNumber(t1) || 0
    const target = result.equilibrium
    return start + (target - start) * (simProgress / 100)
  }, [t1, result, simProgress])

  const simT2 = useMemo(() => {
    if (!result) return parseNumber(t2) || 0
    const start = parseNumber(t2) || 0
    const target = result.equilibrium
    return start + (target - start) * (simProgress / 100)
  }, [t2, result, simProgress])

  const t1Num = parseNumber(t1) || 0
  const t2Num = parseNumber(t2) || 0
  const isHeatFrom1to2 = t1Num > t2Num
  const isAlreadyEquilibrium = t1Num === t2Num

  return (
    <section className="content-section interactive-equilibrium-section">
      <div className="section-intro">
        <div>
          <div className="eyebrow">02 / sistema adiabático isolado</div>
          <h2>Simulador Interativo de Equilíbrio Térmico</h2>
        </div>
        <p>
          Arraste substâncias da paleta para os <strong>Espaços 1 e 2</strong> dentro do calorímetro adiabático.
          Ajuste as massas e temperaturas iniciais e clique em <strong>Calcular Equilíbrio Térmico</strong> para ver a troca de calor e o equilíbrio no centro.
        </p>
      </div>

      {/* CARDS DE DESTAQUE TERMODINÂMICO (HERO STATS) */}
      <div className="table-hero-stats">
        <div className="hero-stat-card high-capacity">
          <div className="stat-card-badge">⚖️ Lei da Conservação</div>
          <div className="stat-card-value">Σ Q = 0</div>
          <div className="stat-card-name">Sistema Adiabático Isolado</div>
          <p className="stat-card-desc">
            Todo o calor cedido pelo corpo mais quente (|Q| &lt; 0) é integralmente absorvido pelo corpo mais frio (Q &gt; 0).
          </p>
        </div>

        <div className="hero-stat-card low-capacity">
          <div className="stat-card-badge">🌡️ Temperatura de Equilíbrio</div>
          <div className="stat-card-value">{result ? `${formatNumber(result.equilibrium)} °C` : 'Teq'}</div>
          <div className="stat-card-name">Média Ponderada Térmica</div>
          <p className="stat-card-desc">
            A temperatura final tende sempre para o corpo com maior capacidade térmica (C = m · c).
          </p>
        </div>

        <div className="hero-stat-card count-capacity">
          <div className="stat-card-badge">🧪 Inércia Térmica</div>
          <div className="stat-card-value">C = m · c <small>cal/°C</small></div>
          <div className="stat-card-name">Capacidade Térmica Total</div>
          <p className="stat-card-desc">
            Quanto maior a capacidade térmica, mais estável o corpo permanece frente à troca de calor.
          </p>
        </div>
      </div>

      <div className="presets-bar">
        <span className="presets-label">Cenários Práticos:</span>
        <div className="presets-chips">
          {EQUILIBRIUM_PRESETS.map((preset) => (
            <button
              key={preset.name}
              type="button"
              className="preset-chip"
              onClick={() => applyPreset(preset)}
              title="Carregar este cenário pré-configurado"
            >
              {preset.name}
            </button>
          ))}
          <button
            type="button"
            className="preset-chip swap-chip"
            onClick={swapSlots}
            title="Inverter os elementos e dados entre o Espaço 1 e Espaço 2"
          >
            ⇄ Inverter Espaços
          </button>
        </div>
      </div>

      {/* PALETA DE ELEMENTOS E MATERIAIS REDESENHADA */}
      <div className="fresh-elements-shelf">
        <div className="shelf-header-fresh">
          <div className="shelf-title-fresh">
            <span className="shelf-icon-badge">🧪</span>
            <div>
              <h3>Paleta Interativa de Materiais</h3>
              <p>Clique nos botões de espaço ou arraste para preencher os corpos do experimento.</p>
            </div>
          </div>

          <div className="shelf-search-box">
            <span className="search-icon-svg" aria-hidden="true">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </span>
            <input
              type="search"
              placeholder="Buscar elemento (ex: Fe, Cu, Água)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label="Buscar elemento na paleta"
            />
            {searchTerm && (
              <button
                type="button"
                className="clear-search-pill-btn"
                onClick={() => setSearchTerm('')}
                title="Limpar busca"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        <div className="shelf-chips-scroll">
          {categoryStats.map((cat) => (
            <button
              key={cat.name}
              type="button"
              className={`table-category-chip ${activeCategory === cat.name ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat.name)}
            >
              <span>{cat.name}</span>
              <span className="chip-count-badge">{cat.count}</span>
            </button>
          ))}
        </div>

        <div className="elements-cards-grid" role="list" aria-label="Lista de elementos arrastáveis">
          {filteredSubstances.map((sub) => {
            const isSelectedInSlot1 = substance1?.name === sub.name
            const isSelectedInSlot2 = substance2?.name === sub.name
            const maxCal = 1.0
            const barPercent = Math.min(100, Math.max(3, (sub.value / maxCal) * 100))

            return (
              <div
                key={sub.name}
                className={`fresh-element-card ${
                  draggedItem?.name === sub.name ? 'is-dragging' : ''
                } ${isSelectedInSlot1 ? 'slot1-active' : ''} ${isSelectedInSlot2 ? 'slot2-active' : ''}`}
                draggable={true}
                onDragStart={(e) => handleDragStart(e, sub)}
                onDragEnd={handleDragEnd}
                title={`${sub.name} (${sub.symbol}) — c = ${sub.value} cal/g·°C. Arraste ou use os botões.`}
                role="listitem"
              >
                <div className="elem-card-header">
                  <div className="elem-identity">
                    <span
                      className="elem-color-dot"
                      style={{ backgroundColor: sub.color || '#3b82f6' }}
                    />
                    <strong className="elem-name" title={sub.name}>{sub.name}</strong>
                    {sub.symbol && sub.symbol !== '—' && (
                      <span className="elem-symbol-pill">{sub.symbol}</span>
                    )}
                  </div>
                  <span className="elem-cat-tag">{sub.category}</span>
                </div>

                <div className="elem-heat-capacity-row">
                  <div className="elem-c-values">
                    <span className="elem-c-cal">
                      c = <strong>{formatInputValue(sub.value)}</strong> <small>cal/g·°C</small>
                    </span>
                    <span className="elem-c-joule">
                      ({formatInputValue(sub.valueJ)} J/g·°C)
                    </span>
                  </div>

                  <div className="heat-bar-track" title={`${sub.name}: ${barPercent.toFixed(0)}% da inércia da água`}>
                    <div
                      className="heat-bar-fill"
                      style={{
                        width: `${barPercent}%`,
                        backgroundColor: sub.color || 'var(--orange)',
                      }}
                    />
                  </div>
                </div>

                <div className="elem-card-footer">
                  <div className="elem-slot-buttons">
                    <button
                      type="button"
                      className={`btn-assign-slot slot-1 ${isSelectedInSlot1 ? 'assigned' : ''}`}
                      onClick={() => assignSubstance(1, sub)}
                      title={`Colocar ${sub.name} no Espaço 1`}
                    >
                      {isSelectedInSlot1 ? '✓ No Espaço 1' : '→ Espaço 1'}
                    </button>
                    <button
                      type="button"
                      className={`btn-assign-slot slot-2 ${isSelectedInSlot2 ? 'assigned' : ''}`}
                      onClick={() => assignSubstance(2, sub)}
                      title={`Colocar ${sub.name} no Espaço 2`}
                    >
                      {isSelectedInSlot2 ? '✓ No Espaço 2' : '→ Espaço 2'}
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
      {/* CÂMARA DO CALORÍMETRO: ESPAÇO 1 + O MEIO + ESPAÇO 2 */}
      <div className="calorimeter-chamber-container">
        <div className="calorimeter-outer-casing">
          <div className="calorimeter-badge-tag">
            <span className="insulation-icon">🛡️</span> Calorímetro adiabático ideal · sistema isolado
          </div>

          <div className="calorimeter-interior-grid">
            {/* ESPAÇO 1 (CORPO 1 - ESQUERDA) */}
            <div
              className={`drop-slot-chamber slot-one ${dragOverSlot === 1 ? 'drag-over' : ''}`}
              onDragOver={(e) => handleDragOver(e, 1)}
              onDragLeave={() => handleDragLeave(1)}
              onDrop={(e) => handleDrop(e, 1)}
            >
              <div className="slot-chamber-header">
                <span className="slot-badge badge-1">Espaço 1 (Corpo A)</span>
                <span className="drop-hint-text">
                  {dragOverSlot === 1 ? 'Solte aqui!' : 'Arraste ou escolha na paleta'}
                </span>
              </div>

              <div
                className="active-element-card slot-1-active"
                style={{ borderLeftColor: substance1?.color || '#38bdf8' }}
              >
                <div
                  className="active-element-avatar"
                  style={{
                    backgroundColor: `${substance1?.color || '#38bdf8'}26`,
                    color: substance1?.color || '#38bdf8',
                  }}
                >
                  {substance1?.symbol || 'A'}
                </div>
                <div className="active-element-details">
                  <span className="active-element-title" title={substance1?.name}>{substance1?.name || 'Personalizado'}</span>
                  <div className="active-element-badges">
                    <span className="active-c-tag">
                      c1 = <strong>{effectiveC1}</strong> cal/g·°C
                    </span>
                    <span className="active-cat-tag">{substance1?.category || 'Material'}</span>
                  </div>
                </div>
              </div>

              <div className="slot-inputs-grid">
                <div className="slot-input-group">
                  <label htmlFor="m1-input">Massa Inicial (m1):</label>
                  <div className="slot-input-field">
                    <input
                      id="m1-input"
                      type="text"
                      inputMode="decimal"
                      value={m1}
                      onChange={(e) => setM1(e.target.value)}
                      placeholder="ex.: 100"
                    />
                    <span className="slot-unit">g</span>
                  </div>
                  <div className="quick-values-row">
                    {['50', '100', '200', '500'].map((presetM) => (
                      <button
                        key={presetM}
                        type="button"
                        className={`mini-chip ${m1 === presetM ? 'active' : ''}`}
                        onClick={() => setM1(presetM)}
                      >
                        {presetM}g
                      </button>
                    ))}
                  </div>
                </div>

                <div className="slot-input-group">
                  <label htmlFor="t1-input">Temperatura Inicial (T1):</label>
                  <div className="slot-input-field">
                    <input
                      id="t1-input"
                      type="text"
                      inputMode="decimal"
                      value={t1}
                      onChange={(e) => setT1(e.target.value)}
                      placeholder="ex.: 20"
                    />
                    <span className="slot-unit">°C</span>
                  </div>
                  <div className="quick-values-row">
                    {[
                      { val: '10', label: '10° (fria)' },
                      { val: '20', label: '20° (amb.)' },
                      { val: '60', label: '60° (morna)' },
                      { val: '95', label: '95° (quente)' },
                    ].map((p) => (
                      <button
                        key={p.val}
                        type="button"
                        className={`mini-chip ${t1 === p.val ? 'active' : ''}`}
                        onClick={() => setT1(p.val)}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div
                  className={`thermal-state-pill ${
                    t1Num > 60 ? 'hot' : t1Num < 20 ? 'cold' : 'ambient'
                  }`}
                >
                  <span className="thermal-indicator-dot" />
                  <span>
                    Estado térmico: {t1Num > 60 ? 'Aquecido / Quente' : t1Num < 20 ? 'Resfriado / Frio' : 'Temperatura Moderada'}
                  </span>
                  <span className="thermal-dynamic-temp">
                    {isSimulating ? `~ ${formatNumber(simT1)} °C` : `${t1} °C`}
                  </span>
                </div>

                <div className="slot-capacity-pill">
                  <span>Capacidade Térmica C1 (m1 · c1):</span>
                  <strong>{result ? formatNumber(result.cap1) : '—'} <small>cal/°C</small></strong>
                </div>
              </div>
            </div>

            {/* O MEIO (CÂMARA DE EQUILÍBRIO TÉRMICO CENTRAL) */}
            <div className="equilibrium-center-chamber">
              <div className="heat-flow-banner">
                {isAlreadyEquilibrium ? (
                  <div className="heat-flow-status balanced">
                    <span>⚖️</span>
                    <span>Corpos na mesma temperatura (sem fluxo de calor líquido)</span>
                  </div>
                ) : isHeatFrom1to2 ? (
                  <div className="heat-flow-status flow-right">
                    <span className="flow-text">
                      O Corpo 1 cede calor para o Corpo 2 (T1 &gt; T2)
                    </span>
                    <div className="flow-particles-stream to-right" aria-hidden="true">
                      <span>•</span>
                      <span>•</span>
                      <span>•</span>
                      <span className="stream-arrow">→</span>
                    </div>
                  </div>
                ) : (
                  <div className="heat-flow-status flow-left">
                    <span className="flow-text">
                      O Corpo 2 cede calor para o Corpo 1 (T2 &gt; T1)
                    </span>
                    <div className="flow-particles-stream to-left" aria-hidden="true">
                      <span className="stream-arrow">←</span>
                      <span>•</span>
                      <span>•</span>
                      <span>•</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="teq-hero-card">
                <span className="teq-kicker">Temperatura de Equilíbrio</span>
                <div className="teq-number-box">
                  <span className="teq-val">
                    {result ? formatNumber(isSimulating ? simT1 + (simT2 - simT1) * 0.5 : result.equilibrium) : '—'}
                  </span>
                  <span className="teq-unit">°C</span>
                </div>
                {!result && !isSimulating && (
                  <span className="teq-kelvin">Clique no botão para calcular</span>
                )}
                {result && (
                  <span className="teq-kelvin">
                    = {formatNumber(result.equilibrium + 273.15)} K (Kelvin)
                  </span>
                )}

                <button
                  type="button"
                  className={`simulate-mix-btn ${isSimulating ? 'simulating' : ''}`}
                  onClick={runSimulation}
                  disabled={!canCalculate || isSimulating}
                  title="Calcular o equilíbrio térmico e simular a troca de calor"
                >
                  {isSimulating ? (
                    <>
                      <span className="sim-spinner" /> Equalizando... {simProgress}%
                    </>
                  ) : (
                    <>
                      <span>⚡</span> Calcular Equilíbrio Térmico
                    </>
                  )}
                </button>
              </div>

              {result && (
                <div className="dual-thermometer-display">
                  <div className="thermo-scale-labels">
                    <span className="scale-edge">{formatNumber(result.minTemp)} °C</span>
                    <span className="scale-center-tag">
                      Teq: {formatNumber(result.equilibrium)} °C
                    </span>
                    <span className="scale-edge">{formatNumber(result.maxTemp)} °C</span>
                  </div>

                  <div className="thermo-track-bg">
                    <div
                      className="thermo-pointer pointer-t1"
                      style={{
                        left: `${
                          result.maxTemp === result.minTemp
                            ? 50
                            : Math.max(0, Math.min(100, ((simT1 - result.minTemp) / (result.maxTemp - result.minTemp)) * 100))
                        }%`,
                      }}
                      title={`Corpo 1: ${formatNumber(simT1)} °C`}
                    >
                      <span className="pointer-label">T1: {formatNumber(simT1)}°</span>
                      <span className="pointer-dot dot-1" />
                    </div>

                    <div
                      className="thermo-pointer pointer-t2"
                      style={{
                        left: `${
                          result.maxTemp === result.minTemp
                            ? 50
                            : Math.max(0, Math.min(100, ((simT2 - result.minTemp) / (result.maxTemp - result.minTemp)) * 100))
                        }%`,
                      }}
                      title={`Corpo 2: ${formatNumber(simT2)} °C`}
                    >
                      <span className="pointer-label">T2: {formatNumber(simT2)}°</span>
                      <span className="pointer-dot dot-2" />
                    </div>

                    <div
                      className="thermo-teq-marker"
                      style={{ left: `${result.equilibriumPercentage}%` }}
                    />
                  </div>
                </div>
              )}

              {result && (
                <div className="energy-meter-card">
                  <div className="energy-metric-row">
                    <span>Calor Transferido (|Q|):</span>
                    <strong>
                      {formatNumber(result.heatExchanged)} cal
                      <small> ({formatNumber(result.heatExchanged * 4.18)} J)</small>
                    </strong>
                  </div>

                  <div className="energy-individual-rows">
                    <div className="individual-q">
                      <span>Corpo 1 ({substance1?.symbol}):</span>
                      <b className={result.q1 >= 0 ? 'positive' : 'negative'}>
                        Q1 = {formatNumber(result.q1)} cal
                      </b>
                      <small>
                        ({result.q1 > 0 ? `▲ aqueceu ${formatNumber(result.equilibrium - result.temp1)} °C` : result.q1 < 0 ? `▼ resfriou ${formatNumber(result.temp1 - result.equilibrium)} °C` : 'sem variação'})
                      </small>
                    </div>

                    <div className="individual-q">
                      <span>Corpo 2 ({substance2?.symbol}):</span>
                      <b className={result.q2 >= 0 ? 'positive' : 'negative'}>
                        Q2 = {formatNumber(result.q2)} cal
                      </b>
                      <small>
                        ({result.q2 > 0 ? `▲ aqueceu ${formatNumber(result.equilibrium - result.temp2)} °C` : result.q2 < 0 ? `▼ resfriou ${formatNumber(result.temp2 - result.equilibrium)} °C` : 'sem variação'})
                      </small>
                    </div>
                  </div>

                  <div className="energy-sum-verification">
                    <span>Princípio da Conservação de Energia:</span>
                    <span className="sum-tag">
                      Q1 + Q2 = {formatNumber(result.sum)} cal ≈ 0 cal ✓
                    </span>
                  </div>
                </div>
              )}

              {result && (
                <div className="capacity-insight-box">
                  <span className="insight-title">💡 Relação de Inércia Térmica:</span>
                  <p>
                    {result.cap1 > result.cap2
                      ? `Como o Corpo 1 possui maior capacidade térmica (C1 = ${formatNumber(result.cap1)} > C2 = ${formatNumber(result.cap2)} cal/°C), a temperatura final (Teq = ${formatNumber(result.equilibrium)} °C) fica muito mais próxima de T1 (${t1} °C).`
                      : result.cap2 > result.cap1
                        ? `Como o Corpo 2 possui maior capacidade térmica (C2 = ${formatNumber(result.cap2)} > C1 = ${formatNumber(result.cap1)} cal/°C), a temperatura final (Teq = ${formatNumber(result.equilibrium)} °C) fica muito mais próxima de T2 (${t2} °C).`
                        : `Ambos os corpos possuem capacidades térmicas idênticas (C1 = C2 = ${formatNumber(result.cap1)} cal/°C). Portanto, a temperatura de equilíbrio Teq é a média aritmética exata das temperaturas iniciais.`}
                  </p>
                </div>
              )}
            </div>

            {/* ESPAÇO 2 (CORPO 2 - DIREITA) */}
            <div
              className={`drop-slot-chamber slot-two ${dragOverSlot === 2 ? 'drag-over' : ''}`}
              onDragOver={(e) => handleDragOver(e, 2)}
              onDragLeave={() => handleDragLeave(2)}
              onDrop={(e) => handleDrop(e, 2)}
            >
              <div className="slot-chamber-header">
                <span className="slot-badge badge-2">Espaço 2 (Corpo B)</span>
                <span className="drop-hint-text">
                  {dragOverSlot === 2 ? 'Solte aqui!' : 'Arraste ou escolha na paleta'}
                </span>
              </div>

              <div
                className="active-element-card slot-2-active"
                style={{ borderLeftColor: substance2?.color || '#ff6f43' }}
              >
                <div
                  className="active-element-avatar"
                  style={{
                    backgroundColor: `${substance2?.color || '#ff6f43'}26`,
                    color: substance2?.color || '#ff6f43',
                  }}
                >
                  {substance2?.symbol || 'B'}
                </div>
                <div className="active-element-details">
                  <span className="active-element-title" title={substance2?.name}>{substance2?.name || 'Personalizado'}</span>
                  <div className="active-element-badges">
                    <span className="active-c-tag">
                      c2 = <strong>{effectiveC2}</strong> cal/g·°C
                    </span>
                    <span className="active-cat-tag">{substance2?.category || 'Material'}</span>
                  </div>
                </div>
              </div>

              <div className="slot-inputs-grid">
                <div className="slot-input-group">
                  <label htmlFor="m2-input">Massa Inicial (m2):</label>
                  <div className="slot-input-field">
                    <input
                      id="m2-input"
                      type="text"
                      inputMode="decimal"
                      value={m2}
                      onChange={(e) => setM2(e.target.value)}
                      placeholder="ex.: 100"
                    />
                    <span className="slot-unit">g</span>
                  </div>
                  <div className="quick-values-row">
                    {['50', '100', '200', '500'].map((presetM) => (
                      <button
                        key={presetM}
                        type="button"
                        className={`mini-chip ${m2 === presetM ? 'active' : ''}`}
                        onClick={() => setM2(presetM)}
                      >
                        {presetM}g
                      </button>
                    ))}
                  </div>
                </div>

                <div className="slot-input-group">
                  <label htmlFor="t2-input">Temperatura Inicial (T2):</label>
                  <div className="slot-input-field">
                    <input
                      id="t2-input"
                      type="text"
                      inputMode="decimal"
                      value={t2}
                      onChange={(e) => setT2(e.target.value)}
                      placeholder="ex.: 80"
                    />
                    <span className="slot-unit">°C</span>
                  </div>
                  <div className="quick-values-row">
                    {[
                      { val: '10', label: '10° (fria)' },
                      { val: '25', label: '25° (amb.)' },
                      { val: '80', label: '80° (quente)' },
                      { val: '150', label: '150° (muito quente)' },
                    ].map((p) => (
                      <button
                        key={p.val}
                        type="button"
                        className={`mini-chip ${t2 === p.val ? 'active' : ''}`}
                        onClick={() => setT2(p.val)}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div
                  className={`thermal-state-pill ${
                    t2Num > 60 ? 'hot' : t2Num < 20 ? 'cold' : 'ambient'
                  }`}
                >
                  <span className="thermal-indicator-dot" />
                  <span>
                    Estado térmico: {t2Num > 60 ? 'Aquecido / Quente' : t2Num < 20 ? 'Resfriado / Frio' : 'Temperatura Moderada'}
                  </span>
                  <span className="thermal-dynamic-temp">
                    {isSimulating ? `~ ${formatNumber(simT2)} °C` : `${t2} °C`}
                  </span>
                </div>

                <div className="slot-capacity-pill">
                  <span>Capacidade Térmica C2 (m2 · c2):</span>
                  <strong>{result ? formatNumber(result.cap2) : '—'} <small>cal/°C</small></strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* PAINEL DE DEMONSTRAÇÃO MATEMÁTICA */}
      <div className="equilibrium-math-panel panel">
        <div className="panel-heading">
          <div>
            <span className="panel-kicker">Resolução Algébrica Detalhada</span>
            <h3>Demonstração Física Passo a Passo</h3>
            <p className="helper-text">
              Desenvolvimento passo a passo da equação das trocas de calor para trabalhos e provas escolares.
            </p>
          </div>
          {result && (
            <button
              type="button"
              className="copy-btn copy-full-btn"
              onClick={copyResolution}
              title="Copiar texto completo formatado para relatórios"
            >
              {copied ? '✓ Resolução Copiada!' : '📋 Copiar Resolução Completa'}
            </button>
          )}
        </div>

        {result ? (
          <div className="steps-list">
            {steps.map((step, idx) => (
              <div key={idx} className="step-row">
                <span className="step-badge">{idx + 1}</span>
                <span className="step-text">{step}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="helper-text">
            Preencha massa (&gt; 0) e temperatura nos dois compartimentos e clique em “Calcular Equilíbrio Térmico” para gerar a dedução.
          </p>
        )}
      </div>
    </section>
  )
}
