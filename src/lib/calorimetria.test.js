import { describe, expect, it } from 'vitest'
import {
  calculationSteps,
  compareSubstances,
  convertHeat,
  convertMass,
  convertSpecificHeat,
  ethanolCombustion,
  equivalentHeats,
  formatCalculatorNumber,
  formatInputValue,
  formatFullResolutionText,
  parseNumber,
  solveHeat,
  thermalEquilibrium,
  thermalEquilibriumSteps,
} from './calorimetria'

describe('calorimetria', () => {
  it('calcula Q negativo e isola grandezas', () => {
    expect(solveHeat({ unknown: 'q', q: '', m: '100', c: '1', deltaT: '-10' }).result).toBe(-1000)
    expect(solveHeat({ unknown: 'm', q: '1000', m: '', c: '1', deltaT: '10' }).result).toBe(100)
    expect(solveHeat({ unknown: 'c', q: '1000', m: '100', c: '', deltaT: '10' }).result).toBe(1)
    expect(solveHeat({ unknown: 'deltaT', q: '1000', m: '100', c: '1', deltaT: '' }).result).toBe(10)
  })

  it('preserva zero e rejeita divisão por zero', () => {
    expect(solveHeat({ unknown: 'q', q: '', m: '100', c: '1', deltaT: '0' }).result).toBe(0)
    expect(solveHeat({ unknown: 'deltaT', q: '0', m: '100', c: '1', deltaT: '' }).result).toBe(0)
    expect(solveHeat({ unknown: 'm', q: '10', m: '', c: '1', deltaT: '0' }).status).toBe('undetermined')
  })

  it('aceita vírgula, menos unicode e separadores de milhar brasileiros', () => {
    expect(parseNumber('−0,000123')).toBe(-0.000123)
    expect(parseNumber('  12,5 ')).toBe(12.5)
    expect(parseNumber('1.250,5')).toBe(1250.5)
    expect(parseNumber('1.000.000')).toBe(1000000)
    expect(parseNumber('2,500.75')).toBe(2500.75)
    expect(parseNumber('')).toBeNull()
    expect(parseNumber(null)).toBeNull()
  })

  it('formata valores de input sem pontos de milhar perigosos', () => {
    expect(formatInputValue(5000)).toBe('5000')
    expect(formatInputValue(12.5)).toBe('12,5')
    expect(formatInputValue(-30)).toBe('-30')
  })

  it('formata todos os números em notação científica matemática na calculadora', () => {
    expect(formatCalculatorNumber(1250000)).toBe('1,25·10⁶')
    expect(formatCalculatorNumber(-0.0000125)).toBe('-1,25·10⁻⁵')
    expect(formatCalculatorNumber(0)).toBe('0')
    expect(formatCalculatorNumber(1250)).toBe('1,25·10³')
    expect(formatCalculatorNumber(1)).toBe('1')
    expect(formatCalculatorNumber(1.25)).toBe('1,25')
  })

  it('detecta sinais incoerentes e valores não positivos', () => {
    expect(solveHeat({ unknown: 'm', q: '-10', m: '', c: '1', deltaT: '10' }).status).toBe('invalid')
    expect(solveHeat({ unknown: 'q', q: '', m: '-50', c: '1', deltaT: '10' }).status).toBe('invalid')
    expect(solveHeat({ unknown: 'q', q: '', m: '50', c: '0', deltaT: '10' }).status).toBe('invalid')
  })

  it('converte unidades de calor corretamente', () => {
    expect(convertHeat(1000, 'cal', 'kcal')).toBe(1)
    expect(convertHeat(2, 'kcal', 'cal')).toBe(2000)
    expect(convertHeat(1, 'cal', 'J')).toBeCloseTo(4.18, 2)
    expect(convertHeat(4.18, 'J', 'cal')).toBeCloseTo(1, 2)
    expect(convertHeat(1, 'kJ', 'J')).toBeCloseTo(1000, 2)
    expect(convertHeat(1, 'kcal', 'kJ')).toBeCloseTo(4.18, 2)
  })

  it('converte unidades de massa e calor específico', () => {
    expect(convertMass(500, 'g', 'kg')).toBe(0.5)
    expect(convertMass(2, 'kg', 'g')).toBe(2000)
    expect(convertSpecificHeat(1, 'cal/g·°C', 'J/g·°C')).toBeCloseTo(4.18, 2)
    expect(convertSpecificHeat(4.18, 'J/g·°C', 'cal/g·°C')).toBeCloseTo(1, 2)
  })

  it('equilibra corpos com conservação estrita de energia (soma de calores zero)', () => {
    const result = thermalEquilibrium({ m1: '100', c1: '1', t1: '20', m2: '100', c2: '0.22', t2: '80' })
    expect(result.equilibrium).toBeCloseTo(30.8197, 3)
    expect(result.sum).toBe(0)
    expect(result.q1).toBeGreaterThan(0) // corpo 1 aqueceu
    expect(result.q2).toBeLessThan(0) // corpo 2 esfriou

    const steps = thermalEquilibriumSteps({ m1: '100', c1: '1', t1: '20', m2: '100', c2: '0.22', t2: '80' })
    expect(steps.length).toBeGreaterThanOrEqual(5)
    expect(steps[0]).toContain('ΣQ = 0')
  })

  it('calcula combustão do etanol e aceita capacidade térmica do béquer', () => {
    const ethanol = ethanolCombustion({
      waterMass: '100',
      initialTemp: '25',
      finalTemp: '52',
      lampBefore: '150',
      lampAfter: '147.5',
    })
    expect(ethanol.heat).toBe(2700)
    expect(ethanol.burned).toBe(2.5)
    expect(ethanol.calPerGram).toBe(1080)
    expect(ethanol.kcalPerMol).toBeCloseTo(49.68, 1)

    // Com béquer de 50 g (c = 0.20 cal/g·°C)
    const withBeaker = ethanolCombustion({
      waterMass: '100',
      initialTemp: '25',
      finalTemp: '52',
      lampBefore: '150',
      lampAfter: '147.5',
      beakerMass: '50',
      beakerC: '0.20',
    })
    // Calor no béquer: 50 * 0.20 * 27 = 270 cal
    expect(withBeaker.beakerHeat).toBe(270)
    expect(withBeaker.heat).toBe(2970)
    expect(withBeaker.efficiency).toBeGreaterThan(ethanol.efficiency)
  })

  it('ordena comparação de substâncias por critérios diferentes', () => {
    const comparedAsc = compareSubstances('1000', '100', 'deltaTAsc')
    expect(comparedAsc[0].name).toContain('Água') // maior calor específico = menor deltaT

    const comparedDesc = compareSubstances('1000', '100', 'deltaTDesc')
    expect(comparedDesc[0].value).toBeLessThan(0.05) // menor calor específico (ouro ou chumbo) = maior deltaT
  })

  it('gera passos de cálculo legíveis e corretos sem caracteres corrompidos', () => {
    const steps = calculationSteps({
      unknown: 'q',
      values: { q: '', m: '200', c: '1', deltaT: '25' },
      result: 5000,
      qUnit: 'cal',
      mUnit: 'g',
      cUnit: 'cal/g·°C',
      formatValue: formatCalculatorNumber,
    })
    expect(steps[0]).toBe('Q = m · c · ΔT')
    expect(steps[2]).toContain('2·10² g')
    expect(steps[3]).toContain('Q = 5·10³ cal')
  })

  it('gera texto completo formatado para cópia de resolução', () => {
    const text = formatFullResolutionText({
      unknown: 'q',
      values: { q: '', m: '200', c: '1', deltaT: '25' },
      result: 5000,
      qUnit: 'cal',
      mUnit: 'g',
      cUnit: 'cal/g·°C',
      material: 'Água (líquida)',
      formatValue: formatCalculatorNumber,
    })
    expect(text).toContain('TermoLab — Resolução Calorimétrica')
    expect(text).toContain('Q = 5·10³ cal')
  })

  it('usa notação científica nos passos e na resolução copiada', () => {
    const options = {
      unknown: 'q',
      values: { q: '', m: '1000000000000', c: '1', deltaT: '0,000001' },
      result: 1000000,
      qUnit: 'cal',
      mUnit: 'g',
      cUnit: 'cal/g·°C',
      formatValue: formatCalculatorNumber,
    }

    expect(calculationSteps(options)[3]).toContain('Q = 1·10⁶')
    expect(formatFullResolutionText({
      ...options,
      material: 'Água (líquida)',
    })).toContain('Resultado Final: Q = 1·10⁶')
  })

  it('calcula equivalências térmicas', () => {
    const eq = equivalentHeats(1000)
    expect(eq.cal).toBe(1000)
    expect(eq.kcal).toBe(1)
    expect(eq.J).toBeCloseTo(4180, 0)
    expect(eq.kJ).toBeCloseTo(4.18, 2)
  })
})