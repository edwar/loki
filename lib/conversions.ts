export const CONVERSION_FACTORS: Record<string, Record<string, number>> = {
  peso: {
    kilogramo: 1000,
    gramo: 1,
    libra: 453.592,
    onza: 28.3495,
  },
  volumen: {
    litro: 1000,
    mililitro: 1,
  }
}

export function getUnitType(unit: string): string | null {
  const u = unit.toLowerCase()
  if (['kilogramo', 'gramo', 'libra', 'onza'].includes(u)) return 'peso'
  if (['litro', 'mililitro'].includes(u)) return 'volumen'
  return null
}

export function canConvert(fromUnit: string, toUnit: string): boolean {
  const fromType = getUnitType(fromUnit)
  const toType = getUnitType(toUnit)
  return fromType !== null && fromType === toType
}

export function convertUnits(value: number, fromUnit: string, toUnit: string): number | null {
  if (!canConvert(fromUnit, toUnit)) return null
  
  const type = getUnitType(fromUnit)
  if (!type || !CONVERSION_FACTORS[type]) return null
  
  const fromFactor = CONVERSION_FACTORS[type][fromUnit.toLowerCase()]
  const toFactor = CONVERSION_FACTORS[type][toUnit.toLowerCase()]
  
  if (fromFactor === undefined || toFactor === undefined) return null
  
  const baseValue = value * fromFactor
  return baseValue / toFactor
}

export function formatUnitForDisplay(unit: string): string {
  const unitMap: Record<string, string> = {
    kilogramo: 'kg',
    gramo: 'g',
    libra: 'lb',
    onza: 'oz',
    litro: 'L',
    mililitro: 'ml',
    unidad: 'ud',
    pack: 'pack',
    caja: 'caja',
    bolsa: 'bolsa'
  }
  return unitMap[unit.toLowerCase()] || unit
}