import {
  InputButtonProps,
  InputCoinProps,
  BtnInfoProps,
  SwitchPanelProps,
} from "../../basic-lib";
import {
  CoinInfo,
  CoinKey,
  CoinMap,
  FeeInfo,
  RequireOne,
  WalletCoin,
  WalletMap,
  WithdrawType,
  WithdrawTypes,
} from "@loopring-web/common-resources";
import { TradeBtnStatus } from "../Interface";
import React from "react";
import { XOR } from "../../../types/lib";

/**
 * private props
 */
export type TradeMenuListProps<T, I> = {
  nonZero: boolean;
  sorted: boolean;
  walletMap: WalletMap<I, WalletCoin<I>>;
  _height?: string | number;
  coinMap: CoinMap<I, CoinInfo<I>>;
  onChangeEvent: (index: 0 | 1, data: SwitchData<T>) => void;
  selected?: string;
  tradeData: T;
};

/**
 * private props
 */
export type SwitchData<T> = {
  to: "menu" | "button";
  tradeData: T;
};

export type TransferInfoProps<C> = {
  transferI18nKey?: string;
  transferBtnStatus?: keyof typeof TradeBtnStatus | undefined;
  chargeFeeTokenList: Array<C>;
  feeInfo: C;
  isFeeNotEnough: boolean;
};

export enum AddressError {
  NoError,
  EmptyAddr,
  InvalidAddr,
  ENSResolveFailed,
}

export type TransferExtendProps<T, I, C> = {
  isThumb?: boolean;
  addressDefault?: string;
  addressOrigin: "Wallet" | null;
  handleSureItsLayer2: (sure: boolean) => void;
  realAddr?: string;
  isLoopringAddress?: boolean;
  isAddressCheckLoading?: boolean;
  isSameAddress?: boolean;
  addrStatus?: AddressError;
  onTransferClick: (data: T, isFirstTime?: boolean) => void;
  handleFeeChange: (value: C) => void;
  handleOnAddressChange: (value: string | undefined | I) => void;
  wait?: number;
} & TransferInfoProps<C>;

export type TransferViewProps<
  T,
  I,
  C = CoinKey<I> | string
> = BasicACoinTradeViewProps<T, I> & TransferExtendProps<T, I, C>;

/**
 * private props
 */
export type ResetInfoProps<C> = {
  assetsData?: any[];
  resetBtnStatus?: keyof typeof TradeBtnStatus | undefined;
  chargeFeeTokenList: Array<C>;
  feeInfo: C;
  disabled?: boolean;
  isFeeNotEnough: boolean;
  handleFeeChange: (value: C) => void;
} & XOR<
  {
    walletMap: WalletMap<any>;
    goToDeposit: () => void;
    isNewAccount?: boolean;
  },
  {}
>;

export type ResetExtendProps<C> = {
  onResetClick: () => void;
} & ResetInfoProps<C>;

export type ResetViewProps<C extends FeeInfo> = ResetExtendProps<C>;

export type ExportAccountExtendProps = {
  exportAccountProps: any;
  setExportAccountToastOpen: (value: boolean) => void;
};

/**
 * private props
 */
export type DepositInfoProps<I> = {
  depositBtnStatus?: keyof typeof TradeBtnStatus | undefined;
  title?: string;
  description?: string;
  chargeFeeTokenList?: FeeInfo[];
  isNewAccount: boolean;
  addressDefault?: string;
  handleOnAddressChange?: (value: string | undefined | I) => void;
  handleAddressError?: (
    address: string
  ) =>
    | { error: boolean; message?: string | React.ElementType<HTMLElement> }
    | undefined;
  wait?: number;
} & BtnInfoProps;

export type DepositExtendProps<T, I> = {
  isThumb?: boolean;
  allowTrade?: any;
  onDepositClick: (data: T) => void;
} & DepositInfoProps<I>;

export type DepositViewProps<T, I> = BasicACoinTradeViewProps<T, I> &
  DepositExtendProps<T, I>;

export type WithdrawInfoProps<C> = {
  withdrawI18nKey?: string;
  withdrawBtnStatus?: keyof typeof TradeBtnStatus | undefined;
  withdrawType: WithdrawType;
  withdrawTypes: Partial<WithdrawTypes>;
  chargeFeeTokenList: Array<C>;
  feeInfo: C;
  isFeeNotEnough: boolean;
};

export type WithdrawExtendProps<T, I, C> = {
  isThumb?: boolean;
  addressDefault: string;
  accAddr: string;
  isNotAvaiableAddress: boolean;
  realAddr?: string;
  isAddressCheckLoading: boolean;
  isCFAddress: boolean;
  isContractAddress: boolean;
  addrStatus?: AddressError;
  disableWithdrawList?: string[];
  onWithdrawClick: (data: T, isFirstTime?: boolean) => void;
  handleFeeChange: (value: C) => void;
  handleWithdrawTypeChange: (value: WithdrawType) => void;
  handleOnAddressChange: (value: string | undefined | I) => void;
  wait?: number;
} & WithdrawInfoProps<C>;

export type WithdrawViewProps<
  T,
  I,
  C = CoinKey<I> | string
> = BasicACoinTradeViewProps<T, I> & WithdrawExtendProps<T, I, C>;

export type inputNFTProps<T, I, C = CoinInfo<I>> = RequireOne<
  InputCoinProps<T, I, C>,
  "label"
>;
export type inputButtonDefaultProps<T, I, C = CoinInfo<I>> = RequireOne<
  InputButtonProps<T, I, C>,
  "label"
>;

export type DefaultProps<T, I> = {
  tradeData: T;
  disabled?: boolean;
  coinMap: CoinMap<I, CoinInfo<I>>;
  walletMap: WalletMap<I, WalletCoin<I>>;
  type?: "TOKEN" | "NFT";
};

type DefaultWithMethodProps<T, I> = DefaultProps<T, I>;

export type BasicACoinTradeViewProps<T, I> = Required<
  DefaultWithMethodProps<T, I>
> & {
  onChangeEvent: (index: 0 | 1, data: SwitchData<T>) => void;
} & Pick<InputButtonProps<T, I, CoinInfo<I>>, "handleError">;

export type BasicACoinTradeProps<T, I> = BasicACoinTradeViewProps<T, I> & {
  type?: "TOKEN" | "NFT";
  inputBtnRef: React.Ref<any>;
  inputButtonProps?: inputButtonDefaultProps<I, CoinInfo<I>>;
  inputButtonDefaultProps: inputButtonDefaultProps<I, CoinInfo<I>>;
};
export type BasicANFTTradeProps<T, I> = Omit<
  BasicACoinTradeViewProps<T, I>,
  "coinMap"
> & {
  type?: "TOKEN" | "NFT";
  isThumb?: boolean;
  isBalanceLimit?: boolean;
  inputNFTRef: React.Ref<any>;
  inputNFTProps?: inputNFTProps<I, CoinInfo<I>>;
  inputNFTDefaultProps: inputNFTProps<I, CoinInfo<I>>;
};

export type BasicACoinTradeHookProps<T, I> = DefaultWithMethodProps<T, I> & {
  type?: "TOKEN" | "NFT";
  handlePanelEvent?: (
    props: SwitchData<T>,
    switchType: "Tomenu" | "Tobutton"
  ) => Promise<void>;
  onChangeEvent?: (index: 0 | 1, data: SwitchData<T>) => SwitchData<T>;
  inputButtonProps?: inputButtonDefaultProps<T, I>;
} & Partial<SwitchPanelProps<any>>;

export type NFTDepositInfoProps<T, I> = DefaultWithMethodProps<T, I> & {
  nftDepositBtnStatus?: keyof typeof TradeBtnStatus | undefined;
  title?: string;
  description?: string;
  chargeFeeList?: FeeInfo[];
  addressDefault?: string;
  handleOnAddressChange?: (value: string | undefined | I) => void;
  handleAddressError?: (
    address: string
  ) =>
    | { error: boolean; message?: string | React.ElementType<HTMLElement> }
    | undefined;
  wait?: number;
} & BtnInfoProps;
export type NFTDepositViewProps<T, I> = NFTDepositExtendProps<T, I>;
export type NFTDepositExtendProps<T, I> = {
  isThumb?: boolean;
  isNFTCheckLoading?: boolean;
  handleOnNFTDataChange: (data: T) => void;
  onNFTDepositClick: (data: T) => void;
  allowTrade?: any;
} & NFTDepositInfoProps<T, I>;

export type NFTMintInfoProps<T, I, C> = DefaultWithMethodProps<T, I> & {
  nftMintBtnStatus?: keyof typeof TradeBtnStatus | undefined;
  title?: string;
  description?: string;
  chargeFeeTokenList?: Array<C>;
  feeInfo: C;
  isNFTCheckLoading?: boolean;
  isAvaiableId?: boolean;
  isFeeNotEnough?: boolean;
  handleFeeChange: (value: C) => void;
  wait?: number;
} & BtnInfoProps;

export type NFTMintExtendProps<T, I, C = FeeInfo> = {
  isThumb?: boolean;
  handleOnNFTDataChange: (data: T) => void;
  onNFTMintClick: (data: T, isFirstMint?: boolean) => void;
  allowTrade?: any;
} & NFTMintInfoProps<T, I, C>;
export type NFTMintViewProps<T, I, C> = NFTMintExtendProps<T, I, C>;

export type NFTDeployInfoProps<T, I, C> = DefaultWithMethodProps<T, I> & {
  nftDeployBtnStatus?: keyof typeof TradeBtnStatus | undefined;
  title?: string;
  description?: string;
  assetsData?: any[];
  chargeFeeTokenList: Array<C>;
  feeInfo: C;
  isFeeNotEnough: boolean;
  handleFeeChange: (value: C) => void;
  wait?: number;
} & BtnInfoProps;
export type NFTDeployExtendProps<T, I, C> = {
  handleOnNFTDataChange: (data: T) => void;
  onNFTDeployClick: (data: T, isFirstTime?: boolean) => void;
  allowTrade?: any;
} & NFTDeployInfoProps<T, I, C>;

export type NFTDeployViewProps<T, I, C> = NFTDeployExtendProps<T, I, C>;
