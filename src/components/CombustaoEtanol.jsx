import React, { useMemo, useState } from 'react'
import { COMBUSTIVEIS } from '../data/substancias'
import { ethanolCombustion, formatNumber } from '../lib/calorimetria'
import Field from './Field'
import BancadaCombustao from './BancadaCombustao'

const COMBUSTION_PRESETS = [
  {
    name: 'Experimento Padrão de Etanol (100 g de água, 2,5 g queimados)',
    values: {
      waterMass: '100',
      initialTemp: '25',
      finalTemp: '52',
      lampBefore: '150',
      lampAfter: '147,5',
      fuelId: 'etanol',
      beakerMass: '0',
    },
  },
  {
    name: 'Com Béquer de Vidro Considerado (50 g de vidro)',
    values: {
      waterMass: '150',
      initialTemp: '22',
      finalTemp: '48',
      lampBefore: '140',
      lampAfter: '137,2',
      fuelId: 'etanol',
      beakerMass: '50',
    },
  },
  {
    name: 'Queima com Metanol (32 g/mol)',
    values: {
      waterMass: '100',
      initialTemp: '20',
      finalTemp: '45',
      lampBefore: '120',
      lampAfter: '117,8',
      fuelId: 'metanol',
      beakerMass: '0',
    },
  },
]

export default function CombustaoEtanol() {
  const [values, setValues] = useState({
    waterMass: '100',
    initialTemp: '25',
    finalTemp: '52',
    lampBefore: '150',
    lampAfter: '147,5',
    fuelId: 'etanol',
    beakerMass: '0',
  })
  const [includeBeaker, setIncludeBeaker] = useState(false)
  const [copied, setCopied] = useState(false)

  const result = useMemo(
    () =>
      ethanolCombustion({
        ...values,
        beakerMass: includeBeaker ? values.beakerMass : 0,
        beakerC: 0.2,
      }),
    [values, includeBeaker],
  )

  const selectedFuel = COMBUSTIVEIS.find((c) => c.id === values.fuelId) || COMBUSTIVEIS[0]

  const update = (key, value) => {
    setValues((old) => ({ ...old, [key]: value }))
  }

  const applyPreset = (p) => {
    setValues(p.values)
    setIncludeBeaker(Number(p.values.beakerMass) > 0)
  }

  const copyCombustionReport = () => {
    if (!result || result.error) return
    const text = [
      '=========================================',
      `  TermoLab — Experimento de Calorimetria (${selectedFuel.name})`,
      '=========================================',
      `Combustível: ${selectedFuel.formula} (${selectedFuel.molarMass} g/mol)`,
      `Equação: ${selectedFuel.equation}`,
      '-----------------------------------------',
      'Dados Coletados:',
      `  Massa de água: ${values.waterMass} g`,
      `  Temperatura da água: ${values.initialTemp} °C ⟹ ${values.finalTemp} °C (ΔT = +${formatNumber(result.deltaT)} °C)`,
      `  Massa da lamparina: ${values.lampBefore} g ⟹ ${values.lampAfter} g`,
      `  Combustível consumido (Δm): ${formatNumber(result.burned)} g`,
      includeBeaker ? `  Massa do béquer de vidro (c = 0,20 cal/g·°C): ${values.beakerMass} g` : null,
      '-----------------------------------------',
      'Resultados Obtidos:',
      `  Calor útil absorvido pela água: ${formatNumber(result.waterHeat)} cal`,
      includeBeaker ? `  Calor absorvido pelo vidro: ${formatNumber(result.beakerHeat)} cal` : null,
      `  Calor total capturado: ${formatNumber(result.heat)} cal`,
      `  Poder calorífico experimental: ${formatNumber(result.calPerGram)} cal/g`,
      `  Entalpia Molar Experimental: ΔH = −${formatNumber(result.kcalPerMol)} kcal/mol (−${formatNumber(result.kJPerMol)} kJ/mol)`,
      `  Entalpia Te�rica Completa: ?H_teor = -${formatNumber(result.theoreticalKcal)} kcal/mol (-${formatNumber(result.theoreticalKJ)} kJ/mol)`,
      `  Rendimento T�rmico �til: ${formatNumber(result.efficiency)}%`,
      `  Energia Dissipada no Ambiente: ${formatNumber(Math.max(0, 100 - result.efficiency))}%`,
      '=========================================',
    ]
      .filter(Boolean)
      .join('\n')

    navigator.clipboard?.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2200)
  }

  return (
    <section className="content-section extra-section">
      <div className="section-intro">
        <div>
          <div className="eyebrow">05 / experimento prático</div>
          <h2>Combustão de Combustíveis (Calorimetria)</h2>
        </div>
        <p>
          Meça a energia térmica transferida da chama de uma lamparina para uma massa de água em bancada de laboratório.
        </p>
      </div>

      {/* PRESETS DE EXPERIMENTO */}
      <div className="presets-bar">
        <span className="presets-label">Configurações experimentais:</span>
        <div className="presets-chips">
          {COMBUSTION_PRESETS.map((p) => (
            <button
              key={p.name}
              type="button"
              className="preset-chip"
              onClick={() => applyPreset(p)}
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      <BancadaCombustao
        waterMass={values.waterMass}
        initialTemp={values.initialTemp}
        finalTemp={values.finalTemp}
        lampBefore={values.lampBefore}
        lampAfter={values.lampAfter}
        fuelName={selectedFuel.name}
        fuelFormula={selectedFuel.formula}
        burnedMass={result?.burned ?? 2.5}
        efficiency={result?.efficiency ?? 0}
        heat={result?.heat ?? 0}
        includeBeaker={includeBeaker}
        beakerMass={values.beakerMass}
      />

      <div className="two-column">
        <div className="panel inputs-panel">
          <div className="panel-heading">
            <div>
              <span className="panel-kicker">Parâmetros do Experimento</span>
              <h3>Béquer e Lamparina</h3>
            </div>
          </div>

          {/* SELETOR DE COMBUSTÍVEL */}
          <div className="fuel-selector-row">
            <label htmlFor="fuel-select">Combustível Utilizado:</label>
            <select
              id="fuel-select"
              value={values.fuelId}
              onChange={(e) => update('fuelId', e.target.value)}
            >
              {COMBUSTIVEIS.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.formula})
                </option>
              ))}
            </select>
          </div>

          <div className="fields-grid">
            <Field
              id="waterMass"
              label="Massa de água no béquer"
              symbol="m_água"
              value={values.waterMass}
              onChange={(v) => update('waterMass', v)}
              suffix="g"
            />
            <Field
              id="initialTemp"
              label="Temperatura inicial da água"
              symbol="Ti"
              value={values.initialTemp}
              onChange={(v) => update('initialTemp', v)}
              suffix="°C"
            />
            <Field
              id="finalTemp"
              label="Temperatura final da água"
              symbol="Tf"
              value={values.finalTemp}
              onChange={(v) => update('finalTemp', v)}
              suffix="°C"
            />
            <Field
              id="lampBefore"
              label="Lamparina antes da queima"
              symbol="m₁"
              value={values.lampBefore}
              onChange={(v) => update('lampBefore', v)}
              suffix="g"
            />
            <Field
              id="lampAfter"
              label="Lamparina após a queima"
              symbol="m₂"
              value={values.lampAfter}
              onChange={(v) => update('lampAfter', v)}
              suffix="g"
            />
          </div>

          {/* OPÇÃO DE BÉQUER DE VIDRO */}
          <div className="beaker-option-box">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={includeBeaker}
                onChange={(e) => setIncludeBeaker(e.target.checked)}
              />
              <span>Considerar calor absorvido pelo vidro do béquer (c = 0,20 cal/g·°C)</span>
            </label>
            {includeBeaker && (
              <div className="beaker-field-wrapper">
                <Field
                  id="beakerMass"
                  label="Massa do béquer de vidro"
                  symbol="m_béquer"
                  value={values.beakerMass}
                  onChange={(v) => update('beakerMass', v)}
                  suffix="g"
                  placeholder="ex.: 50"
                />
              </div>
            )}
          </div>
        </div>

        <div className="panel result-panel compact-result" aria-live="polite">
          <div className="result-top">
            <span className="panel-kicker">Entalpia Molar Experimental</span>
            <div className="result-actions-top">
              {result && !result.error && (
                <button
                  type="button"
                  className="copy-btn copy-full-btn"
                  onClick={copyCombustionReport}
                  title="Copiar relatório completo do experimento"
                >
                  {copied ? '✓ Relatório Copiado!' : '📄 Copiar Relatório'}
                </button>
              )}
              <span className="live-dot">
                <i /> ao vivo
              </span>
            </div>
          </div>

          {result?.error ? (
            <div className="warning-box">{result.error}</div>
          ) : result ? (
            <div className="combustion-results">
              <div className="result-value">
                −{formatNumber(result.kcalPerMol)} <small>kcal/mol</small>
              </div>
              <div className="result-caption">
                Equivalente no SI: <strong>−{formatNumber(result.kJPerMol)} kJ/mol</strong>
                <br />
                <span className="negative">● Reação exotérmica (libera energia, ΔH &lt; 0)</span>
              </div>

              {/* BARRA DE RENDIMENTO E DISTRIBUIÇÃO */}
              <div className="efficiency-card">
                <div className="efficiency-header">
                  <span>Aproveitamento Térmico Útil:</span>
                  <strong>{formatNumber(result.efficiency)}%</strong>
                </div>
                <div className="efficiency-bar">
                  <div
                    className="efficiency-fill"
                    style={{ width: `${Math.min(100, Math.max(0, result.efficiency))}%` }}
                    title={`Rendimento útil: ${formatNumber(result.efficiency)}%`}
                  />
                </div>
                <div className="energy-partition-labels">
                  <span className="energy-useful">
                    ● Água{includeBeaker ? ' + Béquer' : ''}: {formatNumber(result.efficiency)}%
                  </span>
                  <span className="energy-lost">
                    ● Dissipado no ar: {formatNumber(Math.max(0, 100 - result.efficiency))}%
                  </span>
                </div>
                <small className="efficiency-ref">
                  Referência teórica completa: {selectedFuel.deltaHKcal} kcal/mol ({selectedFuel.deltaHKJ} kJ/mol)
                </small>
              </div>

              <div className="combustion-metrics">
                <div className="metric-item">
                  <span>Água aqueceu (ΔT):</span>
                  <b>+{formatNumber(result.deltaT)} °C</b>
                </div>
                <div className="metric-item">
                  <span>Combustível queimado:</span>
                  <b>{formatNumber(result.burned)} g</b>
                </div>
                <div className="metric-item">
                  <span>Calor capturado (Q):</span>
                  <b>{formatNumber(result.heat)} cal</b>
                </div>
                <div className="metric-item">
                  <span>Poder calorífico exp.:</span>
                  <b>{formatNumber(result.calPerGram)} cal/g</b>
                </div>
              </div>

              <div className="equation-box">
                <code>{selectedFuel.equation}</code>
              </div>

              {/* RESOLUÇÃO DETALHADA DO EXPERIMENTO */}
              <div className="divider" />
              <div className="calculation">
                <span className="panel-kicker">Etapas Matemáticas do Experimento</span>
                <div className="steps-list">
                  <div className="step-row">
                    <span className="step-badge">1</span>
                    <span className="step-text">
                      Variação térmica da água: ΔT = Tf − Ti = {values.finalTemp} − {values.initialTemp} = +{formatNumber(result.deltaT)} °C
                    </span>
                  </div>
                  <div className="step-row">
                    <span className="step-badge">2</span>
                    <span className="step-text">
                      Combustível consumido: Δm = m₁ − m₂ = {values.lampBefore} − {values.lampAfter} = {formatNumber(result.burned)} g
                    </span>
                  </div>
                  <div className="step-row">
                    <span className="step-badge">3</span>
                    <span className="step-text">
                      Calor absorvido pela água: Q_água = {values.waterMass} g · 1 cal/g·°C · {formatNumber(result.deltaT)} °C = {formatNumber(result.waterHeat)} cal
                      {includeBeaker && ` (+ ${formatNumber(result.beakerHeat)} cal no béquer = ${formatNumber(result.heat)} cal total)`}
                    </span>
                  </div>
                  <div className="step-row">
                    <span className="step-badge">4</span>
                    <span className="step-text">
                      Energia por grama: q = Q / Δm = {formatNumber(result.heat)} cal / {formatNumber(result.burned)} g = {formatNumber(result.calPerGram)} cal/g
                    </span>
                  </div>
                  <div className="step-row">
                    <span className="step-badge">5</span>
                    <span className="step-text">
                      Entalpia molar: ΔH = −(q · M) / 1000 = −({formatNumber(result.calPerGram)} · {selectedFuel.molarMass}) / 1000 = −{formatNumber(result.kcalPerMol)} kcal/mol
                    </span>
                  </div>
                  <div className="step-row">
                    <span className="step-badge">6</span>
                    <span className="step-text">
                      Rendimento do sistema: η = (ΔH_exp / ΔH_teor) · 100 = ({formatNumber(result.kcalPerMol)} / {selectedFuel.deltaHKcal}) · 100 = {formatNumber(result.efficiency)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <p className="helper-text">Preencha os campos ao lado para calcular.</p>
          )}
        </div>
      </div>

      <div className="steps-card">
        <b>Por que o rendimento experimental em bancada escolar é inferior a 100%?</b>
        <p>
          Em condições normais de sala de aula sem um calorímetro adiabático fechado (bomba calorimétrica), a maior parte da energia emitida pela chama
          transfere-se para o ar circundante por correntes de convecção e radiação infravermelha, além do calor absorvido pelo tripé de ferro e pelo vidro do béquer.
          Por esse motivo, experimentos escolares típicos apresentam rendimento útil entre 15% e 40%.
        </p>
      </div>
    </section>
  )
}