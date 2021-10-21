
export enum ModalType {
    transfer = 'transfer',
    deposit = 'deposit',
    withdraw = 'withdraw',
}

export type ModalTypeKeys = keyof typeof ModalType

export type ModalStatePlayLoad = {
    isShow: boolean,
}
export type Transaction = {
    symbol?: undefined|string,
}

export interface ModalState {
    isShowSupport: ModalStatePlayLoad,
    isShowTransfer: ModalStatePlayLoad & Transaction,
    isShowWithdraw: ModalStatePlayLoad & Transaction,
    isShowDeposit: ModalStatePlayLoad & Transaction,
    isShowResetAccount: ModalStatePlayLoad,
    isShowExportAccount: ModalStatePlayLoad,
    isShowSwap: ModalStatePlayLoad,
    isShowAmm: ModalStatePlayLoad,
    isShowConnect: ModalStatePlayLoad & { step: number },
    isShowAccount: ModalStatePlayLoad & { step: number },
    isShowFeeSetting: ModalStatePlayLoad,
    isShowIFrame: ModalStatePlayLoad & { url: string },

}
