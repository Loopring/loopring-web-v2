import { useDispatch, useSelector } from "react-redux";
import {
  setCoinJson,
  setCurrency,
  setFeeChargeOrder,
  setHideL2Action,
  setHideL2Assets,
  setHideLpToken,
  setHideSmallBalances,
  setIsMobile,
  setIsShowTestToggle,
  setIsTaikoTest,
  setLanguage,
  setLayouts,
  setPlatform,
  setSlippage,
  setSwapSecondConfirmation,
  setTheme,
  setUpColor,
  setStopLimitLayouts,
  setDefaultNetwork,
} from "./reducer";
import { PlatFormType, SettingsState } from "./interface";
import {
  AddressItemType,
  EXCHANGE_TYPE,
  L1L2_NAME_DEFINED,
  LanguageKeys,
  LanguageType,
  MapChainId,
  ThemeKeys,
  ThemeType,
  UpColor,
  WALLET_TYPE,
} from "@loopring-web/common-resources";
import React from "react";
import { Currency } from "@loopring-web/loopring-sdk";
import { Layouts } from "react-grid-layout";
import * as sdk from "@loopring-web/loopring-sdk";
import { useTranslation } from "react-i18next";

export function useSettings(): SettingsState & {
  setPlatform(value: keyof typeof PlatFormType): void;
  setTheme(value: ThemeKeys): void;
  setDefaultNetwork(value: sdk.ChainId): void;
  setUpColor(value: keyof typeof UpColor): void;
  setCurrency(value: Currency): void;
  setLanguage(value: LanguageKeys): void;
  setSlippage(value: "N" | number): void;
  setCoinJson(value: any): void;
  setHideL2Assets(value: boolean): void;
  setHideL2Action(value: boolean): void;
  setHideLpToken(value: boolean): void;
  setHideSmallBalances(value: boolean): void;
  setLayouts(value: Layouts): void;
  setStopLimitLayouts(value: Layouts): void;
  setFeeChargeOrder(value: string[]): void;
  setIsMobile(value: boolean): void;
  setSwapSecondConfirmation(value: boolean): void;
  setIsTaikoTest(value: boolean): void;
  setIsShowTestToggle(value: boolean): void;
} {
  const settings: SettingsState = useSelector((state: any) => state.settings);
  const dispatch = useDispatch();
  return {
    ...settings,
    setDefaultNetwork: React.useCallback(
      (value: number) => dispatch(setDefaultNetwork(value)),
      [dispatch]
    ),
    setIsShowTestToggle: React.useCallback(
      (value: boolean) => dispatch(setIsShowTestToggle(value)),
      [dispatch]
    ),
    setIsTaikoTest: React.useCallback(
      (value: boolean) => dispatch(setIsTaikoTest(value)),
      [dispatch]
    ),
    setTheme: React.useCallback(
      (value: keyof typeof ThemeType) => dispatch(setTheme(value)),
      [dispatch]
    ),
    setLanguage: React.useCallback(
      (value: keyof typeof LanguageType) => dispatch(setLanguage(value)),
      [dispatch]
    ),
    setPlatform: React.useCallback(
      (value: keyof typeof PlatFormType) => dispatch(setPlatform(value)),
      [dispatch]
    ),
    setCurrency: React.useCallback(
      (value: Currency) => dispatch(setCurrency(value)),
      [dispatch]
    ),
    setUpColor: React.useCallback(
      (value: keyof typeof UpColor) => dispatch(setUpColor(value)),
      [dispatch]
    ),
    setSlippage: React.useCallback(
      (value: "N" | number) => dispatch(setSlippage(value)),
      [dispatch]
    ),
    setCoinJson: React.useCallback(
      (value: any) => dispatch(setCoinJson(value)),
      [dispatch]
    ),
    setHideL2Assets: React.useCallback(
      (value: boolean) => dispatch(setHideL2Assets(value)),
      [dispatch]
    ),
    setHideL2Action: React.useCallback(
      (value: boolean) => dispatch(setHideL2Action(value)),
      [dispatch]
    ),
    setHideLpToken: React.useCallback(
      (value: boolean) => dispatch(setHideLpToken(value)),
      [dispatch]
    ),
    setHideSmallBalances: React.useCallback(
      (value: boolean) => dispatch(setHideSmallBalances(value)),
      [dispatch]
    ),
    setLayouts: React.useCallback(
      (value: Layouts) => dispatch(setLayouts(value)),
      [dispatch]
    ),
    setStopLimitLayouts: React.useCallback(
      (value: Layouts) => dispatch(setStopLimitLayouts(value)),
      [dispatch]
    ),
    setFeeChargeOrder: React.useCallback(
      (value: string[]) => dispatch(setFeeChargeOrder(value)),
      [dispatch]
    ),
    setIsMobile: React.useCallback(
      (value: boolean) => dispatch(setIsMobile(value)),
      [dispatch]
    ),
    setSwapSecondConfirmation: React.useCallback(
      (value: boolean) => dispatch(setSwapSecondConfirmation(value)),
      [dispatch]
    ),
  };
}

export const useAddressTypeLists = <
  T extends WALLET_TYPE | EXCHANGE_TYPE
>() => {
  const { t } = useTranslation("common");
  const { defaultNetwork } = useSettings();
  const network = MapChainId[defaultNetwork] ?? MapChainId[1];
  const walletList: AddressItemType<T>[] = [
    {
      label: t("labelWalletTypeOptions", {
        type: t(`labelWalletType${WALLET_TYPE.EOA}`, {
          l1ChainName: L1L2_NAME_DEFINED[network].l1ChainName,
          loopringL2: L1L2_NAME_DEFINED[network].loopringL2,
          l2Symbol: L1L2_NAME_DEFINED[network].l2Symbol,
          l1Symbol: L1L2_NAME_DEFINED[network].l1Symbol,
          ethereumL1: L1L2_NAME_DEFINED[network].ethereumL1,
        }),
      }),
      value: WALLET_TYPE.EOA as T,
      description: t(`label${WALLET_TYPE.EOA}Des`, {
        l1ChainName: L1L2_NAME_DEFINED[network].l1ChainName,
        loopringL2: L1L2_NAME_DEFINED[network].loopringL2,
        l2Symbol: L1L2_NAME_DEFINED[network].l2Symbol,
        l1Symbol: L1L2_NAME_DEFINED[network].l1Symbol,
        ethereumL1: L1L2_NAME_DEFINED[network].ethereumL1,
      }),
    },
    {
      label: t("labelWalletTypeOptions", {
        type: t(`labelWalletType${WALLET_TYPE.Loopring}`, {
          l1ChainName: L1L2_NAME_DEFINED[network].l1ChainName,
          loopringL2: L1L2_NAME_DEFINED[network].loopringL2,
          l2Symbol: L1L2_NAME_DEFINED[network].l2Symbol,
          l1Symbol: L1L2_NAME_DEFINED[network].l1Symbol,
          ethereumL1: L1L2_NAME_DEFINED[network].ethereumL1,
        }),
      }),
      value: WALLET_TYPE.Loopring as T,
      description: t(`label${WALLET_TYPE.Loopring}Des`, {
        l1ChainName: L1L2_NAME_DEFINED[network].l1ChainName,
        loopringL2: L1L2_NAME_DEFINED[network].loopringL2,
        l2Symbol: L1L2_NAME_DEFINED[network].l2Symbol,
        l1Symbol: L1L2_NAME_DEFINED[network].l1Symbol,
        ethereumL1: L1L2_NAME_DEFINED[network].ethereumL1,
      }),
    },
    {
      label: t("labelWalletTypeOptions", {
        l1ChainName: L1L2_NAME_DEFINED[network].l1ChainName,
        loopringL2: L1L2_NAME_DEFINED[network].loopringL2,
        l2Symbol: L1L2_NAME_DEFINED[network].l2Symbol,
        l1Symbol: L1L2_NAME_DEFINED[network].l1Symbol,
        ethereumL1: L1L2_NAME_DEFINED[network].ethereumL1,
        type: t(`labelWalletType${WALLET_TYPE.OtherSmart}`, {
          l1ChainName: L1L2_NAME_DEFINED[network].l1ChainName,
          loopringL2: L1L2_NAME_DEFINED[network].loopringL2,
          l2Symbol: L1L2_NAME_DEFINED[network].l2Symbol,
          l1Symbol: L1L2_NAME_DEFINED[network].l1Symbol,
          ethereumL1: L1L2_NAME_DEFINED[network].ethereumL1,
        }),
      }),
      disabled: true,
      value: WALLET_TYPE.OtherSmart as T,
      description: t(`label${WALLET_TYPE.OtherSmart}Des`, {
        l1ChainName: L1L2_NAME_DEFINED[network].l1ChainName,
        loopringL2: L1L2_NAME_DEFINED[network].loopringL2,
        l2Symbol: L1L2_NAME_DEFINED[network].l2Symbol,
        l1Symbol: L1L2_NAME_DEFINED[network].l1Symbol,
        ethereumL1: L1L2_NAME_DEFINED[network].ethereumL1,
      }),
    },
    {
      label: t(WALLET_TYPE.Exchange),
      value: WALLET_TYPE.Exchange as T,
      disabled: true,
      description: t(`label${WALLET_TYPE.Exchange}Des`, {
        l1ChainName: L1L2_NAME_DEFINED[network].l1ChainName,
        loopringL2: L1L2_NAME_DEFINED[network].loopringL2,
        l2Symbol: L1L2_NAME_DEFINED[network].l2Symbol,
        l1Symbol: L1L2_NAME_DEFINED[network].l1Symbol,
        ethereumL1: L1L2_NAME_DEFINED[network].ethereumL1,
      }),
    },
  ];
  const walletListFn: (type: WALLET_TYPE) => AddressItemType<T>[] = (
    type: WALLET_TYPE
  ) => {
    if (type === WALLET_TYPE.Exchange) throw "wrong type";
    return [
      {
        label: t("labelWalletTypeOptions", {
          l1ChainName: L1L2_NAME_DEFINED[network].l1ChainName,
          loopringL2: L1L2_NAME_DEFINED[network].loopringL2,
          l2Symbol: L1L2_NAME_DEFINED[network].l2Symbol,
          l1Symbol: L1L2_NAME_DEFINED[network].l1Symbol,
          ethereumL1: L1L2_NAME_DEFINED[network].ethereumL1,
          type: t(`labelWalletType${WALLET_TYPE.EOA}`, {
            l1ChainName: L1L2_NAME_DEFINED[network].l1ChainName,
            loopringL2: L1L2_NAME_DEFINED[network].loopringL2,
            l2Symbol: L1L2_NAME_DEFINED[network].l2Symbol,
            l1Symbol: L1L2_NAME_DEFINED[network].l1Symbol,
            ethereumL1: L1L2_NAME_DEFINED[network].ethereumL1,
          }),
        }),
        disabled: type === WALLET_TYPE.EOA ? false : true,
        value: WALLET_TYPE.EOA as T,
        description: t(`label${WALLET_TYPE.EOA}Des`, {
          l1ChainName: L1L2_NAME_DEFINED[network].l1ChainName,
          loopringL2: L1L2_NAME_DEFINED[network].loopringL2,
          l2Symbol: L1L2_NAME_DEFINED[network].l2Symbol,
          l1Symbol: L1L2_NAME_DEFINED[network].l1Symbol,
          ethereumL1: L1L2_NAME_DEFINED[network].ethereumL1,
        }),
      },
      {
        label: t("labelWalletTypeOptions", {
          l1ChainName: L1L2_NAME_DEFINED[network].l1ChainName,
          loopringL2: L1L2_NAME_DEFINED[network].loopringL2,
          l2Symbol: L1L2_NAME_DEFINED[network].l2Symbol,
          l1Symbol: L1L2_NAME_DEFINED[network].l1Symbol,
          ethereumL1: L1L2_NAME_DEFINED[network].ethereumL1,
          type: t(`labelWalletType${WALLET_TYPE.Loopring}`, {
            l1ChainName: L1L2_NAME_DEFINED[network].l1ChainName,
            loopringL2: L1L2_NAME_DEFINED[network].loopringL2,
            l2Symbol: L1L2_NAME_DEFINED[network].l2Symbol,
            l1Symbol: L1L2_NAME_DEFINED[network].l1Symbol,
            ethereumL1: L1L2_NAME_DEFINED[network].ethereumL1,
          }),
        }),
        disabled: type === WALLET_TYPE.Loopring ? false : true,
        value: WALLET_TYPE.Loopring as T,
        description: t(`label${WALLET_TYPE.Loopring}Des`, {
          l1ChainName: L1L2_NAME_DEFINED[network].l1ChainName,
          loopringL2: L1L2_NAME_DEFINED[network].loopringL2,
          l2Symbol: L1L2_NAME_DEFINED[network].l2Symbol,
          l1Symbol: L1L2_NAME_DEFINED[network].l1Symbol,
          ethereumL1: L1L2_NAME_DEFINED[network].ethereumL1,
        }),
      },
      {
        label: t("labelWalletTypeOptions", {
          l1ChainName: L1L2_NAME_DEFINED[network].l1ChainName,
          loopringL2: L1L2_NAME_DEFINED[network].loopringL2,
          l2Symbol: L1L2_NAME_DEFINED[network].l2Symbol,
          l1Symbol: L1L2_NAME_DEFINED[network].l1Symbol,
          ethereumL1: L1L2_NAME_DEFINED[network].ethereumL1,
          type: t(`labelWalletType${WALLET_TYPE.OtherSmart}`, {
            l1ChainName: L1L2_NAME_DEFINED[network].l1ChainName,
            loopringL2: L1L2_NAME_DEFINED[network].loopringL2,
            l2Symbol: L1L2_NAME_DEFINED[network].l2Symbol,
            l1Symbol: L1L2_NAME_DEFINED[network].l1Symbol,
            ethereumL1: L1L2_NAME_DEFINED[network].ethereumL1,
          }),
        }),
        disabled: type === WALLET_TYPE.OtherSmart ? false : true,
        value: WALLET_TYPE.OtherSmart as T,
        description: t(`label${WALLET_TYPE.OtherSmart}Des`, {
          l1ChainName: L1L2_NAME_DEFINED[network].l1ChainName,
          loopringL2: L1L2_NAME_DEFINED[network].loopringL2,
          l2Symbol: L1L2_NAME_DEFINED[network].l2Symbol,
          l1Symbol: L1L2_NAME_DEFINED[network].l1Symbol,
          ethereumL1: L1L2_NAME_DEFINED[network].ethereumL1,
        }),
      },
      {
        label: t(`labelExchange${EXCHANGE_TYPE.Binance}`, {
          l1ChainName: L1L2_NAME_DEFINED[network].l1ChainName,
          loopringL2: L1L2_NAME_DEFINED[network].loopringL2,
          l2Symbol: L1L2_NAME_DEFINED[network].l2Symbol,
          l1Symbol: L1L2_NAME_DEFINED[network].l1Symbol,
          ethereumL1: L1L2_NAME_DEFINED[network].ethereumL1,
        }),
        disabled: type === WALLET_TYPE.EOA ? false : true,
        value: EXCHANGE_TYPE.Binance as T,
        description: t("labelContactsBinanceNotSupportted", {
          l1ChainName: L1L2_NAME_DEFINED[network].l1ChainName,
          loopringL2: L1L2_NAME_DEFINED[network].loopringL2,
          l2Symbol: L1L2_NAME_DEFINED[network].l2Symbol,
          l1Symbol: L1L2_NAME_DEFINED[network].l1Symbol,
          ethereumL1: L1L2_NAME_DEFINED[network].ethereumL1,
        }),
      },
      {
        label: t(`labelExchange${EXCHANGE_TYPE.Huobi}`, {
          l1ChainName: L1L2_NAME_DEFINED[network].l1ChainName,
          loopringL2: L1L2_NAME_DEFINED[network].loopringL2,
          l2Symbol: L1L2_NAME_DEFINED[network].l2Symbol,
          l1Symbol: L1L2_NAME_DEFINED[network].l1Symbol,
          ethereumL1: L1L2_NAME_DEFINED[network].ethereumL1,
        }),
        disabled: type === WALLET_TYPE.EOA ? false : true,
        value: EXCHANGE_TYPE.Huobi as T,
        description: t("labelContactsHuobiNotSupportted", {
          l1ChainName: L1L2_NAME_DEFINED[network].l1ChainName,
          loopringL2: L1L2_NAME_DEFINED[network].loopringL2,
          l2Symbol: L1L2_NAME_DEFINED[network].l2Symbol,
          l1Symbol: L1L2_NAME_DEFINED[network].l1Symbol,
          ethereumL1: L1L2_NAME_DEFINED[network].ethereumL1,
        }),
      },
      {
        label: t(`labelExchange${EXCHANGE_TYPE.Others}`, {
          l1ChainName: L1L2_NAME_DEFINED[network].l1ChainName,
          loopringL2: L1L2_NAME_DEFINED[network].loopringL2,
          l2Symbol: L1L2_NAME_DEFINED[network].l2Symbol,
          l1Symbol: L1L2_NAME_DEFINED[network].l1Symbol,
          ethereumL1: L1L2_NAME_DEFINED[network].ethereumL1,
        }),
        disabled: type === WALLET_TYPE.EOA ? false : true,
        value: EXCHANGE_TYPE.Others as T,
        description: t("labelContactsOtherExchangesNotSupportted"),
      },
    ];
  };
  const nonExchangeList: AddressItemType<T>[] = [
    {
      label: t(`labelNonExchangeType`, {
        l1ChainName: L1L2_NAME_DEFINED[network].l1ChainName,
        loopringL2: L1L2_NAME_DEFINED[network].loopringL2,
        l2Symbol: L1L2_NAME_DEFINED[network].l2Symbol,
        l1Symbol: L1L2_NAME_DEFINED[network].l1Symbol,
        ethereumL1: L1L2_NAME_DEFINED[network].ethereumL1,
      }),
      value: EXCHANGE_TYPE.NonExchange as T,
      disabled: false,
      description: t(`labelNonExchangeTypeDes`, {
        l1ChainName: L1L2_NAME_DEFINED[network].l1ChainName,
        loopringL2: L1L2_NAME_DEFINED[network].loopringL2,
        l2Symbol: L1L2_NAME_DEFINED[network].l2Symbol,
        l1Symbol: L1L2_NAME_DEFINED[network].l1Symbol,
        ethereumL1: L1L2_NAME_DEFINED[network].ethereumL1,
      }),
    },
  ];
  const exchangeList: AddressItemType<T>[] = [
    {
      label: t(`labelExchange${EXCHANGE_TYPE.Binance}`, {
        l1ChainName: L1L2_NAME_DEFINED[network].l1ChainName,
        loopringL2: L1L2_NAME_DEFINED[network].loopringL2,
        l2Symbol: L1L2_NAME_DEFINED[network].l2Symbol,
        l1Symbol: L1L2_NAME_DEFINED[network].l1Symbol,
        ethereumL1: L1L2_NAME_DEFINED[network].ethereumL1,
      }),
      value: EXCHANGE_TYPE.Binance as T,
      disabled: false,
      description: t(`labelExchange${EXCHANGE_TYPE.Binance}Des`, {
        l1ChainName: L1L2_NAME_DEFINED[network].l1ChainName,
        loopringL2: L1L2_NAME_DEFINED[network].loopringL2,
        l2Symbol: L1L2_NAME_DEFINED[network].l2Symbol,
        l1Symbol: L1L2_NAME_DEFINED[network].l1Symbol,
        ethereumL1: L1L2_NAME_DEFINED[network].ethereumL1,
      }),
      maxWidth: "initial",
    },
    {
      label: t(`labelExchange${EXCHANGE_TYPE.Huobi}`, {
        l1ChainName: L1L2_NAME_DEFINED[network].l1ChainName,
        loopringL2: L1L2_NAME_DEFINED[network].loopringL2,
        l2Symbol: L1L2_NAME_DEFINED[network].l2Symbol,
        l1Symbol: L1L2_NAME_DEFINED[network].l1Symbol,
        ethereumL1: L1L2_NAME_DEFINED[network].ethereumL1,
      }),
      value: EXCHANGE_TYPE.Huobi as T,
      disabled: false,
      description: t(`labelExchange${EXCHANGE_TYPE.Huobi}Des`, {
        l1ChainName: L1L2_NAME_DEFINED[network].l1ChainName,
        loopringL2: L1L2_NAME_DEFINED[network].loopringL2,
        l2Symbol: L1L2_NAME_DEFINED[network].l2Symbol,
        l1Symbol: L1L2_NAME_DEFINED[network].l1Symbol,
        ethereumL1: L1L2_NAME_DEFINED[network].ethereumL1,
      }),
      maxWidth: "initial",
    },
    {
      label: t(`labelExchange${EXCHANGE_TYPE.Others}`, {
        l1ChainName: L1L2_NAME_DEFINED[network].l1ChainName,
        loopringL2: L1L2_NAME_DEFINED[network].loopringL2,
        l2Symbol: L1L2_NAME_DEFINED[network].l2Symbol,
        l1Symbol: L1L2_NAME_DEFINED[network].l1Symbol,
        ethereumL1: L1L2_NAME_DEFINED[network].ethereumL1,
      }),
      value: EXCHANGE_TYPE.Others as T,
      disabled: false,
      description: t(`labelExchange${EXCHANGE_TYPE.Others}Des`, {
        l1ChainName: L1L2_NAME_DEFINED[network].l1ChainName,
        loopringL2: L1L2_NAME_DEFINED[network].loopringL2,
        l2Symbol: L1L2_NAME_DEFINED[network].l2Symbol,
        l1Symbol: L1L2_NAME_DEFINED[network].l1Symbol,
        ethereumL1: L1L2_NAME_DEFINED[network].ethereumL1,
      }),
      maxWidth: "initial",
    },
  ];
  return {
    walletList,
    walletListFn,
    nonExchangeList,
    exchangeList,
  };
};
