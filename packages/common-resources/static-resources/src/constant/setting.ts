import { IsMobile } from "../utils";

export enum UpColor {
  green = "green",
  red = "red",
}

export const SlippageTolerance: Array<0.1 | 0.5 | 1 | string> = [0.1, 0.5, 1];

export const RowConfig = {
  rowHeight: IsMobile.any() ? 48 : 44,
  rowHeaderHeight: IsMobile.any() ? 48 : 44,
};
export const RowInvestConfig = {
  rowHeight: IsMobile.any() ? 48 : 56,
  rowHeaderHeight: IsMobile.any() ? 48 : 56,
};
export const DirectionTag = "\u2192";
export const FeeChargeOrderDefault = ["ETH", "USDT", "LRC", "DAI", "USDC"];

export const LandPageHeightConfig = {
  headerHeight: 64,
  whiteHeight: 32,
  maxHeight: 836,
  minHeight: 800,
};
export const Lang = {
  en_US: "en",
  zh_CN: "zh",
};
export const FeeChargeOrderUATDefault = ["USDT", "ETH", "LRC", "DAI"];
export const Explorer = "https://explorer.loopring.io/";
export const Bridge = "https://bridge.loopring.io/#/";
// export const maintainceStatTime = 1639980000000
// export const maintainceEndTime = 1639987200000
export const YEAR_PROMATE = "YYYY";
export const DAY_FORMAT = "MM/DD";
export const MINUTE_FORMAT = "HH:mm";
export const DAT_STRING_FORMAT = "MMM DD [UTC]Z";
export const SECOND_FORMAT = `${MINUTE_FORMAT}:ss`;
export const YEAR_DAY_FORMAT = `${YEAR_PROMATE}/${DAY_FORMAT}`;
export const YEAR_DAY_MINUTE_FORMAT = `${YEAR_DAY_FORMAT} ${MINUTE_FORMAT}`;
export const YEAR_DAY_SECOND_FORMAT = `${YEAR_DAY_FORMAT} ${SECOND_FORMAT}`;
export const MINT_STRING_FORMAT = `${MINUTE_FORMAT} ${DAT_STRING_FORMAT}`;
export const UNIX_TIMESTAMP_FORMAT = "x";
