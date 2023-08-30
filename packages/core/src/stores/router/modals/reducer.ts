import { createSlice, PayloadAction, Slice } from '@reduxjs/toolkit'
import {
  ActiveAccountData,
  ClaimData,
  DepositData,
  ForceWithdrawData,
  LAST_STEP,
  ModalDataStatus,
  NFT_MINT_VALUE,
  TransferData,
  WithdrawData,
} from './interface'
import {
  BanxaOrder,
  CollectionMeta,
  MINT_LIMIT,
  MintTradeNFT,
  NFTMETA,
  NFTWholeINFO,
  RedPacketOrderData,
  RedPacketOrderType,
  TRADE_TYPE,
  TradeNFT,
  VaultJoinData,
} from '@loopring-web/common-resources'
import * as sdk from '@loopring-web/loopring-sdk'
import { LoopringAPI } from '../../../api_wrapper'
import moment from 'moment'

const initialWithdrawState: WithdrawData = {
  belong: undefined as any,
  tradeValue: 0,
  balance: 0,
  address: undefined,
  fee: undefined,
  withdrawType: sdk.OffchainFeeReqType.OFFCHAIN_WITHDRAWAL,
}
const initialForceWithdrawState: ForceWithdrawData = {
  belong: undefined,
  tradeValue: 0,
  balance: 0,
  // requesterAddress: string | undefined;
  withdrawAddress: undefined,
  fee: undefined,
}

const initialTransferState: TransferData = {
  belong: undefined,
  tradeValue: 0,
  balance: 0,
  address: undefined,
  memo: undefined,
  fee: undefined,
  __request__: undefined,
}

const initialRedPacketState: RedPacketOrderData<any> = {
  belong: undefined as any,
  tradeValue: 0,
  balance: 0,
  fee: undefined,
  validSince: Date.now(),
  validUntil: moment().add('days', 1).toDate().getTime(),
  type: {
    partition: sdk.LuckyTokenAmountType.AVERAGE,
    mode: sdk.LuckyTokenClaimType.COMMON,
    scope: sdk.LuckyTokenViewType.PRIVATE,
  },
  tradeType: RedPacketOrderType.BlindBox,
  __request__: undefined,
  isNFT: false,
}
const initialRedPacketNFTState: RedPacketOrderData<any> = {
  belong: undefined as any,
  tradeValue: 0,
  fee: undefined,
  validSince: Date.now(),
  validUntil: moment().add('days', 1).toDate().getTime(),
  type: {
    partition: sdk.LuckyTokenAmountType.AVERAGE,
    mode: sdk.LuckyTokenClaimType.RELAY,
    scope: sdk.LuckyTokenViewType.PRIVATE,
  },
  tradeType: RedPacketOrderType.NFT,
  __request__: undefined,
  isNFT: true,
}
const initialBlindBoxState: RedPacketOrderData<any> = {
  belong: undefined as any,
  tradeValue: 0,
  fee: undefined,
  validSince: Date.now(),
  validUntil: moment().add('days', 1).toDate().getTime(),
  type: {
    partition: sdk.LuckyTokenAmountType.AVERAGE,
    mode: sdk.LuckyTokenClaimType.BLIND_BOX,
    scope: sdk.LuckyTokenViewType.PRIVATE,
  },
  tradeType: RedPacketOrderType.BlindBox,
  __request__: undefined,
  isNFT: false,
}

const initialClaimState: ClaimData = {
  belong: undefined as any,
  tradeValue: 0,
  balance: 0,
  fee: undefined,
  address: undefined,
  tradeType: TRADE_TYPE.TOKEN,
  __request__: undefined,
} as any

const initialJoinVault: VaultJoinData = {
  belong: undefined as any,
  tradeValue: 0,
  balance: 0,
  __request__: undefined,
} as any

const initialDepositState: DepositData = {
  belong: undefined,
  tradeValue: 0,
  balance: 0,
  toAddress: undefined,
}

export const initialTradeNFT = {
  belong: undefined,
  tradeValue: 0,
  // balance: MINT_LIMIT,
  nftBalance: 0,
}
export const initialMintNFT: Partial<MintTradeNFT<any>> = {
  belong: undefined,
  tradeValue: 0,
  nftBalance: MINT_LIMIT,
}

export const initialNFTMETA: Partial<NFTMETA> = {
  image: undefined,
  name: undefined,
  royaltyPercentage: 10,
  description: undefined,
  collection_metadata: undefined,
  properties: undefined,
}
const initialActiveAccountState: ActiveAccountData = {
  chargeFeeList: [],
  walletLayer2: undefined,
  referral: undefined,
}

const initialState: ModalDataStatus = {
  lastStep: LAST_STEP.default,
  offRampValue: undefined,
  offBanxaValue: undefined,
  withdrawValue: initialWithdrawState,
  transferValue: initialTransferState,
  transferRampValue: initialTransferState,
  transferBanxaValue: initialTransferState,
  depositValue: initialDepositState,
  nftWithdrawValue: initialWithdrawState,
  nftTransferValue: initialTransferState,
  nftDepositValue: { ...initialTradeNFT },
  nftMintValue: {
    mintData: { ...initialMintNFT },
    nftMETA: { ...initialNFTMETA },
  },
  nftMintAdvanceValue: { ...initialTradeNFT },
  collectionAdvanceValue: {},
  collectionValue: {},
  nftDeployValue: { ...initialTradeNFT, broker: '' },
  activeAccountValue: initialActiveAccountState,
  forceWithdrawValue: { ...initialForceWithdrawState },
  redPacketOrder: { ...initialRedPacketState },
  claimValue: { ...initialClaimState },
  joinVault: { ...initialJoinVault },
}

const modalDataSlice: Slice<ModalDataStatus> = createSlice({
  name: '_router_modalData',
  initialState,
  reducers: {
    resetAll(state) {
      this.resetWithdrawData(state)
      this.resetTransferData(state)
      this.resetTransferRampData(state)
      this.resetTransferBanxaData(state)
      this.resetDepositData(state)
      this.resetNFTWithdrawData(state)
      this.resetNFTTransferData(state)
      this.resetNFTDepositData(state)
      this.resetActiveAccountData(state)
      this.resetNFTMintData(state)
      this.resetNFTDeployData(state)
      this.resetForceWithdrawData(state)
      this.resetRedPacketOrder(state)
      this.resetClaimData(state)
    },
    resetForceWithdrawData(state) {
      state.lastStep = LAST_STEP.default
      state.forceWithdrawValue = initialForceWithdrawState
    },

    resetWithdrawData(state) {
      state.lastStep = LAST_STEP.default
      state.withdrawValue = initialWithdrawState
    },
    resetActiveAccountData(state) {
      state.lastStep = LAST_STEP.default
      state.activeAccountValue = initialActiveAccountState
    },
    resetTransferData(state) {
      state.lastStep = LAST_STEP.default
      state.transferValue = initialTransferState
    },
    resetTransferRampData(state) {
      state.lastStep = LAST_STEP.default
      state.transferRampValue = initialTransferState
    },
    resetTransferBanxaData(state) {
      state.lastStep = LAST_STEP.default
      state.transferBanxaValue = initialTransferState
    },
    resetDepositData(state) {
      state.lastStep = LAST_STEP.default
      state.depositValue = initialDepositState
    },
    resetNFTWithdrawData(state) {
      state.lastStep = LAST_STEP.default
      state.nftWithdrawValue = initialWithdrawState
    },
    resetNFTTransferData(state) {
      state.lastStep = LAST_STEP.default
      state.nftTransferValue = initialTransferState
    },
    resetNFTDepositData(state) {
      state.lastStep = LAST_STEP.default
      state.nftDepositValue = initialDepositState
    },
    resetNFTMintData(
      state,
      _action?: PayloadAction<{
        lastStep?: LAST_STEP
        tokenAddress?: string
        collection?: CollectionMeta
      }>,
    ) {
      state.lastStep = _action?.payload?.lastStep ?? LAST_STEP.default
      state.nftMintValue = {
        mintData: {
          ...initialMintNFT,
          tokenAddress: _action?.payload?.tokenAddress ? _action?.payload?.tokenAddress : undefined,
        },
        nftMETA: {
          ...initialNFTMETA,
          collection_metadata: _action?.payload?.collection?.contractAddress
            ? `${LoopringAPI.delegate?.getCollectionDomain()}/${
                _action?.payload.collection?.contractAddress
              }`
            : undefined,
        },
        collection: _action?.payload?.collection ? _action?.payload?.collection : undefined,
      }
    },
    resetNFTMintAdvanceData(
      state,
      _action?: PayloadAction<{
        lastStep?: LAST_STEP
        tokenAddress?: string
        collection?: CollectionMeta
      }>,
    ) {
      state.lastStep = _action?.payload?.lastStep ?? LAST_STEP.default
      state.nftMintAdvanceValue = initialTradeNFT
    },
    resetCollectionAdvanceData(state) {
      state.lastStep = LAST_STEP.default
      state.collectionAdvanceValue = {}
    },
    resetCollectionData(state) {
      state.lastStep = LAST_STEP.default
      state.collectionValue = {}
    },
    resetNFTDeployData(state) {
      state.lastStep = LAST_STEP.default
      state.nftDeployValue = { ...initialTradeNFT, broker: '' }
    },
    resetOffRampData(state) {
      state.lastStep = LAST_STEP.default
      state.offRampValue = undefined
    },
    resetOffBanxaData(state) {
      state.lastStep = LAST_STEP.default
      state.offBanxaValue = undefined
    },
    resetRedPacketOrder(
      state,
      _action?: PayloadAction<{
        type?: RedPacketOrderType
        isNFT?: boolean
      }>,
    ) {
      state.lastStep = LAST_STEP.default
      state.redPacketOrder = {
        ...(_action?.payload?.type === RedPacketOrderType.NFT
          ? initialRedPacketNFTState
          : _action?.payload?.type === RedPacketOrderType.BlindBox
          ? initialBlindBoxState
          : initialRedPacketState),
      } as RedPacketOrderData<any>
    },
    resetClaimData(state) {
      state.lastStep = LAST_STEP.default
      state.claimValue = { ...initialClaimState }
    },
    resetJoinVault(state) {
      state.lastStep = LAST_STEP.default
      state.joinVault = { ...initialJoinVault }
    },
    updateActiveAccountData(state, action: PayloadAction<Partial<ActiveAccountData>>) {
      const { chargeFeeList, walletLayer2, isFeeNotEnough, referral, ...rest } = action.payload
      state.lastStep = LAST_STEP.default
      if (chargeFeeList) {
        state.activeAccountValue.chargeFeeList = chargeFeeList
        state.activeAccountValue.walletLayer2 = walletLayer2
        state.activeAccountValue.isFeeNotEnough = isFeeNotEnough
      }
      if (referral !== undefined) {
        state.activeAccountValue.referral = referral
      }
      state.activeAccountValue = {
        ...state.activeAccountValue,
        ...rest,
      }
    },
    updateWithdrawData(state, action: PayloadAction<Partial<WithdrawData>>) {
      const { belong, balance, tradeValue, address, withdrawType, ...rest } = action.payload
      state.lastStep = LAST_STEP.withdraw
      state.withdrawValue = {
        ...state.withdrawValue,
        withdrawType: withdrawType ? withdrawType : state.withdrawValue.withdrawType,
        balance: balance as any,
        belong: belong as any,
        tradeValue,
        address: address !== '*' ? address : undefined,
        ...rest,
      }
    },
    updateForceWithdrawData(state, action: PayloadAction<Partial<ForceWithdrawData>>) {
      const {
        belong,
        balance,
        tradeValue,
        withdrawAddress,
        // requesterAddress,
        ...rest
      } = action.payload
      state.lastStep = LAST_STEP.withdraw
      state.forceWithdrawValue = {
        ...state.forceWithdrawValue,
        balance: balance === undefined || balance >= 0 ? balance : state.forceWithdrawValue.balance,
        belong,
        tradeValue,
        // requesterAddress: requesterAddress !== "*" ? requesterAddress : undefined,
        withdrawAddress: withdrawAddress !== '*' ? withdrawAddress : undefined,
        ...rest,
      }
    },
    updateTransferData(state, action: PayloadAction<Partial<TransferData>>) {
      const { belong, balance, tradeValue, address, ...rest } = action.payload
      state.lastStep = LAST_STEP.transfer

      state.transferValue = {
        ...state.transferValue,
        balance: balance === undefined || balance >= 0 ? balance : state.transferValue.balance,
        belong,
        tradeValue,
        address: address !== '*' ? address : undefined,
        ...rest,
      }
    },
    updateTransferRampData(state, action: PayloadAction<Partial<TransferData>>) {
      const { belong, balance, tradeValue, address, __request__, ...rest } = action.payload
      state.lastStep = LAST_STEP.offRampTrans
      if (__request__) {
        state.transferRampValue.__request__ = __request__
        return state
      }
      state.transferRampValue = {
        ...state.transferRampValue,
        balance: balance === undefined || balance >= 0 ? balance : state.transferValue.balance,
        belong,
        tradeValue,
        address: address !== '*' ? address : undefined,
        ...rest,
      }
    },
    updateTransferBanxaData(state, action: PayloadAction<Partial<TransferData>>) {
      const { belong, balance, tradeValue, address, __request__, ...rest } = action.payload
      state.lastStep = LAST_STEP.offRampTrans
      if (__request__) {
        state.transferBanxaValue.__request__ = __request__
        return state
      }
      state.transferBanxaValue = {
        ...state.transferBanxaValue,
        balance: balance === undefined || balance >= 0 ? balance : state.transferValue.balance,
        belong,
        tradeValue,
        address: address !== '*' ? address : undefined,
        ...rest,
      }
    },
    updateDepositData(state, action: PayloadAction<Partial<DepositData>>) {
      const { belong, balance, tradeValue, toAddress, addressError } = action.payload
      state.lastStep = LAST_STEP.nftDeposit
      if (belong) {
        state.depositValue.belong = belong
      }

      if (balance && balance >= 0) {
        state.depositValue.balance = balance
      }
      state.depositValue.tradeValue = tradeValue
      state.depositValue.toAddress = toAddress
      state.depositValue.addressError = addressError
    },
    updateNFTWithdrawData(
      state,
      action: PayloadAction<Partial<WithdrawData & sdk.UserNFTBalanceInfo & NFTWholeINFO>>,
    ) {
      const { belong, tradeValue, address, ...rest } = action.payload
      state.lastStep = LAST_STEP.nftWithdraw
      state.nftWithdrawValue = {
        ...state.nftWithdrawValue,
        belong: belong as any,
        tradeValue: tradeValue === undefined || tradeValue >= 0 ? tradeValue : undefined,
        address: address !== '*' ? address : undefined,

        ...rest,
      }
    },
    updateNFTTransferData(
      state,
      action: PayloadAction<Partial<TransferData & sdk.UserNFTBalanceInfo & NFTWholeINFO>>,
    ) {
      const { belong, tradeValue, address, ...rest } = action.payload
      state.lastStep = LAST_STEP.nftTransfer
      state.nftTransferValue = {
        ...state.nftTransferValue,
        belong,
        // balance: balance
        //   ? balance
        //   : rest.total !== undefined
        //   ? sdk
        //       .toBig(rest.total ?? 0)
        //       .minus(rest.locked ?? 0)
        //       .toNumber()
        //   : state.nftTransferValue.balance,
        tradeValue: tradeValue === undefined || tradeValue >= 0 ? tradeValue : undefined,
        address: address !== '*' ? address : undefined,

        ...rest,
      }
    },
    updateNFTDepositData(state, action: PayloadAction<Partial<TradeNFT<any, any>>>) {
      const { balance, tradeValue, ...rest } = action.payload
      state.lastStep = LAST_STEP.nftDeposit

      if (balance === undefined || balance >= 0) {
        state.nftDepositValue.balance = balance
      }

      if (tradeValue === undefined || tradeValue >= 0) {
        state.nftDepositValue.tradeValue = tradeValue
      }

      state.nftDepositValue = {
        ...state.nftDepositValue,
        ...rest,
      }
    },
    updateNFTMintAdvanceData(state, action: PayloadAction<Partial<TradeNFT<any, any>>>) {
      const { balance, tradeValue, ...rest } = action.payload
      state.lastStep = LAST_STEP.nftMintAdv

      if (balance && balance >= 0) {
        state.nftMintAdvanceValue.balance = balance
      }

      if (tradeValue === undefined || tradeValue >= 0) {
        state.nftMintAdvanceValue.tradeValue = tradeValue
      }

      state.nftMintAdvanceValue = {
        ...state.nftMintAdvanceValue,
        ...rest,
      }
    },
    updateCollectionAdvanceData(state, action: PayloadAction<any>) {
      state.lastStep = LAST_STEP.collectionAdv
      const _collectionAdvanceValue = action.payload
      state.collectionAdvanceValue = { ..._collectionAdvanceValue }
    },
    updateCollectionData(state, action: PayloadAction<any>) {
      state.lastStep = LAST_STEP.collectionAdv
      const _collectionValue = action.payload
      state.collectionValue = { ..._collectionValue }
    },
    updateNFTMintData(state, action: PayloadAction<NFT_MINT_VALUE<any>>) {
      const mintData = action.payload.mintData
      const nftMETA = action.payload.nftMETA
      const collection = action.payload.collection
      const error = action.payload.error
      const { balance, tradeValue, tokenAddress, ...rest } = mintData

      state.lastStep = LAST_STEP.nftMint

      if (balance === undefined || balance >= 0) {
        state.nftMintValue.mintData.balance = balance
      }

      if (tradeValue === undefined || tradeValue >= 0) {
        state.nftMintValue.mintData.tradeValue = tradeValue
      }

      state.nftMintValue.mintData = {
        ...state.nftMintValue.mintData,
        tokenAddress,
        ...rest,
      }
      state.nftMintValue.nftMETA = {
        ...state.nftMintValue.nftMETA,
        ...nftMETA,
      }
      if (collection) {
        state.nftMintValue.collection = collection
      }
      state.nftMintValue.error = error
    },
    updateNFTDeployData(
      state,
      action: PayloadAction<Partial<TradeNFT<any, any> & { broker: string }>>,
    ) {
      const { balance, tradeValue, broker, ...rest } = action.payload
      state.lastStep = LAST_STEP.nftDeploy

      // if (balance === undefined || balance >= 0) {
      //   state.nftDeployValue.balance = balance;
      // }
      if (broker) {
        state.nftDeployValue.broker = broker
      }

      // if (tradeValue === undefined || tradeValue >= 0) {
      //   state.nftDeployValue.tradeValue = tradeValue;
      // }

      state.nftDeployValue = {
        ...state.nftDeployValue,
        ...rest,
      }
    },
    updateOffRampData(
      state,
      action: PayloadAction<
        Partial<{
          offRampPurchase?: undefined
          send?: {
            assetSymbol: string
            amount: string
            destinationAddress: string
          }
        }>
      >,
    ) {
      state.lastStep = LAST_STEP.offRamp
      const { send } = action.payload
      if (send) {
        state.offRampValue = {
          ...state.offRampValue,
          send,
        }
      }
      // if()
      // state.offRampValue = {
      //   ...state.offRampValue,
      //   ...action.payload,
      // };
    },
    updateOffBanxaData(state, action: PayloadAction<{ order: BanxaOrder }>) {
      state.lastStep = LAST_STEP.offBanxa
      const { order } = action.payload
      if (order) {
        state.offBanxaValue = {
          ...order,
        }
      }
    },
    updateRedPacketOrder(state, action: PayloadAction<RedPacketOrderData<any>>) {
      state.lastStep = LAST_STEP.redPacketSend
      const { balance, tradeValue, belong, ...rest } = action.payload
      state.redPacketOrder = {
        ...state.redPacketOrder,
        balance: balance === undefined || balance >= 0 ? balance : state.redPacketOrder.balance,
        belong,
        tradeValue,
        ...rest,
      } as RedPacketOrderData<any>
    },
    updateClaimData(state, action: PayloadAction<ClaimData>) {
      state.lastStep = LAST_STEP.claim
      const { balance, tradeValue, belong, ...rest } = action.payload
      state.claimValue = {
        ...state.redPacketOrder,
        balance: balance === undefined || balance >= 0 ? balance : state.redPacketOrder.balance,
        belong,
        tradeValue,
        ...rest,
      } as ClaimData
    },

    updateJoinVault(state, action: PayloadAction<VaultJoinData>) {
      state.lastStep = LAST_STEP.claim
      const { balance, tradeValue, belong, ...rest } = action.payload
      state.joinVault = {
        ...state.joinVault,
        balance: balance === undefined || balance >= 0 ? balance : state.redPacketOrder.balance,
        belong,
        tradeValue,
        ...rest,
      } as VaultJoinData
    },
  },
})

export { modalDataSlice }

export const {
  joinVault,
  updateJoinVault,
  resetJoinVault,
  updateForceWithdrawData,
  updateActiveAccountData,
  updateWithdrawData,
  updateTransferData,
  updateTransferRampData,
  updateTransferBanxaData,
  updateDepositData,
  updateNFTWithdrawData,
  updateNFTTransferData,
  updateNFTDepositData,
  updateNFTMintData,
  updateNFTDeployData,
  updateNFTMintAdvanceData,
  updateCollectionAdvanceData,
  updateCollectionData,
  updateOffRampData,
  updateOffBanxaData,
  updateRedPacketOrder,
  updateClaimData,
  resetClaimData,
  resetForceWithdrawData,
  resetNFTWithdrawData,
  resetNFTTransferData,
  resetNFTDepositData,
  resetNFTMintData,
  resetWithdrawData,
  resetTransferData,
  resetTransferRampData,
  resetDepositData,
  resetActiveAccountData,
  resetNFTDeployData,
  resetNFTMintAdvanceData,
  resetCollectionAdvanceData,
  resetCollectionData,
  resetOffRampData,
  resetOffBanxaData,
  resetRedPacketOrder,
  resetTransferBanxaData,
  resetAll,
} = modalDataSlice.actions
