export enum WithdrawType {
    Fast = 'Fast',
    Standard = 'Standard',
}

export const WithdrawTypes: {
    [P in keyof typeof WithdrawType]: string | number
} = {
    Fast: '',
    Standard: '',
}

export  type PriceTagType = '$' | '￥';

export enum PriceTag {
    Dollar = '$',
    Yuan = '￥'
}


export enum TradeTypes {
    Buy = 'Buy',
    Sell = 'Sell'
}

export enum TradeStatus {
    // Filled = 'Filled',
    // Cancelled = 'Cancelled',
    // Succeeded = 'Succeeded',
    Processing = 'processing',
    Processed = 'processed',
    Cancelling = 'cancelling',
    Cancelled = 'cancelled',
    Expired = 'expired',
    Waiting = 'waiting'
}

export interface TxInfo {
    hash: string,
    timestamp?:number |undefined,
    status?:'pending'|'success'|'failed'|undefined,
    // reason:'activeAccount'|'regular'|'reset'
}
// export interface accountHashInfo {
//     depositHashes: TxInfo[]
//     withdrawHashes: TxInfo[]
// }
// export type Address = string
export interface ChainHashInfos {
    depositHashes:{[key:string]:TxInfo[]},
    // withdrawHashes:{[key:string]:TxInfo[]},
}


export const EmptyValueTag = '--'



