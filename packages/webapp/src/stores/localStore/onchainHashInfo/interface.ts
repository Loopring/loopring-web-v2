export interface TxInfo {
    hash: string
}

export interface OnchainHashInfo {
    depositHashes: { [key: string]: TxInfo }
    withdrawHashes: { [key: string]: TxInfo }
}
