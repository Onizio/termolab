import React, { useState } from 'react'

export default function ComoFunciona() {
  const [activeTopic, setActiveTopic] = useState('conceitos')

  return (
    <section className="content-section guide">
      <div className="section-intro">
        <div>
          <div className="eyebrow">06 / enciclopédia &amp; conceitos fundamentais</div>
          <h2>Como Funciona a Calorimetria?</h2>
        </div>
        <p>Um guia didático e completo baseado no Capítulo 14 de Química e Física (Termoquímica e Termologia).</p>
      </div>

      {/* NAVEGAÇÃO DE TÓPICOS */}
      <div className="guide-topics-nav">
        <button
          type="button"
          className={`guide-topic-btn ${activeTopic === 'conceitos' ? 'active' : ''}`}
          onClick={() => setActiveTopic('conceitos')}
        >
          Grandezas Fundamentais
        </button>
        <button
          type="button"
          className={`guide-topic-btn ${activeTopic === 'latente' ? 'active' : ''}`}
          onClick={() => setActiveTopic('latente')}
        >
          Sensível vs Latente (Fases)
        </button>
        <button
          type="button"
          className={`guide-topic-btn ${activeTopic === 'equilibrio' ? 'active' : ''}`}
          onClick={() => setActiveTopic('equilibrio')}
        >
          Equilíbrio Térmico
        </button>
        <button
          type="button"
          className={`guide-topic-btn ${activeTopic === 'termoquimica' ? 'active' : ''}`}
          onClick={() => setActiveTopic('termoquimica')}
        >
          Termoquímica &amp; Combustão
        </button>
        <button
          type="button"
          className={`guide-topic-btn ${activeTopic === 'exemplo' ? 'active' : ''}`}
          onClick={() => setActiveTopic('exemplo')}
        >
          Exercício Resolvido (ENEM)
        </button>
      </div>

      {activeTopic === 'conceitos' && (
        <div className="guide-grid">
          <article className="guide-card">
            <div className="guide-header">
              <span className="guide-icon">Q</span>
              <h3>Calor Sensível (Q)</h3>
            </div>
            <p>
              É a energia térmica em trânsito motivada exclusivamente pela diferença de temperatura entre corpos.
              Mede-se em <strong>calorias (cal)</strong> no uso prático ou em <strong>Joules (J)</strong> no Sistema Internacional (SI).
            </p>
            <div className="guide-tag endotermico">Q &gt; 0: processo endotérmico (absorve calor / aquece)</div>
            <div className="guide-tag exotermico">Q &lt; 0: processo exotérmico (cede calor / resfria)</div>
            <div className="guide-formula-box">Q = m · c · ΔT</div>
          </article>

          <article className="guide-card">
            <div className="guide-header">
              <span className="guide-icon">c</span>
              <h3>Calor Específico (c)</h3>
            </div>
            <p>
              Quantidade de energia necessária para elevar em 1 °C a temperatura de 1 grama de uma substância específica.
              A <strong>água líquida</strong> possui um valor excepcionalmente alto (1,0 cal/g·°C = 4,18 J/g·°C), agindo como o mais poderoso moderador térmico do planeta.
            </p>
            <div className="guide-formula-box">c = Q / (m · ΔT)</div>
          </article>

          <article className="guide-card">
            <div className="guide-header">
              <span className="guide-icon">ΔT</span>
              <h3>Variação Térmica (ΔT)</h3>
            </div>
            <p>
              Diferença entre a temperatura final e a inicial: <strong>ΔT = T<sub>f</sub> − T<sub>i</sub></strong>.
              Como a escala Celsius (°C) e a escala absoluta Kelvin (K) possuem intervalos de graus idênticos (1 °C = 1 K em variação), temos <strong>ΔT(°C) ≡ ΔT(K)</strong>.
            </p>
            <div className="guide-formula-box">ΔT = T<sub>final</sub> − T<sub>inicial</sub></div>
          </article>

          <article className="guide-card">
            <div className="guide-header">
              <span className="guide-icon">C</span>
              <h3>Capacidade Térmica (C)</h3>
            </div>
            <p>
              Propriedade do corpo ou sistema como um todo (depende tanto da massa quanto do material). Corpos com grande capacidade térmica
              exigem muito calor para alterar sua temperatura, apresentando alta inércia térmica.
            </p>
            <div className="guide-formula-box">C = m · c = Q / ΔT</div>
          </article>

          <article className="guide-card">
            <div className="guide-header">
              <span className="guide-icon">m</span>
              <h3>Massa (m)</h3>
            </div>
            <p>
              Quantidade de matéria do corpo. Quanto maior a massa, proporcionalmente mais energia térmica é requerida para atingir a mesma elevação de temperatura.
              Geralmente expressa em <strong>gramas (g)</strong> ou <strong>quilogramas (kg)</strong>.
            </p>
            <div className="guide-formula-box">1 kg = 1.000 g</div>
          </article>

          <article className="guide-card">
            <div className="guide-header">
              <span className="guide-icon">J</span>
              <h3>Equivalente Mecânico do Calor</h3>
            </div>
            <p>
              James Prescott Joule demonstrou experimentalmente em 1845 que trabalho mecânico e energia térmica são formas equivalentes de energia.
              Adota-se no Brasil a aproximação didática <strong>1 cal = 4,18 J</strong> (ou 4,184 J exatos).
            </p>
            <div className="guide-formula-box">1 cal ≈ 4,18 J | 1 kcal = 4,18 kJ</div>
          </article>
        </div>
      )}

      {activeTopic === 'latente' && (
        <div className="guide-detail-card">
          <h3>Calor Sensível vs. Calor Latente (Mudança de Estado Físico)</h3>
          <p>
            Na natureza, a transferência de calor pode provocar dois efeitos distintos em um corpo:
          </p>
          <div className="two-cards-grid">
            <div className="concept-subcard">
              <h4>1. Calor Sensível (Q = m · c · ΔT)</h4>
              <p>
                Provoca <strong>variação de temperatura</strong> sem alterar o estado físico da matéria (ex.: aquecer água de 20 °C para 80 °C).
              </p>
              <ul>
                <li>A energia térmica absorvida aumenta a energia cinética das moléculas.</li>
                <li>Ocorre em todo intervalo térmico fora dos pontos de fusão ou ebulição.</li>
              </ul>
            </div>

            <div className="concept-subcard">
              <h4>2. Calor Latente (Q = m · L)</h4>
              <p>
                Provoca <strong>mudança de fase</strong> (estado físico) à <strong>temperatura constante</strong> (sob pressão constante).
              </p>
              <ul>
                <li>A energia térmica é utilizada para romper ou formar ligações intermoleculares.</li>
                <li><strong>Fusão do Gelo (0 °C):</strong> L<sub>f</sub> = 80 cal/g (334 J/g).</li>
                <li><strong>Vaporização da Água (100 °C):</strong> L<sub>v</sub> = 540 cal/g (2.257 J/g).</li>
              </ul>
            </div>
          </div>

          <div className="curva-aquecimento-box">
            <b>Curva de Aquecimento Típica da Água (1 atm):</b>
            <div className="curva-steps">
              <span>Gelo aquecendo (-20 °C a 0 °C): Sensível (c = 0,5)</span>
              <span>➜</span>
              <span>Fusão a 0 °C: Latente (L = 80 cal/g)</span>
              <span>➜</span>
              <span>Água aquecendo (0 °C a 100 °C): Sensível (c = 1,0)</span>
              <span>➜</span>
              <span>Ebulição a 100 °C: Latente (L = 540 cal/g)</span>
              <span>➜</span>
              <span>Vapor aquecendo (&gt; 100 °C): Sensível (c = 0,48)</span>
            </div>
          </div>
        </div>
      )}

      {activeTopic === 'equilibrio' && (
        <div className="guide-detail-card">
          <h3>Princípio Geral das Trocas de Calor e Conservação da Energia</h3>
          <p>
            Quando dois ou mais corpos com temperaturas diferentes são colocados em contato térmico no interior de um <strong>calorímetro ideal</strong> (sistema termicamente isolado do meio externo):
          </p>
          <div className="guide-formula-highlight">
            ΣQ = 0 ⟹ Q<sub>cedido</sub> + Q<sub>recebido</sub> = 0
          </div>
          <p>
            O calor flui espontaneamente do corpo com <strong>maior temperatura</strong> para o corpo com <strong>menor temperatura</strong> até que ambos atinjam a mesma temperatura final, chamada de <strong>Temperatura de Equilíbrio Térmico (T<sub>eq</sub>)</strong>.
          </p>
          <div className="algebra-box">
            <b>Dedução Matemática para 2 Corpos:</b>
            <code>m₁ · c₁ · (Teq − T₁) + m₂ · c₂ · (Teq − T₂) = 0</code>
            <code>Teq · (m₁ · c₁ + m₂ · c₂) = m₁ · c₁ · T₁ + m₂ · c₂ · T₂</code>
            <code>Teq = (C₁ · T₁ + C₂ · T₂) / (C₁ + C₂)</code>
          </div>
          <div className="note-box">
            <span>⚖️</span>
            <div>
              <strong>Regra da Inércia Térmica:</strong> A temperatura de equilíbrio fica sempre mais próxima do corpo que possui maior capacidade térmica (C = m · c). Se as capacidades térmicas forem rigorosamente iguais, T<sub>eq</sub> será a média aritmética exata.
            </div>
          </div>
        </div>
      )}

      {activeTopic === 'termoquimica' && (
        <div className="guide-detail-card">
          <h3>Termoquímica: Entalpia de Combustão e Rendimento Energético</h3>
          <p>
            A <strong>Termoquímica</strong> estuda as trocas de calor que acompanham as reações químicas e transformações físicas.
            Toda reação de combustão é <strong>exotérmica</strong>, liberando calor para o ambiente (ΔH &lt; 0).
          </p>
          <div className="two-cards-grid">
            <div className="concept-subcard">
              <h4>Reação de Combustão do Etanol</h4>
              <code>C₂H₅OH (l) + 3 O₂ (g) → 2 CO₂ (g) + 3 H₂O (l)</code>
              <p>
                <strong>Entalpia padrão teórica:</strong> ΔH° = −327 kcal/mol (−1.367 kJ/mol).
                <br />
                Massa molar do etanol: <strong>46 g/mol</strong>.
                <br />
                Poder calorífico teórico: <strong>~7.100 cal/g</strong>.
              </p>
            </div>

            <div className="concept-subcard">
              <h4>Rendimento em Bancada Escolar</h4>
              <p>
                Quando a lamparina queima etanol sob um béquer de água em sala de aula, o calor aproveitado na água é menor que o calor total gerado pela queima:
              </p>
              <code>Rendimento (η) = (Calor Absorvido / Calor Teórico Gerado) · 100</code>
              <p>
                As perdas ocorrem por correntes de convecção do ar, radiação infravermelha dissipada e aquecimento do suporte metálico.
              </p>
            </div>
          </div>
        </div>
      )}

      {activeTopic === 'exemplo' && (
        <div className="guide-detail-card">
          <h3>Exercício Modelo Resolvido (Padrão ENEM / Vestibulares)</h3>
          <div className="exercise-statement">
            <strong>Enunciado:</strong> Um bloco de ferro de massa <strong>500 g</strong> a uma temperatura inicial de <strong>120 °C</strong> é colocado em um calorímetro ideal contendo <strong>200 g de água líquida</strong> a <strong>20 °C</strong>.
            Desprezando as perdas de calor para o ambiente e sabendo que o calor específico da água é <strong>1,0 cal/g·°C</strong> e do ferro é <strong>0,11 cal/g·°C</strong>, determine a temperatura final de equilíbrio térmico do sistema.
          </div>

          <div className="exercise-solution">
            <b>Resolução Passo a Passo:</b>
            <div className="steps-list">
              <div className="step-row">
                <span className="step-badge">1</span>
                <span className="step-text">
                  Identificação das capacidades térmicas:
                  <br />
                  • Água: C_água = m · c = 200 g · 1,0 cal/g·°C = <strong>200 cal/°C</strong>
                  <br />
                  • Ferro: C_ferro = m · c = 500 g · 0,11 cal/g·°C = <strong>55 cal/°C</strong>
                </span>
              </div>
              <div className="step-row">
                <span className="step-badge">2</span>
                <span className="step-text">
                  Aplicação da Lei de Conservação: ΣQ = 0 ⟹ Q_água + Q_ferro = 0
                  <br />
                  <code>200 · (Teq − 20) + 55 · (Teq − 120) = 0</code>
                </span>
              </div>
              <div className="step-row">
                <span className="step-badge">3</span>
                <span className="step-text">
                  Desenvolvimento algébrico:
                  <br />
                  <code>200 · Teq − 4000 + 55 · Teq − 6600 = 0</code>
                  <br />
                  <code>255 · Teq = 10600</code>
                  <br />
                  <code>Teq = 10600 / 255 ≈ 41,57 °C</code>
                </span>
              </div>
              <div className="step-row">
                <span className="step-badge">4</span>
                <span className="step-text">
                  <strong>Resposta Final:</strong> A temperatura de equilíbrio é de aproximadamente <strong>41,6 °C</strong>. Observe que, mesmo o ferro estando a 120 °C, a temperatura final ficou muito mais próxima da água (20 °C) porque a água possui capacidade térmica quase 4 vezes maior (200 cal/°C vs 55 cal/°C)!
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CARTÃO DE CONVERSÃO ENERGÉTICA */}
      <div className="conversion-card">
        <div className="conversion-item">
          <span>Equivalente mecânico do calor</span>
          <strong>1 cal <b>=</b> 4,18 J</strong>
        </div>
        <div className="conversion-item">
          <span>Quilocaloria</span>
          <strong>1 kcal <b>=</b> 1.000 cal <b>=</b> 4,18 kJ</strong>
        </div>
        <div className="conversion-item">
          <span>Energia Elétrica</span>
          <strong>1 kWh <b>=</b> 3,6 × 10<sup className="scientific-exponent">6</sup> J <b>≈</b> 860 kcal</strong>
        </div>
        <p className="conversion-disclaimer">
          Fórmulas válidas para regimes de calor sensível e calorímetro adiabático ideal à pressão atmosférica de 1 atm.
        </p>
      </div>
    </section>
  )
}
