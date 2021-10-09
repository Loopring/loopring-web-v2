export enum UpColor {
    green = 'green',
    red = 'red'
}

// export enum Currency {
//     dollar =  Currency.usd,
//     yen = 'CNY',
// }

export const SlippageTolerance: Array<0.1 | 0.5 | 1 | string> = [0.1, 0.5, 1];
export const RowConfig = {
    rowHeight:44,
    rowHeaderHeight:44,
}
export const FeeChargeOrderDefault = ['ETH','USDT','LRC','DAI','USDC'];