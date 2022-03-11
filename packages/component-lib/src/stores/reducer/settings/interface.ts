import {
  LanguageKeys,
  ThemeKeys,
  UpColor,
} from "@loopring-web/common-resources";
import { Currency } from "@loopring-web/loopring-sdk";
import { Layouts } from "react-grid-layout";

export enum PlatFormType {
  mobile = "mobile",
  desktop = "desktop",
  tablet = "tablet",
}

export type PlatFormKeys = keyof typeof PlatFormType;

export interface SettingsState {
  themeMode: ThemeKeys;
  language: LanguageKeys;
  platform: PlatFormKeys;
  currency: Currency;
  upColor: keyof typeof UpColor;
  slippage: number | "N";
  coinJson: any;
  hideL2Assets: boolean;
  hideL2Action: boolean;
  hideLpToken: boolean;
  isMobile: boolean;
  hideSmallBalances: boolean;
  proLayout: Layouts;
  feeChargeOrder: string[];
}
