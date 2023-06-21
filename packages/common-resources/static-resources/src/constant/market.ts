export enum FloatTag {
  increase = 'increase',
  decrease = 'decrease',
  none = 'none',
}

export type MarketType = `${string}-${string}`
export type AMMMarketType = `AMM-${string}-${string}`
export type LPTokenType = `LP-${string}-${string}`

export const PrecisionTree = {
  1: '0.1',
  2: '0.01',
  3: '0.001',
  4: '0.0001',
  5: '0.00001',
  6: '0.000001',
  7: '0.0000001',
  8: '0.00000001',
  9: '0.000000001',
  10: '0.0000000001',
  11: '0.00000000001',
  12: '0.000000000001',
}
