import React, { useMemo, useState } from 'react'
import { compareSubstances, formatNumber } from '../lib/calorimetria'
import Field from './Field'

const COMPARE_PRESETS = [
  { label: '+1.000 cal (Aquecer)', q: '1000', m: '100' },
  { label: '+5.000 cal (Intenso)', q: '5000', m: '200' },
  { label: '−1.000 cal (Resfriar)', q: '-1000', m: '100' },
  { label: '+500 cal (Pequeno bloco)', q: '500', m: '50' },
]

export default function CompararSubstancias() {
  const [q, setQ] = useState('1000')
  const [mass, setMass] = useState('100')
  const [sortBy, setSortBy] = useState('deltaTAsc')
  const [selectedCategory, setSelectedCategory] = useState('Todos')
  const [search, setSearch] = useState('')

  const allRows = useMemo(() => compareSubstances(q, mass, sortBy), [q, mass, sortBy])

  const categories = useMemo(() => {
    return ['Todos', ...new Set(allRows.map((r) => r.category).filter(Boolean))]
  }, [allRows])

  const filteredRows = useMemo(() => {
    return allRows.filter((item) => {
      const matchesCat = selectedCategory === 'Todos' || item.category === selectedCategory
      const matchesSearch =
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.symbol.toLowerCase().includes(search.toLowerCase())
      return matchesCat && matchesSearch
    })
  }, [allRows, selectedCategory, search])

  const maxAbsDeltaT = useMemo(() => {
    if (!filteredRows.length) return 1
    const max = Math.max(...filteredRows.map((r) => Math.abs(r.deltaT)))
    return max > 0 ? max : 1
  }, [filteredRows])

  const isCooling = Number(String(q).replace(',', '.')) < 0

  return (
    <section className="content-section extra-section">
      <div className="section-intro">
        <div>
          <div className="eyebrow">04 / inércia térmica comparativa</div>
          <h2>Comparação entre Substâncias</h2>
        </div>
        <p>
          Compare como diferentes materiais reagem ao receber (ou ceder) exatamente a mesma quantidade de calor sob a mesma massa.
        </p>
      </div>

      {/* PRESETS DE CALOR */}
      <div className="presets-bar">
        <span className="presets-label">Cenários rápidos:</span>
        <div className="presets-chips">
          {COMPARE_PRESETS.map((p) => (
            <button
              key={p.label}
              type="button"
              className="preset-chip"
              onClick={() => {
                setQ(p.q)
                setMass(p.m)
              }}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* CONTROLES */}
      <div className="compare-controls panel inputs-panel">
        <div className="fields-grid">
          <Field
            id="compare-q"
            label="Quantidade de calor (Q)"
            symbol="Q"
            value={q}
            onChange={setQ}
            suffix="cal"
            helper={isCooling ? 'Q negativo: as substâncias estão cedendo calor (resfriando)' : 'Q positivo: as substâncias estão absorvendo calor (aquecendo)'}
          />
          <Field
            id="compare-m"
            label="Massa idêntica para todas (m)"
            symbol="m"
            value={mass}
            onChange={setMass}
            suffix="g"
            helper="Massa constante para isolar o efeito do calor específico (c)"
          />
        </div>

        <div className="filter-sort-row">
          <div className="filter-sort-item">
            <label htmlFor="compare-sort">Ordenar por:</label>
            <select
              id="compare-sort"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="deltaTAsc">Menor ΔT · maior inércia</option>
              <option value="deltaTDesc">Maior ΔT · menor inércia</option>
              <option value="capacityDesc">Maior calor específico</option>
              <option value="name">Ordem Alfabética</option>
            </select>
          </div>

          <div className="filter-sort-item search-filter-item">
            <label htmlFor="compare-search">Filtrar material:</label>
            <input
              id="compare-search"
              type="search"
              placeholder="Ex.: Água, Ferro, Ouro..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="category-chips-bar">
          <span className="chips-label">Grupo:</span>
          <div className="filter-chips">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                className={`filter-chip ${selectedCategory === cat ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="comparison-container panel">
        <div className="comparison-header">
          <span>Substância</span>
          <span>Inércia Térmica / Calor Específico</span>
          <span>Variação de Temperatura (ΔT)</span>
        </div>

        <div className="comparison-list">
          {filteredRows.length === 0 ? (
            <div className="empty-table-state">Nenhuma substância encontrada com os filtros atuais.</div>
          ) : (
            filteredRows.map((item) => {
              const absDeltaT = Math.abs(item.deltaT)
              const percentage = Math.min(100, Math.max(4, (absDeltaT / maxAbsDeltaT) * 100))
              const isHighInertia = item.value >= 0.4

              return (
                <div className="comparison-row" key={item.name}>
                  <div className="comparison-item-name">
                    <span className="material-dot" style={{ background: item.color }} />
                    <div>
                      <strong>{item.name}</strong>
                      <div className="material-sub-info">
                        <span className="material-symbol">{item.symbol}</span>
                        <span className="material-category-tag">{item.category}</span>
                      </div>
                    </div>
                  </div>

                  <div className="comparison-bar-col">
                    <div className="bar-track">
                      <div
                        className="bar-fill"
                        style={{
                          width: `${percentage}%`,
                          background: item.color || 'var(--blue)',
                        }}
                      />
                    </div>
                    <div className="bar-details">
                      <span>c = {formatNumber(item.value)} cal/g·°C ({formatNumber(item.valueJ)} J/g·°C)</span>
                      <span>Capacidade C = {formatNumber(item.capacity)} cal/°C</span>
                      <small className="behavior-tag">
                        {isHighInertia ? '🛡️ Elevada Inércia (Regulador)' : '⚡ Resposta Rápida (Condutor)'}
                      </small>
                    </div>
                  </div>

                  <div className="comparison-delta-col">
                    <span className={`delta-badge ${item.deltaT > 0 ? 'heating' : item.deltaT < 0 ? 'cooling' : ''}`}>
                      {item.deltaT > 0 ? '+' : ''}{formatNumber(item.deltaT)} °C
                    </span>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      <div className="steps-card">
        <b>Conclusão Física Fundamental:</b>
        <p>
          Pela relação <code>ΔT = Q / (m · c)</code>, a variação de temperatura é <strong>inversamente proporcional</strong> ao calor específico da substância.
          Por isso, para a mesma massa de 100 g e 1.000 cal fornecidas, enquanto o <strong>ouro</strong> aquece mais de 320 °C quase instantaneamente, a <strong>água líquida</strong> varia apenas 10 °C.
        </p>
      </div>
    </section>
  )
}
