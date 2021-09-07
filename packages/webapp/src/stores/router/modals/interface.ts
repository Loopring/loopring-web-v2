export type WithdrawData = {
    belong: string | undefined,
    tradeValue: number,
    balance: number,
}

export type TransferData = {
}

export type DepositData = {
}

export type ModalDataStatus = {
    withdrawValue: WithdrawData,
    transferValue?: TransferData,
    depositValue?: DepositData,
}
