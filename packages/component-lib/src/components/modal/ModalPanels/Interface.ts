import { ButtonProps } from '../../basic-lib'
import {
  Account,
  AccountHashInfo,
  CAMPAIGNTAGCONFIG,
  Contact,
  FeeInfo,
  NFTWholeINFO,
  TradeTypes,
  VendorItem,
  VendorProviders,
  WalletMap,
} from '@loopring-web/common-resources'
import React from 'react'
import {NFTBurn_User_Denied} from "./Transfer";

export type AccountBaseProps = {
  level?: string
  mainBtn?: ((props: ButtonProps) => JSX.Element) | JSX.Element
  etherscanUrl: string
  onDisconnect?: any
  onSwitch?: any
  onCopy?: any
  onViewQRCode?: any
  hideVIPlevel?: boolean
} & Account

export enum AccountStep {
  //l1 should be at top
  NoAccount,
  QRCode,
  HadAccount,
  Deposit_Sign_WaitForRefer,
  Deposit_Approve_WaitForAuth,
  Deposit_Approve_Denied,
  Deposit_WaitForAuth,
  Deposit_Denied,
  Deposit_Failed,
  Deposit_Submit,

  //L2
  General_Failed,

  ContinuousBanxaOrder,
  CheckingActive,
  AddAssetGateway,
  SendAssetGateway,
  SendAssetFromContact,
  SendNFTGateway,
  PayWithCard,
  QRCodeScanner,
  ThirdPanelReturn,
  // new
  // Deposit,

  NFTDeposit_Approve_WaitForAuth,
  NFTDeposit_Approve_Denied,
  NFTDeposit_WaitForAuth,
  NFTDeposit_Denied,
  NFTDeposit_Failed,
  NFTDeposit_Submit,

  NFTMint_WaitForAuth,
  NFTMint_First_Method_Denied,
  NFTMint_In_Progress,
  NFTMint_Denied,
  NFTMint_Failed,
  NFTMint_Success,

  NFTDeploy_WaitForAuth,
  NFTDeploy_First_Method_Denied,
  NFTDeploy_In_Progress,
  NFTDeploy_Denied,
  NFTDeploy_Failed,
  NFTDeploy_Submit,

  RedPacketSend_WaitForAuth,
  RedPacketSend_First_Method_Denied,
  RedPacketSend_In_Progress,
  RedPacketSend_User_Denied,
  RedPacketSend_Failed,
  RedPacketSend_Success,

  RedPacketOpen_In_Progress,
  RedPacketOpen_Failed,

  RedPacketOpen_Claim_In_Progress,
  RedPacketSend_Claim_Success,
  RedPacketOpen_Claim_Failed,

  ForceWithdraw_WaitForAuth,
  ForceWithdraw_First_Method_Denied,
  ForceWithdraw_In_Progress,
  ForceWithdraw_Denied,
  ForceWithdraw_Failed,
  ForceWithdraw_Submit,

  ClaimWithdraw_WaitForAuth,
  ClaimWithdraw_Denied,
  ClaimWithdraw_First_Method_Denied,
  ClaimWithdraw_In_Progress,
  ClaimWithdraw_Failed,
  ClaimWithdraw_Submit,

  Transfer_WaitForAuth,
  Transfer_First_Method_Denied,
  Transfer_User_Denied,
  Transfer_In_Progress,
  Transfer_Success,
  Transfer_Failed,

  Transfer_RAMP_WaitForAuth,
  Transfer_RAMP_First_Method_Denied,
  Transfer_RAMP_User_Denied,
  Transfer_RAMP_In_Progress,
  Transfer_RAMP_Success,
  Transfer_RAMP_Failed,

  Transfer_BANXA_WaitForAuth,
  Transfer_BANXA_First_Method_Denied,
  Transfer_BANXA_User_Denied,
  Transfer_BANXA_In_Progress,
  Transfer_BANXA_Success,
  Transfer_BANXA_Confirm,
  Transfer_BANXA_Failed,

  Withdraw_WaitForAuth,
  Withdraw_First_Method_Denied,
  Withdraw_User_Denied,
  Withdraw_In_Progress,
  Withdraw_Success,
  Withdraw_Failed,

  NFTTransfer_WaitForAuth,
  NFTTransfer_First_Method_Denied,
  NFTTransfer_User_Denied,
  NFTTransfer_In_Progress,
  NFTTransfer_Success,
  NFTTransfer_Failed,

  NFTBurn_WaitForAuth,
  NFTBurn_First_Method_Denied,
  NFTBurn_User_Denied,
  NFTBurn_In_Progress,
  NFTBurn_Success,
  NFTBurn_Failed,

  NFTWithdraw_WaitForAuth,
  NFTWithdraw_First_Method_Denied,
  NFTWithdraw_User_Denied,
  NFTWithdraw_In_Progress,
  NFTWithdraw_Success,
  NFTWithdraw_Failed,

  CreateAccount_Approve_WaitForAuth,
  CreateAccount_Approve_Denied,
  CreateAccount_Approve_Submit,
  CreateAccount_WaitForAuth,
  CreateAccount_Denied,
  CreateAccount_Failed,
  CreateAccount_Submit,

  UpdateAccount,
  UpdateAccount_Approve_WaitForAuth,
  UpdateAccount_First_Method_Denied,
  UpdateAccount_User_Denied,
  UpdateAccount_Success,
  UpdateAccount_Failed,

  // UnlockAccount,
  UnlockAccount_WaitForAuth,
  UnlockAccount_User_Denied,
  UnlockAccount_Success,
  UnlockAccount_Failed,
  UnlockAccount_Reset_Key_Confirm,

  ResetAccount_Approve_WaitForAuth,
  ResetAccount_First_Method_Denied,
  ResetAccount_User_Denied,
  ResetAccount_Success,
  ResetAccount_Failed,

  ExportAccount_Approve_WaitForAuth,
  ExportAccount_User_Denied,
  ExportAccount_Success,
  ExportAccount_Failed,

  Dual_Success,
  Dual_Failed,
  Staking_Success,
  Staking_Failed,
  Staking_Redeem_Success,
  Staking_Redeem_Failed,

  BtradeSwap_Pending,
  BtradeSwap_Delivering,
  BtradeSwap_Settled,
  BtradeSwap_Failed,

  AMM_Pending,

  VaultTrade_Success,
  VaultTrade_Failed,
  VaultTrade_In_Progress,
  VaultJoin_Success,
  VaultJoin_Failed,
  VaultJoin_In_Progress,
  VaultRedeem_Success,
  VaultRedeem_Failed,
  VaultRedeem_In_Progress,
  VaultBorrow_Success,
  VaultBorrow_Failed,
  VaultBorrow_In_Progress,
  VaultRepay_Success,
  VaultRepay_Failed,
  VaultRepay_In_Progress,
  VaultDustCollector_Success,
  VaultDustCollector_Failed,
  VaultDustCollector_In_Progress,

  Taiko_Farming_Lock_Success,
  Taiko_Farming_Lock_Failed,

  Taiko_Farming_Redeem_In_Progress,
  Taiko_Farming_Redeem_Success,
  Taiko_Farming_Redeem_Failed,

  Taiko_Farming_Mint_Success,
  Taiko_Farming_Mint_In_Progress,
  Taiko_Farming_Mint_Failed,

  Transfer_To_Taiko_User_Denied,
  Transfer_To_Taiko_In_Progress,
  Transfer_To_Taiko_Success,
  Transfer_To_Taiko_Failed,

  Coinbase_Smart_Wallet_Password_Intro,
  Coinbase_Smart_Wallet_Password_Set,
  Coinbase_Smart_Wallet_Password_Set_Processing,
  Coinbase_Smart_Wallet_Password_Input,
  Coinbase_Smart_Wallet_Password_Forget_Password_Confirm,
  Coinbase_Smart_Wallet_Password_Forget_Password,
}

/**
 * @param handleSelect default handleSelect, if item have no private handleSelect function
 */
export interface VendorMenuProps {
  // termUrl: string;
  type?: TradeTypes
  banxaRef?: React.Ref<any>
  vendorList: VendorItem[]
  handleSelect?: (event: React.MouseEvent, key: string) => void
  vendorForce: VendorProviders | undefined
  campaignTagConfig?: CAMPAIGNTAGCONFIG
  callback?: () => void
}

interface InferfaceAssetItem {
  key: string
  svgIcon: string
  enableKey?: string | null
  handleSelect: (event?: React.MouseEvent) => void
  type: 'sameLayer' | 'crossLayer' | 'crossChain'
  cornerTag?: 'Loopring' | '3rd party'
  description?: string
}

export interface AddAssetItem extends InferfaceAssetItem {}

export interface SendAssetItem extends InferfaceAssetItem {}

export interface AddAssetProps {
  symbol?: string
  addAssetList: AddAssetItem[]
  isNewAccount?: boolean
  allowTrade: {
    [key: string]: { enable?: boolean; reason?: string; show?: boolean }
  }
  disbaleList?: string[]
}

export interface SendAssetProps {
  isToL1?: boolean
  symbol?: string
  sameLayerAssetList: AddAssetItem[]
  crossLayerAssetList: AddAssetItem[]
  crossChainAssetList: AddAssetItem[]
  allowTrade: {
    [key: string]: { enable?: boolean; reason?: string; show?: boolean }
  }
  toL1Title: string
}

export interface SendNFTAssetProps {
  nftData: Partial<NFTWholeINFO>
  sendAssetList: AddAssetItem[]
  isNotAllowToL1?: boolean
  allowTrade: {
    [key: string]: { enable?: boolean; reason?: string; show?: boolean }
  }
}

export interface CheckActiveStatusProps<C = FeeInfo> {
  account: Account & { isContract: boolean | undefined }
  chargeFeeTokenList: C[]
  goDisconnect: () => void
  goSend: () => void
  isDepositing: boolean
  walletMap?: WalletMap<any, any>
  isFeeNotEnough: {
    isFeeNotEnough: boolean
    isOnLoading: boolean
  }
  onIKnowClick: () => void
  knowDisable: boolean
  know: boolean
  clearDepositHash?: () => void
  chainInfos?: AccountHashInfo
  accAddress?: string
}

export interface CheckImportCollectionProps {
  account: Account
  value: string
  onChange: (item: string) => void
  contractList: string[]
  disabled?: boolean
  loading?: boolean
  onClick: (item: string) => void
}

export interface SendDialogProps {
  // onCloseSend: () => void
  sendInfo: {
    open: boolean
    selected: Contact | undefined
  }
}
