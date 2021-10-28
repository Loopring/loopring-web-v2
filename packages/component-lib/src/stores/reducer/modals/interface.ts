import { NFTWholeINFO } from '@loopring-web/webapp/src/api_wrapper';

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
// export type TransactionNFT =  NFTWholeINFO
//     {
//     nftData?: undefined|string,
//     nftType?:NFTType|undefined,
// }

export interface ModalState {
    isShowSupport: ModalStatePlayLoad,
    isShowTransfer: ModalStatePlayLoad & Transaction,
    isShowWithdraw: ModalStatePlayLoad & Transaction,
    isShowDeposit: ModalStatePlayLoad & Transaction,
    isShowNFTTransfer: ModalStatePlayLoad & Partial<NFTWholeINFO>,
    isShowNFTWithdraw: ModalStatePlayLoad & Partial<NFTWholeINFO>,
    isShowNFTDeposit: ModalStatePlayLoad & Partial<NFTWholeINFO>,
    isShowResetAccount: ModalStatePlayLoad,
    isShowExportAccount: ModalStatePlayLoad,
    isShowSwap: ModalStatePlayLoad,
    isShowAmm: ModalStatePlayLoad,
    isShowConnect: ModalStatePlayLoad & { step: number },
    isShowAccount: ModalStatePlayLoad & { step: number },
    isShowFeeSetting: ModalStatePlayLoad,
    isShowIFrame: ModalStatePlayLoad & { url: string },

}
