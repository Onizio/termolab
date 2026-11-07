import React, { useEffect, useMemo, useState } from 'react'
import { TABELA_SUBSTANCIAS } from './data/substancias'
import {
  calculationSteps,
  convertHeat,
  convertMass,
  convertSpecificHeat,
  equivalentHeats,
  formatCalculatorNumber,
  formatInputValue,
  formatFullResolutionText,
  parseNumber,
  solveHeat,
} from './lib/calorimetria'
import Field from './components/Field'
import TabelaMateriais from './components/TabelaMateriais'
import ComoFunciona from './components/ComoFunciona'
import EquilibrioTermico from './components/EquilibrioTermico'
import CombustaoEtanol from './components/CombustaoEtanol'
import CompararSubstancias from './components/CompararSubstancias'
import IlustracaoCalorimetria from './components/IlustracaoCalorimetria'
import HeaderTabfolio from './components/HeaderTabfolio'

const LABELS = {
  q: 'Calor (Q)',
  m: 'Massa (m)',
  c: 'Calor específico (c)',
  deltaT: 'Variação térmica (ΔT)',
}

const PRESETS = [
  {
    name: 'Aquecer 200 g de água (+25 °C)',
    unknown: 'q',
    values: { q: '', m: '200', c: '1', deltaT: '25' },
    qUnit: 'cal',
    mUnit: 'g',
    cUnit: 'cal/g·°C',
    material: 'Água (líquida)',
  },
  {
    name: 'Ferver 1 kg de água de 20 °C a 100 °C (em kJ)',
    unknown: 'q',
    values: { q: '', m: '1', c: '4,18', deltaT: '80' },
    qUnit: 'kJ',
    mUnit: 'kg',
    cUnit: 'J/g·°C',
    material: 'Água (líquida)',
  },
  {
    name: 'Identificar metal: 500 g aquecido com 1.100 cal (ΔT = 20 °C)',
    unknown: 'c',
    values: { q: '1100', m: '500', c: '', deltaT: '20' },
    qUnit: 'cal',
    mUnit: 'g',
    cUnit: 'cal/g·°C',
    material: 'Personalizado',
  },
  {
    name: 'Esfriar 150 g de alumínio (−30 °C)',
    unknown: 'q',
    values: { q: '', m: '150', c: '0,22', deltaT: '-30' },
    qUnit: 'cal',
    mUnit: 'g',
    cUnit: 'cal/g·°C',
    material: 'Alumínio',
  },
  {
    name: 'Aquecer 50 g de ouro (+80 °C)',
    unknown: 'q',
    values: { q: '', m: '50', c: '0,031', deltaT: '80' },
    qUnit: 'cal',
    mUnit: 'g',
    cUnit: 'cal/g·°C',
    material: 'Ouro',
  },
]

const SUPERSCRIPT_CHARACTERS = {
  '⁰': '0',
  '¹': '1',
  '²': '2',
  '³': '3',
  '⁴': '4',
  '⁵': '5',
  '⁶': '6',
  '⁷': '7',
  '⁸': '8',
  '⁹': '9',
  '⁺': '+',
  '⁻': '-',
}

function renderScientificText(text) {
  if (typeof text !== 'string') return text
  const expression = /([−-]?\d+(?:,\d+)?)\s*([·•×*])\s*10([⁺⁻]?[⁰¹²³⁴⁵⁶⁷⁸⁹]+)/gu
  const parts = []
  let cursor = 0

  for (const match of text.matchAll(expression)) {
    if (match.index > cursor) {
      parts.push(text.slice(cursor, match.index))
    }
    const exponent = [...match[3]]
      .map((character) => SUPERSCRIPT_CHARACTERS[character] ?? character)
      .join('')
    parts.push(
      <span key={match.index} className="scientific-notation">
        <span className="scientific-mantissa">{match[1]}</span>
        <span className="scientific-dot" aria-hidden="true"> {match[2]} </span>
        <span className="scientific-base">10</span>
        <sup className="scientific-exponent">{exponent}</sup>
      </span>,
    )
    cursor = match.index + match[0].length
  }

  if (cursor < text.length) {
    parts.push(text.slice(cursor))
  }
  return parts.length > 0 ? parts : text
}

function renderCalculatorNumber(value) {
  return renderScientificText(formatCalculatorNumber(value))
}

function App() {
  const [unknown, setUnknown] = useState('q')
  const [qUnit, setQUnit] = useState('cal')
  const [mUnit, setMUnit] = useState('g')
  const [cUnit, setCUnit] = useState('cal/g·°C')
  const [values, setValues] = useState({ q: '', m: '200', c: '1', deltaT: '25' })
  const [material, setMaterial] = useState('Água (líquida)')
  const [activeTab, setActiveTab] = useState('calculadora')
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('termolab_theme')
      if (saved) return saved === 'dark'
      return window.matchMedia?.('(prefers-color-scheme: dark)').matches || false
    }
    return false
  })
  const [copied, setCopied] = useState(false)
  const [copiedFull, setCopiedFull] = useState(false)

  useEffect(() => {
    const root = document.documentElement
    const body = document.body
    if (darkMode) {
      root.classList.add('dark-mode')
      body.classList.add('dark-mode')
      body.style.backgroundColor = '#0d1114'
      const meta = document.querySelector('meta[name="theme-color"]')
      if (meta) meta.setAttribute('content', '#0d1114')
      try {
        localStorage.setItem('termolab_theme', 'dark')
      } catch (err) {
        console.warn('localStorage access error:', err)
      }
    } else {
      root.classList.remove('dark-mode')
      body.classList.remove('dark-mode')
      body.style.backgroundColor = '#f8f5ef'
      const meta = document.querySelector('meta[name="theme-color"]')
      if (meta) meta.setAttribute('content', '#f8f5ef')
      try {
        localStorage.setItem('termolab_theme', 'light')
      } catch (err) {
        console.warn('localStorage access error:', err)
      }
    }
  }, [darkMode])

  // Normalização precisa das grandezas para a unidade de cálculo (cal, g, cal/g·°C, °C)
  const result = useMemo(() => {
    const qNum = parseNumber(values.q)
    const mNum = parseNumber(values.m)
    const cNum = parseNumber(values.c)
    const dtNum = parseNumber(values.deltaT)

    const qInCal = qNum === null ? '' : String(convertHeat(qNum, qUnit, 'cal'))
    const mInG = mNum === null ? '' : String(convertMass(mNum, mUnit, 'g'))
    const cInCal = cNum === null ? '' : String(convertSpecificHeat(cNum, cUnit, 'cal/g·°C'))
    const dtInC = dtNum === null ? '' : String(dtNum)

    return solveHeat({
      unknown,
      q: unknown === 'q' ? '' : qInCal,
      m: unknown === 'm' ? '' : mInG,
      c: unknown === 'c' ? '' : cInCal,
      deltaT: unknown === 'deltaT' ? '' : dtInC,
    })
  }, [unknown, values, qUnit, mUnit, cUnit])

  // Conversão do resultado da base para a unidade selecionada
  const resultValue = useMemo(() => {
    if (result.status !== 'ok') return null
    if (unknown === 'q') return convertHeat(result.result, 'cal', qUnit)
    if (unknown === 'm') return convertMass(result.result, 'g', mUnit)
    if (unknown === 'c') return convertSpecificHeat(result.result, 'cal/g·°C', cUnit)
    return result.result
  }, [result, unknown, qUnit, mUnit, cUnit])

  const updateValue = (field, value) => {
    setValues((prev) => ({ ...prev, [field]: value }))
  }

  const chooseUnknown = (next) => {
    setValues((old) => ({
      ...old,
      [unknown]: resultValue === null ? '' : formatInputValue(resultValue),
      [next]: '',
    }))
    setUnknown(next)
  }

  const chooseMaterial = (name) => {
    setMaterial(name)
    const item = TABELA_SUBSTANCIAS.find((entry) => entry.name === name)
    if (item) {
      const val = cUnit === 'cal/g·°C' ? item.value : item.valueJ
      updateValue('c', formatInputValue(val))
    }
  }

  const handleQUnitChange = (nextUnit) => {
    const qNum = parseNumber(values.q)
    if (qNum !== null) {
      const converted = convertHeat(qNum, qUnit, nextUnit)
      updateValue('q', formatInputValue(converted))
    }
    setQUnit(nextUnit)
  }

  const handleMUnitChange = (nextUnit) => {
    const mNum = parseNumber(values.m)
    if (mNum !== null) {
      const converted = convertMass(mNum, mUnit, nextUnit)
      updateValue('m', formatInputValue(converted))
    }
    setMUnit(nextUnit)
  }

  const handleCUnitChange = (nextUnit) => {
    if (material !== 'Personalizado') {
      const item = TABELA_SUBSTANCIAS.find((entry) => entry.name === material)
      if (item) {
        const val = nextUnit === 'cal/g·°C' ? item.value : item.valueJ
        updateValue('c', formatInputValue(val))
      }
    } else {
      const cNum = parseNumber(values.c)
      if (cNum !== null) {
        const converted = convertSpecificHeat(cNum, cUnit, nextUnit)
        updateValue('c', formatInputValue(converted))
      }
    }
    setCUnit(nextUnit)
  }

  const applyPreset = (preset) => {
    setUnknown(preset.unknown)
    setQUnit(preset.qUnit)
    setMUnit(preset.mUnit)
    setCUnit(preset.cUnit)
    setValues(preset.values)
    setMaterial(preset.material)
  }

  const clearFields = () => {
    setValues({ q: '', m: '', c: '', deltaT: '' })
    setMaterial('Personalizado')
  }

  const copyResultToClipboard = () => {
    if (resultValue === null) return
    const unit = unknown === 'q' ? qUnit : unknown === 'm' ? mUnit : unknown === 'c' ? cUnit : '°C'
    const sym = unknown === 'deltaT' ? 'ΔT' : unknown === 'q' ? 'Q' : unknown
    const text = `${sym} = ${formatCalculatorNumber(resultValue)} ${unit}`
    navigator.clipboard?.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const copyFullResolution = () => {
    if (resultValue === null) return
    const text = formatFullResolutionText({
      unknown,
      values,
      result: resultValue,
      qUnit,
      mUnit,
      cUnit,
      material: material !== 'Personalizado' ? material : undefined,
      formatValue: formatCalculatorNumber,
    })
    navigator.clipboard?.writeText(text)
    setCopiedFull(true)
    setTimeout(() => setCopiedFull(false), 2200)
  }

  const steps = calculationSteps({
    unknown,
    values,
    result: resultValue,
    qUnit,
    mUnit,
    cUnit,
    formatValue: formatCalculatorNumber,
  })

  // Equivalências de calor (em cal, kcal, J, kJ)
  const equivalences = useMemo(() => {
    if (unknown === 'q' && result.status === 'ok') {
      return equivalentHeats(result.result)
    }
    const qNum = parseNumber(values.q)
    if (qNum !== null) {
      const qInCal = convertHeat(qNum, qUnit, 'cal')
      return equivalentHeats(qInCal)
    }
    return null
  }, [unknown, result, values.q, qUnit])

  // Combinação com tabela de substâncias quando a incógnita é c
  const matchedSubstance = useMemo(() => {
    if (unknown !== 'c' || result.status !== 'ok') return null
    const cValInCal = result.result
    return TABELA_SUBSTANCIAS.find((item) => Math.abs(item.value - cValInCal) / item.value <= 0.05)
  }, [unknown, result])

  const resultSign = useMemo(() => {
    if (unknown === 'q' && resultValue !== null) return Math.sign(resultValue)
    const qNum = parseNumber(values.q)
    if (qNum !== null) return Math.sign(qNum)
    const dtNum = parseNumber(values.deltaT)
    if (dtNum !== null) return Math.sign(dtNum)
    return 0
  }, [unknown, resultValue, values.q, values.deltaT])

  return (
    <div className={darkMode ? 'app-shell dark-mode' : 'app-shell'}>
      {/* CABEÇALHO DESKTOP ESTILO TABFOLIO + MOBILE DOCK */}
      <HeaderTabfolio
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        darkMode={darkMode}
        onToggleTheme={() => setDarkMode((current) => !current)}
      />

      <main id="inicio" data-active-tool={activeTab}>
        {/* HERO SECTION */}
        <section className="hero">
          <div className="hero-copy">
            <div className="eyebrow">✦ laboratório virtual de termoquímica</div>
            <h1>
              O calor está<br />{' '}
              <em>em movimento.</em>
            </h1>
            <p>
              Explore a relação entre massa, calor específico e temperatura.<br />
              Calcule <strong>Q = m·c·ΔT</strong> e simule trocas térmicas para comparar materiais.
            </p>

            {/* FÓRMULA LIMPA (SEM LEGENDAS INFERIORES) */}
            <div className="formula-chip" role="region" aria-label="Equação fundamental da calorimetria">
              <button
                type="button"
                className="formula-term"
                title="Q = Quantidade de Calor (clique para calcular Q)"
                onClick={() => {
                  setUnknown('q')
                  setActiveTab('calculadora')
                }}
              >
                <span>Q</span>
              </button>
              <b className="formula-op">=</b>
              <button
                type="button"
                className="formula-term"
                title="m = Massa da amostra (clique para calcular m)"
                onClick={() => {
                  setUnknown('m')
                  setActiveTab('calculadora')
                }}
              >
                <span>m</span>
              </button>
              <b className="formula-op">·</b>
              <button
                type="button"
                className="formula-term"
                title="c = Calor específico (clique para ver tabela de calores)"
                onClick={() => setActiveTab('tabela')}
              >
                <span>c</span>
              </button>
              <b className="formula-op">·</b>
              <button
                type="button"
                className="formula-term"
                title="ΔT = Variação de temperatura (clique para calcular ΔT)"
                onClick={() => {
                  setUnknown('deltaT')
                  setActiveTab('calculadora')
                }}
              >
                <span>ΔT</span>
              </button>
            </div>

            <a
              href="#ferramenta-ativa"
              className="mobile-jump-btn"
              onClick={(e) => {
                e.preventDefault()
                const el = document.getElementById('ferramenta-ativa')
                if (el) {
                  el.scrollIntoView({ behavior: 'smooth', block: 'start' })
                }
              }}
            >
              Acessar Ferramenta Ativa ↓
            </a>
          </div>

          <div className="hero-visual" aria-hidden="true">
            <div className="orbital orbital-one" />
            <div className="orbital orbital-two" />
            <div className="atom-core">Q</div>
            <span className="particle p1">+</span>
            <span className="particle p2">−</span>
            <span className="particle p3">·</span>
            <span className="particle p4">+</span>
          </div>
        </section>

        {/* MARCADOR DE FOCO PARA ROLAGEM MÓVEL */}
        <div id="ferramenta-ativa" />

        {/* ABA: CALCULADORA */}
        {activeTab === 'calculadora' && (
          <section className="workbench">
            <div className="section-intro">
              <div>
                <div className="eyebrow">01 / simulação fundamental</div>
                <h2>Calculadora de Calorimetria</h2>
              </div>
              <p>Escolha a incógnita desejada e acompanhe o isolamento algébrico e a resolução passo a passo.</p>
            </div>

            {/* CARDS DE DESTAQUE TERMODINÂMICO (HERO STATS) */}
            <div className="table-hero-stats">
              <div className="hero-stat-card high-capacity">
                <div className="stat-card-badge">🔥 Calor Sensível (Q)</div>
                <div className="stat-card-value">{resultValue !== null && unknown === 'q' ? renderCalculatorNumber(resultValue) : 'Q = m·c·ΔT'} <small>{unknown === 'q' ? qUnit : ''}</small></div>
                <div className="stat-card-name">Energia Térmica em Trânsito</div>
                <p className="stat-card-desc">
                  Transferência de calor motivada exclusivamente pela diferença de temperatura entre corpos.
                </p>
              </div>

              <div className="hero-stat-card low-capacity">
                <div className="stat-card-badge">💧 Referência da Água</div>
                <div className="stat-card-value">1,00 <small>cal/g·°C</small></div>
                <div className="stat-card-name">4,18 J/g·°C (Padrão SI)</div>
                <p className="stat-card-desc">
                  Padrão do Ensino Médio brasileiro: a água exige 1 caloria para elevar 1 g em 1 °C.
                </p>
              </div>

              <div className="hero-stat-card count-capacity">
                <div className="stat-card-badge">🎯 Incógnita Ativa</div>
                <div className="stat-card-value">{unknown === 'deltaT' ? 'ΔT' : unknown === 'q' ? 'Q' : unknown}</div>
                <div className="stat-card-name">Isolamento Algébrico</div>
                <p className="stat-card-desc">
                  Alterne livremente a grandeza desejada com conversão instantânea de unidades (cal, J, g, kg).
                </p>
              </div>
            </div>

            {/* PRESETS DE ESTUDO */}
            <div className="presets-bar">
              <span className="presets-label">Exemplos rápidos:</span>
              <div className="presets-chips">
                {PRESETS.map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    className="preset-chip"
                    onClick={() => applyPreset(preset)}
                  >
                    {preset.name}
                  </button>
                ))}
                <button
                  type="button"
                  className="preset-chip clear-chip"
                  onClick={clearFields}
                  title="Limpar campos"
                >
                  ✕ Limpar
                </button>
              </div>
            </div>

            {/* ILUSTRA��O DO FEN�MENO T�RMICO */}
            <IlustracaoCalorimetria
              material={material}
              values={values}
              resultValue={resultValue}
              unknown={unknown}
              qUnit={qUnit}
              mUnit={mUnit}
              cUnit={cUnit}
              formatValue={renderCalculatorNumber}
            />

            <div className="calculator-grid">
              {/* PAINEL DE ENTRADAS */}
              <div className="panel inputs-panel">
                <div className="panel-heading">
                  <div>
                    <span className="panel-kicker">Etapa 1 de 3</span>
                    <h3>O que você deseja calcular?</h3>
                    <p className="helper-text">A incógnita fica destacada e é calculada automaticamente.</p>
                  </div>
                  <span className="step-number">01</span>
                </div>

                <div className="unknown-grid">
                  {Object.entries(LABELS).map(([key, label]) => (
                    <button
                      key={key}
                      type="button"
                      aria-pressed={unknown === key}
                      className={unknown === key ? 'unknown-option selected' : 'unknown-option'}
                      onClick={() => chooseUnknown(key)}
                    >
                      <span>{key === 'deltaT' ? 'ΔT' : key === 'q' ? 'Q' : key}</span>
                      <small>{label}</small>
                    </button>
                  ))}
                </div>

                <div className="panel-heading second">
                  <div>
                    <span className="panel-kicker">Etapa 2 de 3</span>
                    <h3>Preencha os dados conhecidos</h3>
                    <p className="helper-text">Aceita vírgula ou ponto decimal. Valores negativos são aceitos em Q e ΔT.</p>
                  </div>
                  <span className="step-number">02</span>
                </div>

                <div className="fields-grid">
                  <Field
                    id="q"
                    label="Calor (Q)"
                    symbol="Q"
                    value={values.q}
                    disabled={unknown === 'q'}
                    placeholder={unknown === 'q' ? 'será calculado' : 'ex.: 500'}
                    onChange={(v) => updateValue('q', v)}
                    suffix={qUnit}
                  />
                  <Field
                    id="m"
                    label="Massa (m)"
                    symbol="m"
                    value={values.m}
                    disabled={unknown === 'm'}
                    placeholder={unknown === 'm' ? 'será calculado' : 'ex.: 200'}
                    onChange={(v) => updateValue('m', v)}
                    suffix={mUnit}
                  />
                  <Field
                    id="c"
                    label="Calor específico (c)"
                    symbol="c"
                    value={values.c}
                    disabled={unknown === 'c'}
                    placeholder={unknown === 'c' ? 'será calculado' : 'ex.: 1'}
                    onChange={(v) => {
                      updateValue('c', v)
                      setMaterial('Personalizado')
                    }}
                    suffix={cUnit}
                  />
                  <Field
                    id="deltaT"
                    label="Variação térmica (ΔT)"
                    symbol="ΔT"
                    value={values.deltaT}
                    disabled={unknown === 'deltaT'}
                    placeholder={unknown === 'deltaT' ? 'será calculado' : 'ex.: 25'}
                    onChange={(v) => updateValue('deltaT', v)}
                    suffix="°C"
                  />
                </div>

                <div className="unit-options-bar">
                  <div className="unit-group">
                    <label htmlFor="q-unit-select">Unidade de Q:</label>
                    <select
                      id="q-unit-select"
                      value={qUnit}
                      onChange={(e) => handleQUnitChange(e.target.value)}
                    >
                      <option value="cal">cal (calorias)</option>
                      <option value="kcal">kcal (quilocalorias)</option>
                      <option value="J">J (Joules)</option>
                      <option value="kJ">kJ (quiloJoules)</option>
                    </select>
                  </div>

                  <div className="unit-group">
                    <label htmlFor="m-unit-select">Unidade de m:</label>
                    <select
                      id="m-unit-select"
                      value={mUnit}
                      onChange={(e) => handleMUnitChange(e.target.value)}
                    >
                      <option value="g">g (gramas)</option>
                      <option value="kg">kg (quilogramas)</option>
                    </select>
                  </div>

                  <div className="unit-group">
                    <label htmlFor="c-unit-select">Unidade de c:</label>
                    <select
                      id="c-unit-select"
                      value={cUnit}
                      onChange={(e) => handleCUnitChange(e.target.value)}
                    >
                      <option value="cal/g·°C">cal/g·°C</option>
                      <option value="J/g·°C">J/g·°C (SI)</option>
                    </select>
                  </div>
                </div>

                <div className="material-row">
                  <label htmlFor="material-select">Atalho de Material:</label>
                  <select
                    id="material-select"
                    value={material}
                    onChange={(event) => chooseMaterial(event.target.value)}
                  >
                    <option>Personalizado</option>
                    {TABELA_SUBSTANCIAS.map((item) => (
                      <option key={item.name} value={item.name}>
                        {item.name} ({item.symbol})
                      </option>
                    ))}
                  </select>
                  <span className="material-value">
                    c = {material === 'Personalizado' ? '—' : (
                      cUnit === 'cal/g·°C'
                          ? renderCalculatorNumber(TABELA_SUBSTANCIAS.find((item) => item.name === material)?.value)
                          : renderCalculatorNumber(TABELA_SUBSTANCIAS.find((item) => item.name === material)?.valueJ)
                    )} {cUnit}
                  </span>
                </div>
              </div>

              {/* PAINEL DE RESULTADOS */}
              <div className="panel result-panel" aria-live="polite">
                <div className="result-top">
                  <div>
                    <span className="panel-kicker">Etapa 3 de 3</span>
                    <h3 className="result-heading">Resultado da Incógnita</h3>
                  </div>
                  <div className="result-actions-top">
                    {resultValue !== null && (
                      <>
                        <button
                          type="button"
                          className="copy-btn"
                          onClick={copyResultToClipboard}
                          title="Copiar apenas o valor final"
                        >
                          {copied ? '✓ Copiado!' : '📋 Copiar'}
                        </button>
                        <button
                          type="button"
                          className="copy-btn copy-full-btn"
                          onClick={copyFullResolution}
                          title="Copiar resolução completa para relatórios e tarefas"
                        >
                          {copiedFull ? '✓ Resolução Copiada!' : '📄 Copiar Resolução'}
                        </button>
                      </>
                    )}
                    <span className="live-dot">
                      <i /> ao vivo
                    </span>
                  </div>
                </div>

                <div className="result-value">
                  {resultValue !== null ? renderCalculatorNumber(resultValue) : '—'}
                  <small>
                    {resultValue !== null
                      ? unknown === 'q'
                        ? qUnit
                        : unknown === 'm'
                          ? mUnit
                          : unknown === 'c'
                            ? cUnit
                            : '°C'
                      : ''}
                  </small>
                </div>

                <div className="result-caption">
                  {result.status === 'ok' ? (
                    <>
                      <strong>{unknown === 'deltaT' ? 'ΔT' : unknown === 'q' ? 'Q' : unknown}</strong> ={' '}
                      {renderCalculatorNumber(resultValue)}{' '}
                      {unknown === 'q' ? qUnit : unknown === 'm' ? mUnit : unknown === 'c' ? cUnit : '°C'}
                      {(unknown === 'q' || unknown === 'deltaT') && (
                        <div className="result-nature">
                          <span className={resultSign > 0 ? 'positive' : resultSign < 0 ? 'negative' : ''}>
                            ● {resultSign > 0
                              ? 'Processo endotérmico: calor absorvido (aquecimento)'
                              : resultSign < 0
                                ? 'Processo exotérmico: calor liberado (resfriamento)'
                                : 'Sem variação de temperatura (equilíbrio / sem calor trocado)'}
                          </span>
                        </div>
                      )}
                    </>
                  ) : (
                    <span className="incomplete-msg">
                      {result.message || 'Preencha os campos ao lado para calcular.'}
                    </span>
                  )}
                </div>

                {equivalences && (
                  <div className="equivalences-card">
                    <span className="equiv-title">Equivalências Energéticas:</span>
                    <div className="equiv-tags">
                      <span>{renderCalculatorNumber(equivalences.cal)} cal</span>
                      <span>=</span>
                      <span>{renderCalculatorNumber(equivalences.kcal)} kcal</span>
                      <span>=</span>
                      <span>{renderCalculatorNumber(equivalences.J)} J</span>
                      <span>=</span>
                      <span>{renderCalculatorNumber(equivalences.kJ)} kJ</span>
                    </div>
                  </div>
                )}

                <div className="divider" />

                <div className="calculation">
                  <span className="panel-kicker">Resolução Algébrica Passo a Passo</span>
                  <div className="steps-list">
                    {steps.map((step, index) => (
                      <div key={index} className="step-row">
                        <span className="step-badge">{index + 1}</span>
                        <span className="step-text">{renderScientificText(step)}</span>
                      </div>
                    ))}
                  </div>

                  {unknown === 'c' && result.status === 'ok' && (
                    <div className="match-substance-box">
                      {matchedSubstance ? (
                        <span>
                          🎯 <strong>Compatibilidade:</strong> O calor específico obtido aproxima-se de{' '}
                          <strong>{matchedSubstance.name}</strong> ({matchedSubstance.value} cal/g·°C / {matchedSubstance.valueJ} J/g·°C).
                        </span>
                      ) : (
                        <span>
                          ℹ️ O valor obtido não corresponde com tolerância de ±5% a nenhum material da tabela padrão.
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* OUTRAS ABAS */}
        {activeTab === 'equilibrio' && <EquilibrioTermico />}
        {activeTab === 'combustao' && <CombustaoEtanol />}
        {activeTab === 'comparar' && <CompararSubstancias />}
        {activeTab === 'tabela' && (
          <TabelaMateriais
            onSelectMaterial={(name) => {
              chooseMaterial(name)
              setActiveTab('calculadora')
            }}
          />
        )}
        {activeTab === 'guia' && <ComoFunciona />}
      </main>

      {/* RODAPÉ */}
      <footer>
        <div className="footer-brand">
          <span className="brand-mark">◒</span>
          <span>
            termo<span>lab</span>
          </span>
        </div>
        <span>Laboratório Virtual e Didático de Calorimetria &amp; Termoquímica.</span>
        <span>
          Baseado no Capítulo 14 de Química — Termoquímica. Adota 1 cal = 4,18 J.
        </span>
      </footer>
    </div>
  )
}

export default App
