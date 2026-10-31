import { COMBUSTIVEIS, JOULES_PER_CAL, TABELA_SUBSTANCIAS } from '../data/substancias'

/**
 * Converte qualquer entrada em número finito.
 * Lida com segurança com formatos brasileiros (vírgula decimal, ponto de milhar),
 * formatos internacionais (ponto decimal, vírgula de milhar) e sinal menos unicode.
 */
export function parseNumber(value) {
  if (value === '' || value === null || value === undefined) return null
  let str = String(value).replaceAll('−', '-').trim()

  // Se contiver tanto ponto quanto vírgula (ex.: "1.250,5" ou "1,250.5")
  if (str.includes('.') && str.includes(',')) {
    const firstDot = str.indexOf('.')
    const firstComma = str.indexOf(',')
    if (firstDot < firstComma) {
      // Formato brasileiro: 1.250,5 -> remove pontos de milhar, substitui vírgula por ponto
      str = str.replaceAll('.', '').replace(',', '.')
    } else {
      // Formato internacional: 1,250.5 -> remove vírgulas de milhar
      str = str.replaceAll(',', '')
    }
  } else if (str.includes(',')) {
    // Formato com vírgula decimal apenas: "12,5" -> "12.5"
    const commaCount = (str.match(/,/g) || []).length
    if (commaCount > 1) {
      str = str.replaceAll(',', '')
    } else {
      str = str.replace(',', '.')
    }
  } else if (str.includes('.')) {
    // Se tiver múltiplos pontos de milhar, ex: "1.000.000"
    const dotCount = (str.match(/\./g) || []).length
    if (dotCount > 1) {
      str = str.replaceAll('.', '')
    }
  }

  const number = Number(str)
  return Number.isFinite(number) ? number : null
}

/**
 * Formata um número para exibição de texto com separadores locais (pt-BR).
 */
export function formatNumber(value, options = {}) {
  if (!Number.isFinite(value)) return '-'
  return new Intl.NumberFormat('pt-BR', {
    maximumSignificantDigits: options.maximumSignificantDigits ?? 7,
    ...options,
  }).format(value)
}

export function formatCalculatorNumber(value) {
  if (!Number.isFinite(value)) return '-'
  if (value === 0) return '0'

  const parts = new Intl.NumberFormat('pt-BR', {
    notation: 'scientific',
    maximumSignificantDigits: 7,
  }).formatToParts(value)
  const mantissa = parts
    .filter(({ type }) => ['minusSign', 'integer', 'decimal', 'fraction'].includes(type))
    .map(({ value: part }) => part)
    .join('')
  const exponent = parts.find(({ type }) => type === 'exponentInteger')?.value
  if (exponent === '0') return formatNumber(value)

  const exponentSign = parts.find(({ type }) => type === 'exponentMinusSign')?.value === '-'
    ? '⁻'
    : parts.find(({ type }) => type === 'exponentPlusSign')?.value === '+'
      ? '⁺'
      : ''
  const superscriptDigits = { 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹' }
  const superscriptExponent = [...(exponent ?? '')]
    .map((digit) => superscriptDigits[digit] ?? digit)
    .join('')

  return `${mantissa}·10${exponentSign}${superscriptExponent}`
}

/**
 * Formata um número para inserção em campos de formulário (<input>),
 * sem separadores de milhar para evitar conflitos de digitação.
 */
export function formatInputValue(value) {
  if (!Number.isFinite(value)) return ''
  const str = String(value)
  if (str.includes('e')) {
    return value.toLocaleString('pt-BR', { useGrouping: false, maximumFractionDigits: 6 })
  }
  return str.replace('.', ',')
}

const HEAT_FACTORS = {
  cal: 1,
  kcal: 1000,
  J: 1 / JOULES_PER_CAL,
  kJ: 1000 / JOULES_PER_CAL,
}

export function convertHeat(value, from, to) {
  if (!Number.isFinite(value)) return value
  if (from === to) return value
  const valueInCal = value * (HEAT_FACTORS[from] ?? 1)
  return valueInCal / (HEAT_FACTORS[to] ?? 1)
}

export function convertMass(value, from, to) {
  if (!Number.isFinite(value)) return value
  if (from === to) return value
  if (from === 'kg' && to === 'g') return value * 1000
  if (from === 'g' && to === 'kg') return value / 1000
  return value
}

export function convertSpecificHeat(value, from, to) {
  if (!Number.isFinite(value)) return value
  if (from === to) return value
  if (from === 'cal/g·°C' && to === 'J/g·°C') return value * JOULES_PER_CAL
  if (from === 'J/g·°C' && to === 'cal/g·°C') return value / JOULES_PER_CAL
  return value
}

/**
 * Resolução da equação fundamental da calorimetria: Q = m · c · ΔT
 */
export function solveHeat({ unknown, q, m, c, deltaT }) {
  const values = {
    q: parseNumber(q),
    m: parseNumber(m),
    c: parseNumber(c),
    deltaT: parseNumber(deltaT),
  }
  const known = Object.entries(values).filter(([key]) => key !== unknown)
  if (known.some(([, value]) => value === null)) return { status: 'incomplete' }

  if (unknown !== 'm' && values.m !== null && values.m <= 0) {
    return { status: 'invalid', message: 'A massa (m) deve ser estritamente positiva (> 0).' }
  }
  if (unknown !== 'c' && values.c !== null && values.c <= 0) {
    return { status: 'invalid', message: 'O calor específico (c) deve ser estritamente positivo (> 0).' }
  }
  if ((unknown === 'm' || unknown === 'c') && values.deltaT === 0) {
    return { status: 'undetermined', message: 'Não é possível determinar: o corpo não variou de temperatura (ΔT = 0).' }
  }

  const result = unknown === 'q'
    ? values.m * values.c * values.deltaT
    : unknown === 'm'
      ? values.q / (values.c * values.deltaT)
      : unknown === 'c'
        ? values.q / (values.m * values.deltaT)
        : values.q / (values.m * values.c)

  if ((unknown === 'm' || unknown === 'c') && result <= 0) {
    return {
      status: 'invalid',
      message: 'Resultado físico incoerente: Q e ΔT precisam ter o mesmo sinal (calor absorvido aquece; calor cedido resfria).',
    }
  }

  return { status: 'ok', result, values }
}

/**
 * Simulação de Equilíbrio Térmico entre dois corpos em calorímetro ideal:
 * Q₁ + Q₂ = 0
 */
export function thermalEquilibrium({ m1, c1, t1, m2, c2, t2 }) {
  const values = [m1, c1, t1, m2, c2, t2].map(parseNumber)
  if (values.some((value) => value === null) || values.some((value, index) => [0, 1, 3, 4].includes(index) && value <= 0)) {
    return null
  }

  const [mass1, specific1, temp1, mass2, specific2, temp2] = values
  const cap1 = mass1 * specific1
  const cap2 = mass2 * specific2
  const totalCapacity = cap1 + cap2
  if (totalCapacity === 0) return null

  const equilibrium = (cap1 * temp1 + cap2 * temp2) / totalCapacity
  const q1 = cap1 * (equilibrium - temp1)
  const q2 = cap2 * (equilibrium - temp2)

  const minTemp = Math.min(temp1, temp2)
  const maxTemp = Math.max(temp1, temp2)
  const equilibriumPercentage = maxTemp === minTemp
    ? 50
    : Math.max(0, Math.min(100, ((equilibrium - minTemp) / (maxTemp - minTemp)) * 100))

  const sum = Math.abs(q1 + q2) < 1e-9 ? 0 : q1 + q2

  return {
    equilibrium,
    q1,
    q2,
    sum,
    temp1,
    temp2,
    cap1,
    cap2,
    minTemp,
    maxTemp,
    equilibriumPercentage,
    heatExchanged: Math.abs(q1),
  }
}

/**
 * Passos algébricos da dedução do equilíbrio térmico
 */
export function thermalEquilibriumSteps({ m1, c1, t1, m2, c2, t2 }) {
  const data = thermalEquilibrium({ m1, c1, t1, m2, c2, t2 })
  if (!data) return []

  const mass1 = parseNumber(m1)
  const specific1 = parseNumber(c1)
  const temp1 = parseNumber(t1)
  const mass2 = parseNumber(m2)
  const specific2 = parseNumber(c2)
  const temp2 = parseNumber(t2)

  return [
    'Conservação de Energia: ΣQ = 0 ⟹ Q₁ + Q₂ = 0 (calorímetro ideal)',
    `Equação de Troca: [m₁ · c₁ · (Teq − T₁)] + [m₂ · c₂ · (Teq − T₂)] = 0`,
    `Capacidades Térmicas: C₁ = ${formatNumber(data.cap1)} cal/°C  |  C₂ = ${formatNumber(data.cap2)} cal/°C`,
    `Isolamento Algébrico: Teq = (C₁ · T₁ + C₂ · T₂) / (C₁ + C₂)`,
    `Substituição: Teq = [(${formatNumber(data.cap1)} · ${formatNumber(temp1)}) + (${formatNumber(data.cap2)} · ${formatNumber(temp2)})] / (${formatNumber(data.cap1)} + ${formatNumber(data.cap2)})`,
    `Temperatura de Equilíbrio: Teq = ${formatNumber(data.equilibrium)} °C`,
    `Verificação de Trocas: Q₁ = ${formatNumber(data.q1)} cal  e  Q₂ = ${formatNumber(data.q2)} cal (Soma = ${formatNumber(data.sum)} cal ✓)`,
  ]
}

/**
 * Experimento de Combustão (Calorimetria didática de bancada)
 */
export function ethanolCombustion({
  waterMass,
  initialTemp,
  finalTemp,
  lampBefore,
  lampAfter,
  fuelId = 'etanol',
  beakerMass = 0,
  beakerC = 0.20,
}) {
  const values = [waterMass, initialTemp, finalTemp, lampBefore, lampAfter].map(parseNumber)
  if (values.some((value) => value === null)) return null

  const [mass, ti, tf, before, after] = values
  if (mass <= 0) return { error: 'A massa de água deve ser maior que zero (m > 0).' }
  if (tf <= ti) return { error: 'A temperatura final (Tf) deve ser maior que a inicial (Ti) para combustão exotérmica.' }
  if (before <= after) return { error: 'A massa inicial da lamparina deve ser maior que a final (houve queima de combustível).' }
  if (after < 0) return { error: 'A massa final da lamparina não pode ser negativa.' }

  const fuel = COMBUSTIVEIS.find((c) => c.id === fuelId) || COMBUSTIVEIS[0]

  const deltaT = tf - ti
  const burned = before - after

  // Calor absorvido pela água (c_água = 1 cal/g·°C)
  const waterHeat = mass * deltaT

  // Calor absorvido pelo béquer de vidro (se configurado)
  const bMass = parseNumber(beakerMass) || 0
  const bC = parseNumber(beakerC) || 0.20
  const beakerHeat = bMass * bC * deltaT

  const totalHeatAbsorbed = waterHeat + beakerHeat

  // Poder calorífico experimental obtido (cal/g)
  const calPerGram = totalHeatAbsorbed / burned

  // Entalpia molar experimental (kcal/mol)
  const molarMass = fuel.molarMass
  const kcalPerMol = (calPerGram * molarMass) / 1000
  const kJPerMol = kcalPerMol * JOULES_PER_CAL

  const theoreticalKcal = fuel.deltaHKcal
  const theoreticalKJ = fuel.deltaHKJ
  const efficiency = (kcalPerMol / theoreticalKcal) * 100

  return {
    fuel,
    deltaT,
    burned,
    waterHeat,
    beakerHeat,
    heat: totalHeatAbsorbed,
    calPerGram,
    kcalPerMol,
    kJPerMol,
    theoreticalKcal,
    theoreticalKJ,
    efficiency,
  }
}

/**
 * Comparação de variação de temperatura (ΔT) entre todas as substâncias
 * submetidas à mesma quantidade de calor Q e massa idêntica m
 */
export function compareSubstances(q, mass, sortBy = 'deltaTAsc') {
  const heat = parseNumber(q)
  const massValue = parseNumber(mass)
  if (heat === null || massValue === null || massValue <= 0) return []

  const list = TABELA_SUBSTANCIAS.map((item) => {
    const deltaT = heat / (massValue * item.value)
    const capacity = massValue * item.value
    return {
      ...item,
      deltaT,
      capacity,
    }
  })

  if (sortBy === 'deltaTDesc') {
    return list.sort((a, b) => Math.abs(b.deltaT) - Math.abs(a.deltaT))
  }
  if (sortBy === 'name') {
    return list.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'))
  }
  if (sortBy === 'capacityDesc') {
    return list.sort((a, b) => b.value - a.value)
  }
  // Padrão: menor variação térmica primeiro (maior inércia térmica)
  return list.sort((a, b) => Math.abs(a.deltaT) - Math.abs(b.deltaT))
}

/**
 * Equivalências de energia térmica (cal, kcal, J, kJ)
 */
export function equivalentHeats(valueInCal) {
  if (!Number.isFinite(valueInCal)) return null
  return {
    cal: valueInCal,
    kcal: valueInCal / 1000,
    J: valueInCal * JOULES_PER_CAL,
    kJ: (valueInCal * JOULES_PER_CAL) / 1000,
  }
}

/**
 * Passos didáticos detalhados da resolução algébrica da equação fundamental
 */
export function calculationSteps({
  unknown,
  values,
  result,
  qUnit = 'cal',
  mUnit = 'g',
  cUnit = 'cal/g·°C',
  formatValue = formatNumber,
}) {
  const q = parseNumber(values.q)
  const m = parseNumber(values.m)
  const c = parseNumber(values.c)
  const deltaT = parseNumber(values.deltaT)

  // Conversão para unidades de base: cal, g, cal/g·°C
  const qCal = qUnit === 'cal' ? q : q === null ? null : convertHeat(q, qUnit, 'cal')
  const massG = mUnit === 'g' ? m : m === null ? null : convertMass(m, mUnit, 'g')
  const cCal = cUnit === 'cal/g·°C' ? c : c === null ? null : convertSpecificHeat(c, cUnit, 'cal/g·°C')

  const shown = (value, unit = '') => (value === null ? '?' : `${formatValue(value)}${unit ? ' ' + unit : ''}`)

  const formulas = {
    q: 'Q = m · c · ΔT',
    m: 'm = Q / (c · ΔT)',
    c: 'c = Q / (m · ΔT)',
    deltaT: 'ΔT = Q / (m · c)',
  }

  const isolation = formulas[unknown] ?? 'Q = m · c · ΔT'

  // Etapa de identificação dos dados e conversões necessárias
  let conversionNotice = 'Dados na base padrão de cálculo: cal, g, cal/g·°C e °C.'
  const conversionParts = []
  if (unknown !== 'q' && q !== null && qUnit !== 'cal') {
    conversionParts.push(`Q = ${formatValue(q)} ${qUnit} ⟹ ${formatValue(qCal)} cal`)
  }
  if (unknown !== 'm' && m !== null && mUnit !== 'g') {
    conversionParts.push(`m = ${formatValue(m)} ${mUnit} ⟹ ${formatValue(massG)} g`)
  }
  if (unknown !== 'c' && c !== null && cUnit !== 'cal/g·°C') {
    conversionParts.push(`c = ${formatValue(c)} ${cUnit} ⟹ ${formatValue(cCal)} cal/g·°C`)
  }
  if (conversionParts.length > 0) {
    conversionNotice = `Conversão de unidades: ${conversionParts.join('  |  ')}`
  }

  // Substituição algébrica
  let substitution = ''
  if (unknown === 'q') {
    substitution = `Q = (${shown(massG)} g) · (${shown(cCal)} cal/g·°C) · (${shown(deltaT)} °C)`
  } else if (unknown === 'm') {
    substitution = `m = (${shown(qCal)} cal) / [(${shown(cCal)} cal/g·°C) · (${shown(deltaT)} °C)]`
  } else if (unknown === 'c') {
    substitution = `c = (${shown(qCal)} cal) / [(${shown(massG)} g) · (${shown(deltaT)} °C)]`
  } else if (unknown === 'deltaT') {
    substitution = `ΔT = (${shown(qCal)} cal) / [(${shown(massG)} g) · (${shown(cCal)} cal/g·°C)]`
  }

  // Cálculo do valor na base padrão
  let baseResultText = ''
  if (result !== null) {
    if (unknown === 'q') {
      const qBase = (massG ?? 0) * (cCal ?? 0) * (deltaT ?? 0)
      baseResultText = `Cálculo na base: Q = ${formatValue(qBase)} cal`
    } else if (unknown === 'm') {
      const mBase = (qCal ?? 0) / ((cCal ?? 1) * (deltaT ?? 1))
      baseResultText = `Cálculo na base: m = ${formatValue(mBase)} g`
    } else if (unknown === 'c') {
      const cBase = (qCal ?? 0) / ((massG ?? 1) * (deltaT ?? 1))
      baseResultText = `Cálculo na base: c = ${formatValue(cBase)} cal/g·°C`
    } else if (unknown === 'deltaT') {
      const dtBase = (qCal ?? 0) / ((massG ?? 1) * (cCal ?? 1))
      baseResultText = `Cálculo na base: ΔT = ${formatValue(dtBase)} °C`
    }
  }

  // Resposta final na unidade selecionada pelo usuário
  const unitLabel = unknown === 'q' ? qUnit : unknown === 'm' ? mUnit : unknown === 'c' ? cUnit : '°C'
  const symbolLabel = unknown === 'deltaT' ? 'ΔT' : unknown === 'q' ? 'Q' : unknown
  const finalResultText = result === null
    ? 'Aguardando preenchimento completo dos campos.'
    : `${symbolLabel} = ${formatValue(result)} ${unitLabel}`

  const steps = [isolation, conversionNotice, substitution]
  if (baseResultText) {
    // Se a unidade escolhida for diferente da base, mostra tanto a base quanto o valor final convertido
    const isCustomUnit = (unknown === 'q' && qUnit !== 'cal') ||
      (unknown === 'm' && mUnit !== 'g') ||
      (unknown === 'c' && cUnit !== 'cal/g·°C')
    if (isCustomUnit) {
      steps.push(baseResultText)
      steps.push(`Conversão para a unidade selecionada: ${finalResultText}`)
    } else {
      steps.push(finalResultText)
    }
  } else {
    steps.push(finalResultText)
  }

  return steps
}

/**
 * Gera texto completo e legível para cópia da resolução (útil para relatórios e listas de exercícios)
 */
export function formatFullResolutionText({
  unknown,
  values,
  result,
  qUnit,
  mUnit,
  cUnit,
  material,
  formatValue = formatNumber,
}) {
  const steps = calculationSteps({ unknown, values, result, qUnit, mUnit, cUnit, formatValue })
  const unitLabel = unknown === 'q' ? qUnit : unknown === 'm' ? mUnit : unknown === 'c' ? cUnit : '°C'
  const symbolLabel = unknown === 'deltaT' ? 'ΔT' : unknown === 'q' ? 'Q' : unknown

  return [
    '=========================================',
    '  TermoLab — Resolução Calorimétrica',
    '=========================================',
    `Incógnita: ${symbolLabel} (${unitLabel})`,
    material ? `Material de referência: ${material}` : null,
    '-----------------------------------------',
    'Dados informados:',
    unknown !== 'q' ? `  Q = ${values.q || '?'} ${qUnit}` : null,
    unknown !== 'm' ? `  m = ${values.m || '?'} ${mUnit}` : null,
    unknown !== 'c' ? `  c = ${values.c || '?'} ${cUnit}` : null,
    unknown !== 'deltaT' ? `  ΔT = ${values.deltaT || '?'} °C` : null,
    '-----------------------------------------',
    'Resolução Passo a Passo:',
    ...steps.map((s, idx) => `  ${idx + 1}. ${s}`),
    '-----------------------------------------',
    `Resultado Final: ${symbolLabel} = ${formatValue(result)} ${unitLabel}`,
    '=========================================',
  ].filter(Boolean).join('\n')
}
