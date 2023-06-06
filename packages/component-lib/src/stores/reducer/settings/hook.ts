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
  LanguageKeys,
  LanguageType,
  ThemeKeys,
  ThemeType,
  UpColor,
  NETWORKEXTEND,
} from "@loopring-web/common-resources";
import React from "react";
import { Currency } from "@loopring-web/loopring-sdk";
import { Layouts } from "react-grid-layout";
import * as sdk from "@loopring-web/loopring-sdk";

export function useSettings(): SettingsState & {
  setPlatform(value: keyof typeof PlatFormType): void;
  setTheme(value: ThemeKeys): void;
  setDefaultNetwork(value: sdk.ChainId | number): void;
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
      (value: NETWORKEXTEND | number) => dispatch(setDefaultNetwork(value)),
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
