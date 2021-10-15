export interface TxInfo {
    hash: string
}
export interface accountHashInfo {
    depositHashes: { [ key: string ]: TxInfo }
    withdrawHashes: { [ key: string ]: TxInfo }
}
export interface OnchainHashInfo {
    [key:string]: accountHashInfo
}
