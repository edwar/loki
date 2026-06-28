export function deriveCostPerUnit(salePrice: number, profitMargin: number): number {
  if (salePrice <= 0 || profitMargin <= 0) return 0
  if (profitMargin >= 100) return 0
  return salePrice * (1 - profitMargin / 100)
}

export function calculateMargin(salePrice: number, costPerUnit: number): number {
  if (salePrice <= 0 || costPerUnit <= 0) return 0
  return ((salePrice - costPerUnit) / salePrice) * 100
}

export function calculateSalePrice(costPerUnit: number, profitMargin: number): number {
  if (costPerUnit <= 0) return 0
  if (profitMargin >= 100) return Infinity
  return costPerUnit / (1 - profitMargin / 100)
}

export function calculateRentabilidad(salePrice: number, costPerUnit: number): number {
  if (costPerUnit <= 0) return 0
  return ((salePrice - costPerUnit) / costPerUnit) * 100
}

export function calculateUnitCost(recipeCost: number, yieldAmount: number): number {
  if (yieldAmount <= 0) return 0
  return recipeCost / yieldAmount
}

export function getDisplayPrice(
  salePrice: number,
  unitCost: number,
  profitMargin: number
): number {
  return salePrice > 0 ? salePrice : calculateSalePrice(unitCost, profitMargin)
}

export function getDisplayMargin(
  salePrice: number,
  unitCost: number,
  profitMargin: number
): number {
  return salePrice > 0 && unitCost > 0
    ? calculateMargin(salePrice, unitCost)
    : profitMargin
}
