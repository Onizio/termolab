# TermoLab — Contexto do Projeto

> Laboratório Virtual de Calorimetria & Termoquímica (pasta `siteQuimica`)

## 1. Ideia central

O **TermoLab** é um site educacional interativo, em português (Brasil), voltado a estudantes do Ensino Médio. Ele transforma o conteúdo de **Termoquímica / Calorimetria (Capítulo 14, na linha dos livros Feltre / Martha Reis)** em um "laboratório virtual". Em vez de só ler a fórmula, o aluno **manipula os números e vê o resultado**, com a resolução passo a passo.

A equação-mãe do projeto é:

```
Q = m · c · ΔT
```

Tudo gira em torno dela: calcular qualquer incógnita, aplicar em dois corpos trocando calor, aplicar à queima de um combustível e comparar materiais.

**Público-alvo:** estudantes (e professores) de Química/Física, inclusive quem se prepara para ENEM/vestibular (há um exercício resolvido no estilo ENEM).

**Convenção adotada:** `1 cal = 4,18 J` (padrão do Ensino Médio brasileiro), definida em `src/data/substancias.js`.

## 2. Funcionalidades (abas do site)

| # | Aba | O que faz |
|---|-----|-----------|
| 1 | **Calculadora** | Isola qualquer grandeza de `Q = m·c·ΔT` (Q, m, c ou ΔT). Converte unidades automaticamente (cal/kcal/J/kJ; g/kg; cal/g·°C ↔ J/g·°C). Tem exemplos prontos ("presets"), resolução algébrica passo a passo, indica se o processo é **endotérmico** (absorve calor) ou **exotérmico** (libera calor), copia o resultado e, quando a incógnita é `c`, sugere o material correspondente da tabela (tolerância de ±5%). |
| 2 | **Equilíbrio Térmico** | Dois corpos em sistema isolado: `Q₁ + Q₂ = 0`, com `T_eq = (m₁c₁T₁ + m₂c₂T₂) / (m₁c₁ + m₂c₂)`. Mostra um termômetro animado e compara as capacidades térmicas (`C = m·c`). É o maior componente do projeto (~950 linhas). |
| 3 | **Combustão do Etanol** | Simula o experimento clássico: lamparina aquecendo um béquer de água. A partir de massa de água, ΔT e massa de combustível queimado, calcula o poder calorífico (cal/g), a entalpia molar experimental (kcal/mol e kJ/mol) e o **rendimento** frente ao valor teórico. Considera opcionalmente o calor absorvido pelo béquer. Combustíveis: etanol (ΔH ≈ −327 kcal/mol), metanol (−174) e butano (−688). |
| 4 | **Comparar Substâncias** | Gráfico de barras mostrando o ΔT que diferentes materiais sofrem com o mesmo Q e a mesma massa — ilustra a "inércia térmica". Aceita aquecimento (Q > 0) e resfriamento (Q < 0). |
| 5 | **Tabela de Calores** | Tabela com ~18 materiais (água, gelo, vapor, etanol, metais, madeira, areia/vidro, ar etc.). Busca por nome/símbolo, filtro por categoria, alternância cal ↔ J e atalho "Usar na calculadora". |
| 6 | **Como Funciona** | Guia conceitual com 5 tópicos: grandezas fundamentais, calor sensível vs. latente (mudanças de fase), equilíbrio térmico, termoquímica & combustão e um exercício resolvido estilo ENEM. |

Extras: tema **claro/escuro** (salvo em `localStorage`), layout responsivo e visual próprio (rótulos "eyebrow" numerados em cada seção).

## 3. Stack técnica

- **React 19** + **Vite 7** (SPA, sem backend)
- **Vitest 3** para testes unitários; **ESLint 9** (com plugins de react-hooks e react-refresh)
- CSS puro em um único arquivo (`src/styles.css`), com variáveis para temas
- Nome do pacote: `termolab-calorimetria` (v1.0.0)

Comandos:

```bash
npm install     # dependências
npm run dev     # servidor de desenvolvimento
npm test        # testes (Vitest)
npm run lint    # ESLint
npm run build   # build de produção em dist/
```

## 4. Estrutura do código

```
siteQuimica/
├── index.html
├── package.json
├── eslint.config.js
├── README.md
├── dist/                      # build de produção já gerado
└── src/
    ├── main.jsx               # ponto de entrada
    ├── App.jsx                # raiz: navegação por abas, tema, calculadora, presets
    ├── styles.css             # design system, responsivo, claro/escuro
    ├── components/
    │   ├── Field.jsx              # campo de entrada reutilizável
    │   ├── EquilibrioTermico.jsx  # aba 2
    │   ├── CombustaoEtanol.jsx    # aba 3
    │   ├── CompararSubstancias.jsx# aba 4
    │   ├── TabelaMateriais.jsx    # aba 5
    │   └── ComoFunciona.jsx       # aba 6 (guia)
    ├── data/
    │   └── substancias.js     # materiais, combustíveis, constante 4,18 J/cal
    └── lib/
        ├── calorimetria.js        # lógica pura de cálculo (sem React)
        └── calorimetria.test.js   # 13 testes
```

### Decisões de arquitetura

- **Separação lógica/UI:** todo o cálculo vive em funções puras em `lib/calorimetria.js`, o que facilita testar e reutilizar. Principais funções: `solveHeat`, `thermalEquilibrium` (+ `thermalEquilibriumSteps`), `ethanolCombustion`, `compareSubstances`, `equivalentHeats`, `calculationSteps`, `formatFullResolutionText`, além de conversores (`convertHeat`, `convertMass`, `convertSpecificHeat`) e utilitários de entrada/formatação (`parseNumber` aceita vírgula decimal, `formatNumber`).
- **Dados separados:** materiais e combustíveis ficam em `data/substancias.js`, então adicionar uma substância é só incluir um objeto na lista.
- **Validação didática:** as funções retornam mensagens de erro em português (ex.: "a temperatura final deve ser maior que a inicial para combustão exotérmica", "a massa de água deve ser maior que zero").
- **Estado local:** sem biblioteca de estado; `useState` por aba e navegação por `activeTab`.

## 5. Conceitos científicos cobertos

- Calor sensível (`Q = m·c·ΔT`) e capacidade térmica (`C = m·c`)
- Calor específico e inércia térmica (a água, com c = 1 cal/g·°C, esquenta e esfria devagar)
- Processos endotérmicos (Q > 0) e exotérmicos (Q < 0)
- Equilíbrio térmico em sistema adiabático (`ΣQ = 0`)
- Calor latente / mudanças de fase (no guia conceitual)
- Entalpia de combustão (ΔH < 0), equação termoquímica do etanol:
  `C₂H₅OH(l) + 3 O₂(g) → 2 CO₂(g) + 3 H₂O(l)`
- Equivalência cal ↔ J (1 cal = 4,18 J) e rendimento de um experimento real vs. valor teórico

## 6. Observações sobre o estado do projeto

- O `README.md` original descreve 6 funcionalidades e as instruções de uso; este documento complementa com a visão de arquitetura e propósito.
- A pasta contém artefatos de depuração (`chrome.err`, `vite-debug.err`, `vite-debug.log`) que não fazem parte do produto e podem ser removidos.
- A pasta `dist/` já traz um build pronto (`index.html` + assets), então o site pode ser publicado em qualquer hospedagem estática.
- Pequena inconsistência de numeração: os rótulos "eyebrow" das seções não seguem a ordem das abas (ex.: Equilíbrio é "04", Combustão é "05", Guia "06", Comparar "07", Tabela "02").
- A aba chama-se "Combustão do Etanol", mas já suporta também metanol e butano.

## 7. Ideias de evolução

- Calor latente interativo (curva de aquecimento da água: gelo → líquido → vapor)
- Mais combustíveis e comparação lado a lado de poder calorífico
- Banco de exercícios estilo ENEM com correção automática
- Exportar resolução em PDF
- Mais testes para os componentes (hoje só a lógica de `lib/` é testada)
- Publicação (GitHub Pages / Netlify / Vercel)
