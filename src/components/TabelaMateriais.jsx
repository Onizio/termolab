import React, { useMemo, useState } from 'react'
import { TABELA_SUBSTANCIAS } from '../data/substancias'

export default function TabelaMateriais({ onSelectMaterial }) {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('Todos')
  const [unit, setUnit] = useState('ambas') // 'ambas', 'cal', ou 'J'
  const [sortField, setSortField] = useState('valueDesc') // 'valueDesc', 'valueAsc', 'nameAsc', 'nameDesc'
  const [copiedName, setCopiedName] = useState(null)

  const categories = useMemo(() => {
    return ['Todos', ...new Set(TABELA_SUBSTANCIAS.map((item) => item.category).filter(Boolean))]
  }, [])

  const filtered = useMemo(() => {
    const list = TABELA_SUBSTANCIAS.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.symbol.toLowerCase().includes(search.toLowerCase()) ||
        item.category.toLowerCase().includes(search.toLowerCase())
      const matchesCategory = category === 'Todos' || item.category === category
      return matchesSearch && matchesCategory
    })

    return list.sort((a, b) => {
      if (sortField === 'valueDesc') return b.value - a.value
      if (sortField === 'valueAsc') return a.value - b.value
      if (sortField === 'nameAsc') return a.name.localeCompare(b.name, 'pt-BR')
      if (sortField === 'nameDesc') return b.name.localeCompare(a.name, 'pt-BR')
      return 0
    })
  }, [search, category, sortField])

  const copySpecificHeat = (item) => {
    const text = `${item.name}: c = ${item.value} cal/g·°C (${item.valueJ} J/g·°C)`
    navigator.clipboard?.writeText(text)
    setCopiedName(item.name)
    setTimeout(() => setCopiedName(null), 1800)
  }

  const toggleSort = (field) => {
    if (field === 'name') {
      setSortField((curr) => (curr === 'nameAsc' ? 'nameDesc' : 'nameAsc'))
    } else if (field === 'value') {
      setSortField((curr) => (curr === 'valueDesc' ? 'valueAsc' : 'valueDesc'))
    }
  }

  return (
    <section className="content-section">
      <div className="section-intro">
        <div>
          <div className="eyebrow">02 / referência termodinâmica</div>
          <h2>Tabela de Calores Específicos e Propriedades Térmicas</h2>
        </div>
        <p>
          Energia necessária para elevar em 1 °C a temperatura de 1 g da substância (à pressão atmosférica constante).
        </p>
      </div>

      <div className="table-controls panel inputs-panel">
        <div className="table-search-box">
          <label htmlFor="tabela-search">Buscar substância ou símbolo</label>
          <div className="search-input-wrapper">
            <input
              id="tabela-search"
              type="search"
              placeholder="Ex: Ferro, Fe, Água, Ouro..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button
                type="button"
                className="clear-search-btn"
                onClick={() => setSearch('')}
                title="Limpar busca"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        <div className="table-filters">
          <label>Filtrar por grupo</label>
          <div className="filter-chips">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                className={`filter-chip ${category === cat ? 'active' : ''}`}
                onClick={() => setCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="table-unit-toggle">
          <label>Unidade de exibição</label>
          <div className="segmented-control">
            <button
              type="button"
              className={unit === 'ambas' ? 'active' : ''}
              onClick={() => setUnit('ambas')}
            >
              Ambas
            </button>
            <button
              type="button"
              className={unit === 'cal' ? 'active' : ''}
              onClick={() => setUnit('cal')}
            >
              cal/g·°C
            </button>
            <button
              type="button"
              className={unit === 'J' ? 'active' : ''}
              onClick={() => setUnit('J')}
            >
              J/g·°C (SI)
            </button>
          </div>
        </div>
      </div>

      <div className="table-status-bar">
        <span>
          Mostrando <strong>{filtered.length}</strong> de {TABELA_SUBSTANCIAS.length} substâncias catalogadas.
        </span>
        <span className="sort-hint">
          Dica: clique nos cabeçalhos <em>Substância</em> ou <em>Calor Específico</em> para ordenar.
        </span>
      </div>

      <div className="material-table-container">
        <div className="material-table">
          <div className="table-header-row">
            <span>#</span>
            <span />
            <button
              type="button"
              className="table-sort-header"
              onClick={() => toggleSort('name')}
              title="Clique para ordenar por nome"
            >
              Substância {sortField === 'nameAsc' ? '▲' : sortField === 'nameDesc' ? '▼' : '↕'}
            </button>
            <span>Fórmula</span>
            <span>Categoria</span>
            <button
              type="button"
              className="table-sort-header"
              onClick={() => toggleSort('value')}
              title="Clique para ordenar por calor específico"
            >
              Calor Específico (c) {sortField === 'valueDesc' ? '▼' : sortField === 'valueAsc' ? '▲' : '↕'}
            </button>
            <span>Propriedades de Fase</span>
            <span>Ações</span>
          </div>

          {filtered.length === 0 ? (
            <div className="empty-table-state">
              Nenhuma substância encontrada para "{search}".
              <br />
              <button
                type="button"
                className="reset-filter-btn"
                onClick={() => {
                  setSearch('')
                  setCategory('Todos')
                }}
              >
                Limpar filtros de busca
              </button>
            </div>
          ) : (
            filtered.map((item, index) => (
              <div className="table-row" key={item.name}>
                <span className="table-index">{String(index + 1).padStart(2, '0')}</span>
                <span className="material-dot" style={{ background: item.color }} />
                <div className="material-name-col">
                  <strong>{item.name}</strong>
                  {item.description && <small className="material-desc">{item.description}</small>}
                </div>
                <span className="material-symbol">{item.symbol}</span>
                <span className="material-category-tag">{item.category}</span>
                <span className="specific-value">
                  {unit === 'cal' && (
                    <>
                      {item.value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 3 })}{' '}
                      <small>cal/g·°C</small>
                    </>
                  )}
                  {unit === 'J' && (
                    <>
                      {item.valueJ.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 3 })}{' '}
                      <small>J/g·°C</small>
                    </>
                  )}
                  {unit === 'ambas' && (
                    <div className="dual-unit">
                      <span>{item.value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 3 })} <small>cal/g·°C</small></span>
                      <span className="si-value">{item.valueJ.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 3 })} <small>J/g·°C</small></span>
                    </div>
                  )}
                </span>

                <div className="phase-properties-col">
                  {item.meltingPoint !== undefined && (
                    <small title="Ponto de Fusão">
                      Fusão: <b>{item.meltingPoint} °C</b>
                      {item.latentFusion ? ` (Lf = ${item.latentFusion} cal/g)` : ''}
                    </small>
                  )}
                  {item.boilingPoint !== undefined && (
                    <small title="Ponto de Ebulição">
                      Ebulição: <b>{item.boilingPoint} °C</b>
                      {item.latentVaporization ? ` (Lv = ${item.latentVaporization} cal/g)` : ''}
                    </small>
                  )}
                  {item.meltingPoint === undefined && item.boilingPoint === undefined && (
                    <small className="text-dim">—</small>
                  )}
                </div>

                <div className="table-actions-cell">
                  <button
                    type="button"
                    className="quick-copy-btn"
                    onClick={() => copySpecificHeat(item)}
                    title="Copiar valor de calor específico"
                  >
                    {copiedName === item.name ? '✓ Copiado' : '📋 Copiar'}
                  </button>
                  {onSelectMaterial && (
                    <button
                      type="button"
                      className="table-action-btn"
                      onClick={() => onSelectMaterial(item.name)}
                      title={`Usar ${item.name} na calculadora`}
                    >
                      Calcular →
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="note-box">
        <span>💡</span>
        <div>
          <strong>Curiosidade Didática e Conexão com o Cotidiano:</strong> Metais como ouro, chumbo e ferro possuem baixíssimo calor específico (em torno de 0,03 a 0,11 cal/g·°C), por isso aquecem e esfriam quase instantaneamente quando expostos a fontes térmicas. Já a água líquida exige 1,00 cal/g·°C (4,18 J/g·°C) — quase 10 vezes mais que o ferro e 32 vezes mais que o ouro! É esse fenômeno que explica a brisa marítima nas praias e a estabilidade de temperatura no corpo humano (composto em cerca de 70% por água).
        </div>
      </div>
    </section>
  )
}
