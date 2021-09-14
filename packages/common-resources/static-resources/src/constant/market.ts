export enum FloatTag {
    increase = 'increase',
    decrease = 'decrease',
    none = 'none'
}

export type MarketType = `${string}-${string}`
export type AMMMarketType = `AMM-${string}-${string}`
export type LPTokenType = `LP-${string}-${string}`