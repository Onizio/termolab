# TermoLab — Laboratório Virtual de Calorimetria & Termoquímica

Aplicação interativa e didática de calorimetria e termodinâmica baseada no **Capítulo 14 de Química — Termoquímica**. Permite manipular a equação fundamental da calorimetria ($Q = m \cdot c \cdot \Delta T$), calcular equilíbrios térmicos entre corpos, analisar o rendimento térmico da combustão do etanol e comparar a inércia térmica de diferentes substâncias.

---

## 🚀 Funcionalidades

1. **Calculadora Principal de Calorimetria**:
   - Isola e calcula qualquer uma das 4 grandezas fundamentais: Calor ($Q$), Massa ($m$), Calor específico ($c$) ou Variação térmica ($\Delta T$).
   - Conversão bidirecional automática de unidades:
     - Calor: `cal`, `kcal`, `J`, `kJ` ($1\text{ cal} = 4,18\text{ J}$).
     - Massa: `g`, `kg`.
     - Calor específico: `cal/g·°C`, `J/g·°C` (padrão SI).
   - Presets de estudo com 1 clique (exemplos práticos com água, metais e resfriamento).
   - Resolução algébrica passo a passo com indicação de processo endotérmico (calor absorvido) ou exotérmico (calor liberado).
   - Botão para copiar o resultado formatado.

2. **Equilíbrio Térmico (Dois Corpos)**:
   - Conservação rigorosa de energia em sistema adiabaticamente isolado: $\sum Q = 0 \iff Q_1 + Q_2 = 0$.
   - Cálculo de $T_{\text{eq}} = \frac{m_1 c_1 T_1 + m_2 c_2 T_2}{m_1 c_1 + m_2 c_2}$.
   - Termômetro dinâmico graduado com marcador posicionado proporcionalmente na escala térmica.
   - Comparação das capacidades térmicas ($C = m \cdot c$).

3. **Combustão do Etanol**:
   - Simulação experimental de calorimetria com béquer de água e lamparina.
   - Equação termoquímica: $\text{C}_2\text{H}_5\text{OH}_{(l)} + 3\,\text{O}_{2(g)} \longrightarrow 2\,\text{CO}_{2(g)} + 3\,\text{H}_2\text{O}_{(l)} \quad (\Delta H < 0)$.
   - Cálculo da entalpia molar experimental em $\text{kcal/mol}$ e $\text{kJ/mol}$.
   - Barra visual de aproveitamento e rendimento térmico em relação à referência teórica ($-327\text{ kcal/mol}$).

4. **Comparação de Substâncias**:
   - Gráfico de barras comparando a variação térmica ($\Delta T$) sofrida por diferentes materiais para um mesmo $Q$ e $m$.
   - Suporte a processos de aquecimento ($Q > 0$) e resfriamento ($Q < 0$).

5. **Tabela de Calores Específicos**:
   - Busca em tempo real por nome ou símbolo químico (ex.: Ferro, Água, Cu, Al).
   - Filtro por categoria (Metais, Líquidos, Minerais, Sólidos, Isolantes).
   - Alternância entre unidades `cal/g·°C` e `J/g·°C`.
   - Atalho direto *"Usar na calculadora"* para preenchimento imediato.

6. **Como Funciona (Guia Conceitual)**:
   - Resumo didático sobre calor sensível, processos endotérmicos e exotérmicos, capacidade térmica e equivalentes mecânicos.

---

## 🛠️ Como Executar

```bash
# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento (Vite)
npm run dev

# Executar testes unitários (Vitest)
npm test

# Executar linter (ESLint)
npm run lint

# Gerar build de produção
npm run build
```

---

## 📂 Estrutura do Projeto

- `src/data/substancias.js`: Dados termoquímicos de materiais, cores e constantes de conversão.
- `src/lib/calorimetria.js`: Funções puras de cálculo, validação, conversão e passos algébricos.
- `src/lib/calorimetria.test.js`: Testes automatizados com cobertura completa de cenários e casos de borda.
- `src/components/`: Componentes modulares de cada aba (`Field`, `EquilibrioTermico`, `CombustaoEtanol`, `CompararSubstancias`, `TabelaMateriais`, `ComoFunciona`).
- `src/App.jsx`: Componente raiz com navegação, tema e estado reativo.
- `src/styles.css`: Sistema de design moderno, responsivo e suporte a temas claro/escuro.