import { describe, it, expect } from 'vitest'
import { getUnitType, canConvert, convertUnits, formatUnitForDisplay } from '@/lib/conversions'

describe('getUnitType', () => {
  it('returns "peso" for weight units', () => {
    expect(getUnitType('kilogramo')).toBe('peso')
    expect(getUnitType('gramo')).toBe('peso')
    expect(getUnitType('libra')).toBe('peso')
    expect(getUnitType('onza')).toBe('peso')
  })

  it('returns "volumen" for volume units', () => {
    expect(getUnitType('litro')).toBe('volumen')
    expect(getUnitType('mililitro')).toBe('volumen')
  })

  it('returns null for non-convertible units', () => {
    expect(getUnitType('unidad')).toBeNull()
    expect(getUnitType('pack')).toBeNull()
    expect(getUnitType('caja')).toBeNull()
  })

  it('is case insensitive', () => {
    expect(getUnitType('Kilogramo')).toBe('peso')
    expect(getUnitType('LITRO')).toBe('volumen')
  })
})

describe('canConvert', () => {
  it('returns true for same type', () => {
    expect(canConvert('kilogramo', 'gramo')).toBe(true)
    expect(canConvert('litro', 'mililitro')).toBe(true)
  })

  it('returns false for different types', () => {
    expect(canConvert('kilogramo', 'litro')).toBe(false)
  })

  it('returns false when either unit is non-convertible', () => {
    expect(canConvert('kilogramo', 'unidad')).toBe(false)
    expect(canConvert('unidad', 'gramo')).toBe(false)
  })
})

describe('convertUnits', () => {
  it('converts between same unit', () => {
    expect(convertUnits(5, 'kilogramo', 'kilogramo')).toBe(5)
  })

  it('converts kg to g', () => {
    expect(convertUnits(2, 'kilogramo', 'gramo')).toBe(2000)
  })

  it('converts g to kg', () => {
    expect(convertUnits(500, 'gramo', 'kilogramo')).toBe(0.5)
  })

  it('converts lb to g', () => {
    const result = convertUnits(1, 'libra', 'gramo')
    expect(result).toBeCloseTo(453.592, 3)
  })

  it('converts L to mL', () => {
    expect(convertUnits(3, 'litro', 'mililitro')).toBe(3000)
  })

  it('converts mL to L', () => {
    expect(convertUnits(1500, 'mililitro', 'litro')).toBe(1.5)
  })

  it('returns null for incompatible types', () => {
    expect(convertUnits(1, 'kilogramo', 'litro')).toBeNull()
  })

  it('returns null for non-convertible units', () => {
    expect(convertUnits(1, 'unidad', 'pack')).toBeNull()
  })

  it('returns null for unknown unit', () => {
    expect(convertUnits(1, 'kilogramo', 'unknown')).toBeNull()
  })

  it('handles zero value', () => {
    expect(convertUnits(0, 'kilogramo', 'gramo')).toBe(0)
  })

  it('handles fractional values', () => {
    expect(convertUnits(0.5, 'kilogramo', 'gramo')).toBe(500)
  })
})

describe('formatUnitForDisplay', () => {
  it('returns short form for known units', () => {
    expect(formatUnitForDisplay('kilogramo')).toBe('kg')
    expect(formatUnitForDisplay('gramo')).toBe('g')
    expect(formatUnitForDisplay('litro')).toBe('L')
    expect(formatUnitForDisplay('mililitro')).toBe('ml')
    expect(formatUnitForDisplay('unidad')).toBe('ud')
  })

  it('returns original for unknown units', () => {
    expect(formatUnitForDisplay('metro')).toBe('metro')
  })

  it('is case insensitive', () => {
    expect(formatUnitForDisplay('Kilogramo')).toBe('kg')
  })
})
