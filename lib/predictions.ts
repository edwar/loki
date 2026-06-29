export interface DailySalesPoint {
  date: Date
  amount: number
}

export interface PredictionResult {
  next7d: number
  next30d: number
  trend: 'up' | 'down' | 'stable'
  confidence: 'high' | 'medium' | 'low'
  rSquared: number
  slope: number
}

function linearRegression(data: { x: number; y: number }[]) {
  const n = data.length
  if (n < 2) return { slope: 0, intercept: 0, rSquared: 0 }

  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0, sumY2 = 0
  for (const p of data) {
    sumX += p.x
    sumY += p.y
    sumXY += p.x * p.y
    sumX2 += p.x * p.x
    sumY2 += p.y * p.y
  }

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX)
  const intercept = (sumY - slope * sumX) / n

  const ssRes = data.reduce((acc, p) => {
    const pred = slope * p.x + intercept
    return acc + (p.y - pred) ** 2
  }, 0)
  const ssTot = data.reduce((acc, p) => acc + (p.y - sumY / n) ** 2, 0)
  const rSquared = ssTot === 0 ? 0 : 1 - ssRes / ssTot

  return { slope, intercept, rSquared }
}

function weightedMovingAverage(data: number[], weights: number[]): number {
  if (data.length === 0) return 0
  const len = Math.min(data.length, weights.length)
  let sum = 0, weightSum = 0
  for (let i = 0; i < len; i++) {
    const w = weights[weights.length - 1 - i]
    sum += data[data.length - 1 - i] * w
    weightSum += w
  }
  return weightSum === 0 ? 0 : sum / weightSum
}

export function predictSales(dailySales: DailySalesPoint[]): PredictionResult {
  const clean = dailySales.filter(d => d.amount >= 0).sort((a, b) => a.date.getTime() - b.date.getTime())
  const n = clean.length

  if (n === 0) {
    return { next7d: 0, next30d: 0, trend: 'stable', confidence: 'low', rSquared: 0, slope: 0 }
  }

  const amounts = clean.map(d => d.amount)
  const avg = amounts.reduce((a, b) => a + b, 0) / n

  if (n === 1) {
    return { next7d: avg * 7, next30d: avg * 30, trend: 'stable', confidence: 'low', rSquared: 0, slope: 0 }
  }

  const regression = linearRegression(clean.map((d, i) => ({ x: i, y: d.amount })))
  const weights = [5, 4, 3, 2, 1]
  const wma = weightedMovingAverage(amounts, weights)

  const projectedDaily = (regression.slope * (n + 1) + regression.intercept + wma) / 2

  const next7d = Math.max(0, projectedDaily * 7)
  const next30d = Math.max(0, projectedDaily * 30)

  let trend: 'up' | 'down' | 'stable'
  const threshold = avg * 0.05
  if (regression.slope > threshold / (n / 2)) trend = 'up'
  else if (regression.slope < -threshold / (n / 2)) trend = 'down'
  else trend = 'stable'

  let confidence: 'high' | 'medium' | 'low'
  if (regression.rSquared > 0.7) confidence = 'high'
  else if (regression.rSquared > 0.4) confidence = 'medium'
  else confidence = 'low'

  return { next7d, next30d, trend, confidence, rSquared: regression.rSquared, slope: regression.slope }
}
