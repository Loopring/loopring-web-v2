import * as sdk from '@loopring-web/loopring-sdk'
import { NFTTokenInfo, UserNFTBalanceInfo, XOR } from '@loopring-web/loopring-sdk'
import {
  BanxaOrder,
  CLAIM_TYPE,
  CollectionMeta,
  FeeInfo,
  IBData,
  MintTradeNFT,
  NFTMETA,
  NFTWholeINFO,
  RedPacketOrderData,
  TRADE_TYPE,
  TradeNFT,
  WithdrawType,
} from '@loopring-web/common-resources'
import { WalletLayer2Map } from '../../walletLayer2'

export type WithdrawData<T = any> = IBData<T> & {
  // belong: string | undefined;
  // tradeValue: number | undefined;
  // balance: number | undefined;
  address: string | undefined
  fee: FeeInfo | undefined
  withdrawType: WithdrawType
}
export type ForceWithdrawData = {
  belong: string | undefined
  tradeValue: number | undefined
  balance: number | undefined
  // requesterAddress: string | undefined;
  withdrawAddress: string | undefined
  fee: FeeInfo | undefined
}

export type TransferData = {
  belong: string | undefined
  tradeValue: number | undefined
  balance: number | undefined
  address: string | undefined
  memo: string | undefined
  fee: FeeInfo | undefined
  __request__: sdk.OriginTransferRequestV3 | undefined
}

export type ClaimData = {
  belong: string | undefined
  tradeValue: number | undefined
  balance: number | undefined
  fee: FeeInfo | undefined
  address: string | undefined
  volume: string | undefined
  tradeType: TRADE_TYPE
  claimType: CLAIM_TYPE
  __request__: sdk.OriginLuckTokenWithdrawsRequestV3 | undefined
  successCallback?: () => void
} & XOR<
  {
    tradeType: TRADE_TYPE.TOKEN
  },
  {
    tradeType: TRADE_TYPE.NFT
    tokenId: number
    nftData: string
    tokenAddress: string
  }
>

export type DepositData = {
  belong: string | undefined
  tradeValue: number | undefined
  balance: number | undefined
  toAddress?: string
  addressError?: { error: boolean; message?: string | undefined }
}
export type MintData = {
  tokenAddress: string | undefined
  tradeValue: number | undefined
  memo: string | undefined
  fee: FeeInfo | undefined
}

export type ActiveAccountData = {
  chargeFeeList: FeeInfo[]
  fee?: FeeInfo
  isFeeNotEnough?: {
    isFeeNotEnough: boolean
    isOnLoading: boolean
  }
  walletLayer2: WalletLayer2Map<any> | undefined
  referral: string | number | undefined
}
export type NFT_MINT_VALUE<I> = {
  mintData: Partial<MintTradeNFT<I>>
  nftMETA: Partial<NFTMETA>
  collection?: Partial<CollectionMeta>
  error?: undefined | sdk.RESULT_INFO
}

export type ModalDataStatus = {
  lastStep: LAST_STEP
  withdrawValue: WithdrawData
  transferValue: TransferData
  transferRampValue: TransferData
  transferBanxaValue: TransferData
  depositValue: DepositData
  activeAccountValue: ActiveAccountData
  forceWithdrawValue: ForceWithdrawData
  nftWithdrawValue: WithdrawData & Partial<NFTTokenInfo & UserNFTBalanceInfo & NFTWholeINFO>
  nftTransferValue: TransferData & Partial<NFTTokenInfo & UserNFTBalanceInfo & NFTWholeINFO>
  nftDepositValue: TradeNFT<any, any>
  nftMintAdvanceValue: TradeNFT<any, any>
  collectionAdvanceValue: Partial<CollectionMeta>
  collectionValue: Partial<CollectionMeta>
  nftMintValue: NFT_MINT_VALUE<any>
  nftDeployValue: TradeNFT<any, any> & { broker: string }
  offBanxaValue: BanxaOrder | undefined
  offRampValue:
    | Partial<{
        offRampPurchase?: undefined
        send?: {
          assetSymbol: string
          amount: string
          destinationAddress: string
        }
      }>
    | undefined
  redPacketOrder: RedPacketOrderData<any>
  claimValue: ClaimData
}

export enum LAST_STEP {
  withdraw = 'withdraw',
  transfer = 'transfer',
  deposit = 'deposit',
  nftWithdraw = 'nftWithdraw',
  nftTransfer = 'nftTransfer',
  nftDeposit = 'nftDeposit',
  nftDeploy = 'nftDeploy',
  nftMint = 'nftMint',
  nftMintAdv = 'nftMintAdv',
  forceWithdraw = 'forceWithdraw',
  collectionAdv = 'collectionAdv',
  offRamp = 'offRamp',
  offBanxa = 'offBanxa',
  offRampTrans = 'offRampTrans',
  redPacketSend = 'redPacketSend',
  claim = 'claim',
  default = 'default',
}
