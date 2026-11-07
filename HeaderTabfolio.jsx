import React, { useEffect, useRef, useState } from 'react'

export const TABS = [
  { id: 'calculadora', label: 'Calculadora', shortLabel: 'Calc.', icon: '🧮', badge: '01' },
  { id: 'equilibrio', label: 'Equilíbrio Térmico', shortLabel: 'Equil.', icon: '⚖️', badge: '02' },
  { id: 'combustao', label: 'Combustão', shortLabel: 'Comb.', icon: '🔥', badge: '03' },
  { id: 'comparar', label: 'Comparar Substâncias', shortLabel: 'Comp.', icon: '📊', badge: '04' },
  { id: 'tabela', label: 'Tabela de Calores', shortLabel: 'Tabela', icon: '📋', badge: '05' },
  { id: 'guia', label: 'Como Funciona', shortLabel: 'Guia', icon: '💡', badge: '06' },
]

export default function HeaderTabfolio({
  activeTab,
  onSelectTab,
  darkMode,
  onToggleTheme,
}) {
  const desktopNavRef = useRef(null)

  // Rolagem suave da dock em telas médias se necessário
  useEffect(() => {
    const nav = desktopNavRef.current
    if (!nav) return
    const activeBtn = nav.querySelector('.tabfolio-tab.active')
    if (activeBtn && nav.scrollWidth > nav.clientWidth) {
      const scrollPos = activeBtn.offsetLeft - (nav.clientWidth - activeBtn.clientWidth) / 2
      nav.scrollTo({ left: Math.max(0, scrollPos), behavior: 'smooth' })
    }
  }, [activeTab])

  const handleTabClick = (tabId) => {
    onSelectTab(tabId)
    // No mobile, rola com suavidade para focar na ferramenta selecionada
    if (typeof window !== 'undefined' && window.innerWidth <= 860) {
      setTimeout(() => {
        const target = document.getElementById('ferramenta-ativa')
        if (target) {
          const yOffset = -70
          const y = target.getBoundingClientRect().top + window.pageYOffset + yOffset
          window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' })
        }
      }, 60)
    }
  }

  return (
    <>
      {/* =========================================================
          DESKTOP & TABLET HEADER (Estilo Tabfolio Framer)
          Barra flutuante moderna com abas segmentadas e frosted glass
         ========================================================= */}
      <header className="tabfolio-header-wrapper" role="banner">
        <div className="tabfolio-header">
          {/* LOGO / MARCA */}
          <a
            className="tabfolio-brand"
            href="#inicio"
            aria-label="TermoLab - Início"
            onClick={(e) => {
              if (window.location.hash) {
                e.preventDefault()
                window.scrollTo({ top: 0, behavior: 'smooth' })
              }
            }}
          >
            <span className="tabfolio-brand-mark" aria-hidden="true">◒</span>
            <span className="tabfolio-brand-text">
              termo<span>lab</span>
            </span>
          </a>

          {/* DOCK DE ABAS SEGMENTADAS (ESTILO TABFOLIO FRAMER) */}
          <nav
            ref={desktopNavRef}
            className="tabfolio-nav-dock"
            aria-label="Navegação de ferramentas"
          >
            {TABS.map((tab) => {
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  type="button"
                  className={`tabfolio-tab ${isActive ? 'active' : ''}`}
                  aria-current={isActive ? 'page' : undefined}
                  onClick={() => handleTabClick(tab.id)}
                >
                  {/* Pílula de fundo ativa animada estilo Tabfolio */}
                  {isActive && (
                    <span className="tabfolio-tab-bg" aria-hidden="true" />
                  )}
                  <span className="tabfolio-tab-icon" aria-hidden="true">
                    {tab.icon}
                  </span>
                  <span className="tabfolio-tab-label">{tab.label}</span>
                  <span className="tabfolio-tab-badge" aria-hidden="true">
                    {tab.badge}
                  </span>
                </button>
              )
            })}
          </nav>

          {/* AÇÕES À DIREITA: TOGGLE DE TEMA E STATUS */}
          <div className="tabfolio-actions">
            <button
              type="button"
              className="tabfolio-theme-btn"
              onClick={onToggleTheme}
              aria-label={darkMode ? 'Ativar modo claro' : 'Ativar modo escuro'}
              title={darkMode ? 'Mudar para tema claro' : 'Mudar para tema escuro'}
            >
              <span className="theme-icon-orb" aria-hidden="true">
                {darkMode ? '☀' : '☾'}
              </span>
              <span className="theme-text">{darkMode ? 'Claro' : 'Escuro'}</span>
            </button>

            <div className="tabfolio-status-chip" title="Simulação interativa ativa">
              <span className="status-pulse-dot" />
              <span>Estudo</span>
            </div>
          </div>
        </div>
      </header>

      {/* =========================================================
          MOBILE TOP BAR (Compacta, enxuta, sem poluição visual)
         ========================================================= */}
      <header className="mobile-top-bar" aria-label="Cabeçalho mobile">
        <a className="mobile-brand" href="#inicio" aria-label="TermoLab">
          <span className="mobile-brand-mark">◒</span>
          <span className="mobile-brand-text">termo<span>lab</span></span>
        </a>

        <div className="mobile-top-actions">
          <button
            type="button"
            className="mobile-theme-btn"
            onClick={onToggleTheme}
            aria-label={darkMode ? 'Modo claro' : 'Modo escuro'}
          >
            <span aria-hidden="true">{darkMode ? '☀' : '☾'}</span>
            <span>{darkMode ? 'Claro' : 'Escuro'}</span>
          </button>
        </div>
      </header>

      <nav className="mobile-bottom-nav" aria-label="Navegação de ferramentas">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              type="button"
              className={`mobile-bottom-nav-item ${isActive ? 'active' : ''}`}
              aria-label={tab.label}
              aria-current={isActive ? 'page' : undefined}
              onClick={() => handleTabClick(tab.id)}
            >
              <span className="mobile-bottom-nav-icon" aria-hidden="true">{tab.icon}</span>
              <span className="mobile-bottom-nav-label" aria-hidden="true">{tab.shortLabel}</span>
            </button>
          )
        })}
      </nav>

    </>
  )
}
