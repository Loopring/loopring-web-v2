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
export const DirectionTag = "\u2192";
export const FeeChargeOrderDefault = ["ETH", "USDT", "LRC", "DAI", "USDC"];

export const LandPageHeightConfig = {
  headerHeight: 64,
  whiteHeight: 32,
  maxHeight: 836,
  minHeight: 800,
};
export const FeeChargeOrderUATDefault = ["USDT", "ETH", "LRC", "DAI"];
export const Explorer = "https://explorer.loopring.io/";
export const Bridge = "https://bridge.loopring.io/#/";
// export const maintainceStatTime = 1639980000000
// export const maintainceEndTime = 1639987200000
