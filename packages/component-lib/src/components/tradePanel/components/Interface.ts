import {
  InputButtonProps,
  InputCoinProps,
  BtnInfoProps,
  SwitchPanelProps,
} from "../../basic-lib";
import {
  AddressError,
  CoinInfo,
  CoinKey,
  CoinMap,
  FeeInfo,
  RequireOne,
  WalletCoin,
  WalletMap,
  WithdrawType,
  WithdrawTypes,
  WALLET_TYPE,
  EXCHANGE_TYPE,
} from "@loopring-web/common-resources";
import { TradeBtnStatus } from "../Interface";
import React, { ChangeEvent } from "react";
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

export type TransferExtendProps<T, I, C> = {
  isThumb?: boolean;
  addressDefault?: string;
  sureItsLayer2: WALLET_TYPE | undefined;
  handleSureItsLayer2: (sure: WALLET_TYPE) => void;
  realAddr?: string;
  isLoopringAddress?: boolean;
  isAddressCheckLoading?: boolean;
  isSameAddress?: boolean;
  addrStatus: AddressError;
  onTransferClick: (data: T, isFirstTime?: boolean) => Promise<void>;
  handleFeeChange: (value: C) => void;
  handleOnAddressChange: (value: string | undefined | I) => void;
  wait?: number;
  onBack?: () => void;
  memo: string;
  handleOnMemoChange: (e: ChangeEvent<HTMLInputElement>) => void;
} & TransferInfoProps<C>;

export type TransferViewProps<T, I, C = CoinKey<I> | string> =
  BasicACoinTradeViewProps<T, I> & TransferExtendProps<T, I, C>;

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
export type DepositInfoProps = {
  depositBtnStatus?: keyof typeof TradeBtnStatus | undefined;
  title?: string;
  description?: string;
  chargeFeeTokenList?: FeeInfo[];
  isNewAccount: boolean;
  addressDefault?: string;
  // handleOnAddressChange?: (value: string | undefined | I) => void;
  // handleAddressError?: (
  //   address: string
  // ) => { error: boolean; message?: string | JSX.Element } | undefined;
  wait?: number;
} & BtnInfoProps;

export type DepositExtendProps<T> = {
  isThumb?: boolean;
  title?: string;
  allowTrade?: any;
  toAddressStatus: AddressError;
  referStatus: AddressError;
  isAllowInputToAddress?: boolean;
  onDepositClick: (data: T) => void;
  toIsAddressCheckLoading: boolean;
  // toIsLoopringAddress: boolean;
  realToAddress?: string;
  referIsAddressCheckLoading: boolean;
  referIsLoopringAddress?: boolean;
  realReferAddress?: string;
  handleClear: () => void;
  isToAddressEditable: boolean;
  onBack?: () => void;
} & DepositInfoProps;

export type DepositViewProps<T, I> = BasicACoinTradeViewProps<T, I> &
  DepositExtendProps<T>;

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
  isNotAvaiableAddress:
    | "isCFAddress"
    | "isContract1XAddress"
    | "isContractAddress"
    | "isLoopringAddress"
    | "isSameAddress"
    | undefined;
  realAddr?: string;
  isAddressCheckLoading: boolean;
  isCFAddress: boolean;
  isContractAddress: boolean;
  addrStatus: AddressError;
  disableWithdrawList?: string[];
  onWithdrawClick: (data: T, isFirstTime?: boolean) => void;
  handleFeeChange: (value: C) => void;
  handleWithdrawTypeChange: (value: WithdrawType) => void;
  handleOnAddressChange: (value: string | undefined | I) => void;
  wait?: number;
  onBack?: () => void;
  isToMyself?: boolean;
  sureIsAllowAddress: EXCHANGE_TYPE | undefined;
  handleSureIsAllowAddress: (value: EXCHANGE_TYPE) => void;
} & WithdrawInfoProps<C>;

export type WithdrawViewProps<T, I, C = CoinKey<I> | string> =
  BasicACoinTradeViewProps<T, I> & WithdrawExtendProps<T, I, C>;

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
} & (
  | {
      type?: "TOKEN";
      coinMap: CoinMap<I, CoinInfo<I>>;
      walletMap: WalletMap<I, WalletCoin<I>>;
    }
  | {
      type: "NFT";
      coinMap?: CoinMap<I, CoinInfo<I>>;
      walletMap?: WalletMap<I, WalletCoin<I>>;
    }
);

type DefaultWithMethodProps<T, I> = DefaultProps<T, I>;

export type BasicACoinTradeViewProps<T, I> = Required<
  DefaultWithMethodProps<T, I>
> & {
  onChangeEvent: (index: 0 | 1, data: SwitchData<T>) => void;
} & Pick<InputButtonProps<T, I, CoinInfo<I>>, "handleError">;

export type BasicACoinTradeProps<T, I> = BasicACoinTradeViewProps<T, I> & {
  type?: "TOKEN";
  inputBtnRef: React.Ref<any>;
  inputButtonProps?: inputButtonDefaultProps<I, CoinInfo<I>>;
  inputButtonDefaultProps: inputButtonDefaultProps<I, CoinInfo<I>>;
};
export type BasicANFTTradeProps<T, I> = Omit<
  BasicACoinTradeViewProps<T, I>,
  "coinMap"
> & {
  type?: "NFT";
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
  ) => { error: boolean; message?: string | JSX.Element } | undefined;
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

export type NFTMintInfoProps<C> = {
  nftMintBtnStatus?: keyof typeof TradeBtnStatus | undefined;
  title?: string;
  description?: string;
  chargeFeeTokenList?: Array<C>;
  feeInfo: C;
  // isAvaiableId?: boolean;
  isFeeNotEnough?: boolean;
  handleFeeChange: (value: C) => void;
  wait?: number;
} & BtnInfoProps;

export type NFTMetaInfoProps<C> = {
  nftMetaBtnStatus?: keyof typeof TradeBtnStatus | undefined;
  title?: string;
  description?: string;
  chargeFeeTokenList?: Array<C>;
  feeInfo: C;
  // isNFTCheckLoading?: boolean;
  // isAvaiableId?: boolean;
  isFeeNotEnough?: boolean;
  handleFeeChange: (value: C) => void;
  wait?: number;
} & BtnInfoProps;

export type NFTMintExtendProps<T, C = FeeInfo> = {
  isThumb?: boolean;
  handleMintDataChange: (data: Partial<T>) => void;
  onNFTMintClick: (isFirstMint?: boolean) => void;
  allowTrade?: any;
  amountHandleError?: (
    data: T,
    ref: React.ForwardedRef<any>
  ) => { error: boolean; message?: string | JSX.Element } | void;
} & NFTMintInfoProps<C>;

export type NFTMetaExtendProps<T, C = FeeInfo> = {
  handleOnMetaChange: (data: Partial<T>) => void;
  onMetaClick: (data: Partial<T>, isFirstMint?: boolean) => void;
  userAgree: boolean;
  handleUserAgree: (value: boolean) => void;
  allowTrade?: any;
} & NFTMetaInfoProps<C>;

export type NFTMintViewProps<ME, MI, I, C> = {
  tradeData: MI;
  metaData: ME;
  disabled?: boolean;
  coinMap?: CoinMap<I, CoinInfo<I>>;
  walletMap?: WalletMap<I, WalletCoin<I>>;
  mintService: any;
} & NFTMintExtendProps<MI, C>;
export type NFTMetaViewProps<T, C> = {
  nftMeta: T;
  disabled?: boolean;
} & NFTMetaExtendProps<T, C>;
export type NFTMetaBlockProps<T, I, C> = NFTMetaViewProps<T, C> & {
  mintData: Partial<I>;
  handleMintDataChange: (data: Partial<I>) => void;
  amountHandleError?: (
    data: Partial<I>,
    ref: React.ForwardedRef<any>
  ) => { error: boolean; message?: string | JSX.Element } | void;
};

// export type NFTMintViewWholeProps<T, C> = {
//   metaData: Partial<T>;
//   disabled?: boolean;
// } & NFTMintExtendProps<T, C>;

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
  onBack: () => void;
  handleOnNFTDataChange: (data: T) => void;
  onNFTDeployClick: (data: T, isFirstTime?: boolean) => void;
  allowTrade?: any;
} & NFTDeployInfoProps<T, I, C>;

export type NFTDeployViewProps<T, I, C> = NFTDeployExtendProps<T, I, C>;

export type NFTMintAdvanceInfoProps<T, I, C> = DefaultWithMethodProps<T, I> & {
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

export type NFTMintAdvanceExtendProps<T, I, C = FeeInfo> = {
  isThumb?: boolean;
  handleOnNFTDataChange: (data: T) => void;
  onNFTMintClick: (data: T, isFirstMint?: boolean) => void;
  allowTrade?: any;
} & NFTMintAdvanceInfoProps<T, I, C>;
export type NFTMintAdvanceViewProps<T, I, C> = NFTMintAdvanceExtendProps<
  T,
  I,
  C
>;
