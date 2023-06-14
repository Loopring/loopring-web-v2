import {
  LanguageKeys,
  ThemeKeys,
  UpColor,
} from "@loopring-web/common-resources";
import { Layouts } from "react-grid-layout";
import * as sdk from "@loopring-web/loopring-sdk";

export enum PlatFormType {
  mobile = "mobile",
  desktop = "desktop",
  tablet = "tablet",
}

export type PlatFormKeys = keyof typeof PlatFormType;
export type CoinSource = {
  x: number;
  y: number;
  w: number;
  h: number;
  offX: number;
  offY: number;
  sourceW: number;
  sourceH: number;
};

export interface SettingsState {
  themeMode: ThemeKeys;
  language: LanguageKeys;
  platform: PlatFormKeys;
  currency: sdk.Currency;
  upColor: keyof typeof UpColor;
  slippage: number | "N";
  coinJson: {
    [key: string]: CoinSource;
  };
  hideL2Assets: boolean;
  hideL2Action: boolean;
  hideInvestToken: boolean;
  isMobile: boolean;
  hideSmallBalances: boolean;
  proLayout: Layouts;
  stopLimitLayout: Layouts;
  feeChargeOrder: string[];
  swapSecondConfirmation: boolean | undefined;
  isTaikoTest?: boolean | undefined;
  isShowTestToggle?: boolean | undefined;
  defaultNetwork: sdk.ChainId;
}
