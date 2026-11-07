import React, { useMemo, useState } from 'react'
import { TABELA_SUBSTANCIAS } from '../data/substancias'

export default function TabelaMateriais({ onSelectMaterial }) {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('Todos')
  const [unit, setUnit] = useState('ambas') // 'ambas', 'cal', ou 'J'
  const [sortField, setSortField] = useState('valueDesc') // 'valueDesc', 'valueAsc', 'nameAsc', 'nameDesc'
  const [copiedName, setCopiedName] = useState(null)

  // Categorias com contagem
  const categoryStats = useMemo(() => {
    const rawCategories = ['Todos', ...new Set(TABELA_SUBSTANCIAS.map((item) => item.category).filter(Boolean))]
    return rawCategories.map((cat) => {
      const count = cat === 'Todos'
        ? TABELA_SUBSTANCIAS.length
        : TABELA_SUBSTANCIAS.filter((i) => i.category === cat).length
      return { name: cat, count }
    })
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
    const text = `${item.name} (${item.symbol}): c = ${item.value} cal/g·°C (${item.valueJ} J/g·°C)`
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

  // Máximo para a barra relativa de calor específico (a água é a referência = 1.0)
  const maxCal = 1.0

  return (
    <section className="content-section table-section-fresh">
      {/* CABEÇALHO */}
      <div className="section-intro">
        <div>
          <div className="eyebrow">05 / referência termodinâmica</div>
          <h2>Tabela de Calores Específicos &amp; Propriedades Térmicas</h2>
        </div>
        <p>
          Energia necessária para elevar em 1 °C a temperatura de 1 g da substância sob pressão constante.
          Compare a inércia térmica dos materiais do cotidiano com a água.
        </p>
      </div>

      {/* CARDS DE DESTAQUE TERMODINÂMICO (HERO STATS) */}
      <div className="table-hero-stats">
        <div className="hero-stat-card high-capacity">
          <div className="stat-card-badge">💧 Maior Calor Específico</div>
          <div className="stat-card-value">1,00 <small>cal/g·°C</small></div>
          <div className="stat-card-name">Água Líquida (H₂O)</div>
          <p className="stat-card-desc">
            Exige enorme quantidade de energia para mudar de temperatura. Atua como o moderador térmico da Terra e do corpo humano.
          </p>
        </div>

        <div className="hero-stat-card low-capacity">
          <div className="stat-card-badge">⚡ Menor Calor Específico</div>
          <div className="stat-card-value">0,031 <small>cal/g·°C</small></div>
          <div className="stat-card-name">Ouro (Au) &amp; Chumbo (Pb)</div>
          <p className="stat-card-desc">
            Esquentam e esfriam 32 vezes mais rápido que a água com a mesma quantidade de calor.
          </p>
        </div>

        <div className="hero-stat-card count-capacity">
          <div className="stat-card-badge">📚 Materiais Catalogados</div>
          <div className="stat-card-value">{TABELA_SUBSTANCIAS.length} <small>substâncias</small></div>
          <div className="stat-card-name">Banco de Dados Didático</div>
          <p className="stat-card-desc">
            Propriedades completas com pontos de fusão, ebulição e calores latentes conforme o currículo do Ensino Médio e ENEM.
          </p>
        </div>
      </div>

      {/* BARRA DE CONTROLES MODERNA (DASHBOARD TOOLBAR) */}
      <div className="table-dashboard-toolbar">
        {/* BUSCA COM ÍCONE */}
        <div className="table-search-pill">
          <span className="search-icon-svg" aria-hidden="true">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </span>
          <input
            id="tabela-search"
            type="search"
            placeholder="Buscar por nome, símbolo químico ou categoria..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Buscar substância ou símbolo"
          />
          {search && (
            <button
              type="button"
              className="clear-search-pill-btn"
              onClick={() => setSearch('')}
              title="Limpar busca"
            >
              ✕
            </button>
          )}
        </div>

        {/* ALTERNADOR DE UNIDADES EM PÍLULA */}
        <div className="table-unit-pill-selector">
          <span className="unit-selector-label">Unidade:</span>
          <div className="unit-pill-group">
            <button
              type="button"
              className={unit === 'ambas' ? 'unit-pill active' : 'unit-pill'}
              onClick={() => setUnit('ambas')}
            >
              Ambas (cal + J)
            </button>
            <button
              type="button"
              className={unit === 'cal' ? 'unit-pill active' : 'unit-pill'}
              onClick={() => setUnit('cal')}
            >
              cal/g·°C
            </button>
            <button
              type="button"
              className={unit === 'J' ? 'unit-pill active' : 'unit-pill'}
              onClick={() => setUnit('J')}
            >
              J/g·°C (SI)
            </button>
          </div>
        </div>
      </div>

      {/* FILTROS DE CATEGORIA EM CHIPS MODERNOS */}
      <div className="table-category-chips-bar">
        <div className="chips-scroll-container">
          {categoryStats.map((cat) => {
            const isActive = category === cat.name
            return (
              <button
                key={cat.name}
                type="button"
                className={`table-category-chip ${isActive ? 'active' : ''}`}
                onClick={() => setCategory(cat.name)}
              >
                <span>{cat.name}</span>
                <span className="chip-count-badge">{cat.count}</span>
              </button>
            )
          })}
        </div>

        <div className="table-meta-summary">
          <span>Mostrando <strong>{filtered.length}</strong> de {TABELA_SUBSTANCIAS.length} materiais</span>
        </div>
      </div>

      {/* ESTADO VAZIO (SE BUSCA NÃO RETORNAR NADA) */}
      {filtered.length === 0 ? (
        <div className="table-empty-card">
          <span className="empty-emoji">🔍</span>
          <h3>Nenhuma substância encontrada para "{search}"</h3>
          <p>Tente buscar por termos mais genéricos, símbolos químicos (ex.: Fe, Cu, H₂O) ou limpe o filtro.</p>
          <button
            type="button"
            className="empty-reset-btn"
            onClick={() => {
              setSearch('')
              setCategory('Todos')
            }}
          >
            Limpar Filtros de Busca
          </button>
        </div>
      ) : (
        <>
          {/* ========================================================
              VISUALIZAÇÃO DESKTOP: TABELA LIMPA COM BARRAS DE MAGNITUDE
             ======================================================== */}
          <div className="table-desktop-view">
            <div className="fresh-table-card">
              <table className="fresh-data-table">
                <thead>
                  <tr>
                    <th className="th-num">#</th>
                    <th className="th-name">
                      <button
                        type="button"
                        className="th-sortable-btn"
                        onClick={() => toggleSort('name')}
                        title="Clique para ordenar por nome"
                      >
                        <span>Substância &amp; Fórmula</span>
                        <span className="sort-icon">{sortField === 'nameAsc' ? '▲' : sortField === 'nameDesc' ? '▼' : '↕'}</span>
                      </button>
                    </th>
                    <th className="th-category">Categoria</th>
                    <th className="th-specific-heat">
                      <button
                        type="button"
                        className="th-sortable-btn"
                        onClick={() => toggleSort('value')}
                        title="Clique para ordenar por calor específico"
                      >
                        <span>Calor Específico (c) &amp; Magnitude</span>
                        <span className="sort-icon">{sortField === 'valueDesc' ? '▼' : sortField === 'valueAsc' ? '▲' : '↕'}</span>
                      </button>
                    </th>
                    <th className="th-phase">Mudanças de Fase</th>
                    <th className="th-actions">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((item, index) => {
                    const barPercent = Math.min(100, Math.max(3, (item.value / maxCal) * 100))
                    return (
                      <tr key={item.name} className="fresh-table-row">
                        <td className="td-num">{String(index + 1).padStart(2, '0')}</td>
                        <td className="td-name">
                          <div className="substance-meta-cell">
                            <span
                              className="material-color-dot"
                              style={{ backgroundColor: item.color || '#3b82f6' }}
                              title={`Cor de identificação: ${item.name}`}
                            />
                            <div className="substance-info-text">
                              <div className="name-and-formula">
                                <strong className="substance-title">{item.name}</strong>
                                {item.symbol && item.symbol !== '—' && (
                                  <span className="substance-formula-badge">{item.symbol}</span>
                                )}
                              </div>
                              {item.description && (
                                <p className="substance-short-desc">{item.description}</p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="td-category">
                          <span className={`category-pill-tag cat-${item.category?.toLowerCase() || 'geral'}`}>
                            {item.category}
                          </span>
                        </td>
                        <td className="td-specific-heat">
                          <div className="specific-heat-cell">
                            <div className="specific-heat-numbers">
                              {(unit === 'cal' || unit === 'ambas') && (
                                <span className="val-cal">
                                  <strong>{item.value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 3 })}</strong>
                                  <small> cal/g·°C</small>
                                </span>
                              )}
                              {unit === 'ambas' && <span className="val-divider">•</span>}
                              {(unit === 'J' || unit === 'ambas') && (
                                <span className="val-joule">
                                  <strong>{item.valueJ.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 3 })}</strong>
                                  <small> J/g·°C</small>
                                </span>
                              )}
                            </div>
                            {/* Barra visual de capacidade térmica relativa */}
                            <div className="heat-bar-track" title={`${item.name}: ${barPercent.toFixed(0)}% da inércia da água`}>
                              <div
                                className="heat-bar-fill"
                                style={{
                                  width: `${barPercent}%`,
                                  backgroundColor: item.color || 'var(--orange)',
                                }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="td-phase">
                          <div className="phase-cell-content">
                            {item.meltingPoint !== undefined && (
                              <span className="phase-tag fusion" title="Ponto de Fusão">
                                ❄️ Fusão: <b>{item.meltingPoint} °C</b>
                                {item.latentFusion ? <small> (Lf: {item.latentFusion} cal/g)</small> : null}
                              </span>
                            )}
                            {item.boilingPoint !== undefined && (
                              <span className="phase-tag boiling" title="Ponto de Ebulição">
                                ♨️ Ebulição: <b>{item.boilingPoint} °C</b>
                                {item.latentVaporization ? <small> (Lv: {item.latentVaporization} cal/g)</small> : null}
                              </span>
                            )}
                            {item.meltingPoint === undefined && item.boilingPoint === undefined && (
                              <span className="phase-tag neutral">—</span>
                            )}
                          </div>
                        </td>
                        <td className="td-actions">
                          <div className="table-row-actions">
                            <button
                              type="button"
                              className="btn-table-copy"
                              onClick={() => copySpecificHeat(item)}
                              title="Copiar valor térmico"
                            >
                              {copiedName === item.name ? '✓ Copiado' : '📋 Copiar'}
                            </button>
                            {onSelectMaterial && (
                              <button
                                type="button"
                                className="btn-table-use"
                                onClick={() => onSelectMaterial(item.name)}
                                title={`Carregar ${item.name} na calculadora`}
                              >
                                Calcular ➜
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* ========================================================
              VISUALIZAÇÃO MOBILE: CARDS MODERNOS COM FOCO NO POLEGAR
             ======================================================== */}
          <div className="table-mobile-cards-view">
            {filtered.map((item) => {
              const barPercent = Math.min(100, Math.max(3, (item.value / maxCal) * 100))
              return (
                <div key={item.name} className="mobile-material-card">
                  <div className="card-top-row">
                    <div className="card-identity">
                      <span
                        className="mobile-material-dot"
                        style={{ backgroundColor: item.color || '#3b82f6' }}
                      />
                      <div>
                        <strong className="mobile-material-name">{item.name}</strong>
                        {item.symbol && item.symbol !== '—' && (
                          <span className="mobile-symbol-badge">{item.symbol}</span>
                        )}
                      </div>
                    </div>
                    <span className="category-pill-tag mini">{item.category}</span>
                  </div>

                  <div className="card-c-section">
                    <div className="c-numbers-box">
                      <span className="c-main-val">
                        <strong>{item.value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 3 })}</strong> cal/g·°C
                      </span>
                      <span className="c-sec-val">
                        ({item.valueJ.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 3 })} J/g·°C)
                      </span>
                    </div>

                    <div className="heat-bar-track">
                      <div
                        className="heat-bar-fill"
                        style={{
                          width: `${barPercent}%`,
                          backgroundColor: item.color || 'var(--orange)',
                        }}
                      />
                    </div>
                  </div>

                  {item.description && (
                    <p className="mobile-material-desc">{item.description}</p>
                  )}

                  {(item.meltingPoint !== undefined || item.boilingPoint !== undefined) && (
                    <div className="mobile-phase-row">
                      {item.meltingPoint !== undefined && (
                        <span>Fusão: <b>{item.meltingPoint} °C</b></span>
                      )}
                      {item.boilingPoint !== undefined && (
                        <span>Ebulição: <b>{item.boilingPoint} °C</b></span>
                      )}
                    </div>
                  )}

                  <div className="card-actions-row">
                    <button
                      type="button"
                      className="btn-table-copy"
                      onClick={() => copySpecificHeat(item)}
                    >
                      {copiedName === item.name ? '✓ Copiado' : '📋 Copiar'}
                    </button>
                    {onSelectMaterial && (
                      <button
                        type="button"
                        className="btn-table-use"
                        onClick={() => onSelectMaterial(item.name)}
                      >
                        Usar na Calculadora ➜
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}

      {/* CURIOSIDADE DIDÁTICA E CONEXÃO COM O COTIDIANO */}
      <div className="fresh-note-box">
        <div className="note-box-header">
          <span className="note-lamp-icon" aria-hidden="true">💡</span>
          <strong>Conexão com a Natureza &amp; Cotidiano (Inércia Térmica)</strong>
        </div>
        <p>
          Metais como ouro, chumbo e ferro possuem baixíssimo calor específico (em torno de <strong>0,03 a 0,11 cal/g·°C</strong>),
          por isso aquecem e esfriam quase instantaneamente ao receber calor. Em contrapartida, a <strong>água líquida</strong> exige
          <strong> 1,00 cal/g·°C (4,18 J/g·°C)</strong> — quase 10 vezes mais que o ferro e 32 vezes mais que o ouro!
          É essa inércia térmica que estabiliza o clima nas cidades litorâneas (efeito maritimidade) e mantém a temperatura do corpo humano estável.
        </p>
      </div>
    </section>
  )
}
