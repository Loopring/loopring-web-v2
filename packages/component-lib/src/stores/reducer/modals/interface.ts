import {
  CLAIM_TYPE,
  ClaimToken,
  DualViewInfo,
  NFTWholeINFO,
  TradeNFT,
  AmmPanelType,
  VaultAction,
} from '@loopring-web/common-resources'
import { ToastType } from '../../../components'
import * as sdk from '@loopring-web/loopring-sdk'

export enum ModalType {
  transfer = 'transfer',
  deposit = 'deposit',
  withdraw = 'withdraw',
}

export type ModalTypeKeys = keyof typeof ModalType

export type ModalStatePlayLoad = {
  isShow: boolean
  info?: { [key: string]: any }
}
export type Transaction = {
  symbol?: undefined | string
}
export type Contact = {
  name?: string
  address?: string
  addressType?: typeof sdk.AddressType
}

export interface ModalState {
  isShowSupport: ModalStatePlayLoad
  isShowNFTMetaNotReady: ModalStatePlayLoad
  isShowOtherExchange: ModalStatePlayLoad & {
    agree?: boolean
  }
  isWrongNetworkGuide: ModalStatePlayLoad
  isShowClaimWithdraw: ModalStatePlayLoad & {
    claimToken: ClaimToken | undefined
    claimType: CLAIM_TYPE | undefined
  }
  isShowTransfer: ModalStatePlayLoad & Transaction & Contact
  isShowWithdraw: ModalStatePlayLoad & Transaction & Contact
  isShowDeposit: ModalStatePlayLoad & Transaction & { partner?: boolean }
  isShowNFTDetail: ModalStatePlayLoad & Partial<NFTWholeINFO>
  isShowNFTTransfer: ModalStatePlayLoad & Partial<TradeNFT<any, any>> & Contact
  isShowNFTWithdraw: ModalStatePlayLoad & Partial<TradeNFT<any, any>> & Contact
  isShowNFTDeploy: ModalStatePlayLoad & Partial<TradeNFT<any, any>>
  isShowNFTDeposit: ModalStatePlayLoad & Partial<TradeNFT<any, any>>
  isShowNFTMintAdvance: ModalStatePlayLoad & Partial<TradeNFT<any, any>>
  isShowCollectionAdvance: ModalStatePlayLoad
  isShowDual: ModalStatePlayLoad & { dualInfo: DualViewInfo | undefined }
  isShowResetAccount: ModalStatePlayLoad
  isShowActiveAccount: ModalStatePlayLoad
  isShowExportAccount: ModalStatePlayLoad
  isShowLayerSwapNotice: ModalStatePlayLoad
  isShowAnotherNetwork: ModalStatePlayLoad
  isShowSwap: ModalStatePlayLoad
  isShowAmm: ModalStatePlayLoad & Transaction & { type?: AmmPanelType }
  isShowTradeIsFrozen: ModalStatePlayLoad & {
    type?: string
    messageKey?: string
  }
  isShowConnect: ModalStatePlayLoad & {
    step: number
    error?: sdk.RESULT_INFO
    info?: { [key: string]: any }
  }
  isShowAccount: ModalStatePlayLoad & {
    step: number
    error?: sdk.RESULT_INFO
    // info?: { [key: string]: any };
  }
  isShowRedPacket: ModalStatePlayLoad & {
    step: number
    // info?: { [key: string]: any };
  }
  isShowFeeSetting: ModalStatePlayLoad
  isShowIFrame: ModalStatePlayLoad & { url: string }
  isShowSideStakingRedeem: ModalStatePlayLoad & { symbol?: string }
  isShowGlobalToast: {
    isShow: boolean
    info: {
      id?: string
      messageKey?: string
      content?: string
      type: ToastType
    } & any
  }
  isShowVaultExit: ModalStatePlayLoad & Transaction
  isShowVaultJoin: ModalStatePlayLoad & Transaction
  isShowVaultSwap: ModalStatePlayLoad & Transaction
  isShowVaultLoan: ModalStatePlayLoad &
    Transaction & {
      type: string
    }
  isShowNoVaultAccount: ModalStatePlayLoad & { whichBtn: VaultAction | undefined }
}
