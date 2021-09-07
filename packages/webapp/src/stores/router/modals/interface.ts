export type WithdrawData = {
    belong: string | undefined,
    tradeValue: number,
    balance: number,
}

export type TransferData = {
    belong: string | undefined,
    tradeValue: number,
    balance: number,
    address: string,
}

export type DepositData = {
    belong: string | undefined,
    tradeValue: number,
    balance: number,
}

export type ModalDataStatus = {
    withdrawValue: WithdrawData,
    transferValue: TransferData,
    depositValue: DepositData,
}
