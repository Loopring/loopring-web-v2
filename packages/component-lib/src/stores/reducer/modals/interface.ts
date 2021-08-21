
export enum ModalType {
    transfer = 'transfer',
    deposit = 'deposit',
    withdraw = 'withdraw',
}

export type ModalTypeKeys = keyof typeof ModalType

export type ModalStatePlayLoad = {
    isShow: boolean,
}

export interface ModalState {
    isShowTransfer: ModalStatePlayLoad,
    isShowWithdraw: ModalStatePlayLoad,
    isShowDeposit: ModalStatePlayLoad,
    isShowResetAccount: ModalStatePlayLoad,
    isShowSwap: ModalStatePlayLoad,
    isShowAmm: ModalStatePlayLoad,
    isShowConnect: ModalStatePlayLoad & { step: number },
    isShowAccount: ModalStatePlayLoad & { step: number },
}
