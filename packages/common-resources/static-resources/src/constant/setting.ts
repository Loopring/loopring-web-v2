import { IsMobile, myLog } from "../utils";

export enum UpColor {
  green = "green",
  red = "red",
}

export const SlippageTolerance: Array<0.1 | 0.5 | 1 | string> = [0.1, 0.5, 1];
export const SlippageBtradeTolerance: Array<0.1 | 0.5 | 1 | string> = [
  0.1, 0.5, 1,
];

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
export const HEADER_HEIGHT = 64;
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
export const Exchange = "https://loopring.io/#/";

export const YEAR_PROMATE = "YYYY";
export const DAY_FORMAT = "MM/DD";
export const MINUTE_FORMAT = "HH:mm";
export const DAY_MINUTE_FORMAT = `${DAY_FORMAT} ${MINUTE_FORMAT}`;
export const DAT_STRING_FORMAT = "MMM DD [UTC]Z";
export const SECOND_FORMAT = `${MINUTE_FORMAT}:ss`;
export const YEAR_DAY_FORMAT = `${YEAR_PROMATE}/${DAY_FORMAT}`;
export const YEAR_DAY_MINUTE_FORMAT = `${YEAR_DAY_FORMAT} ${MINUTE_FORMAT}`;
export const YEAR_DAY_SECOND_FORMAT = `${YEAR_DAY_FORMAT} ${SECOND_FORMAT}`;
export const MINT_STRING_FORMAT = `${MINUTE_FORMAT} ${DAT_STRING_FORMAT}`;
export const UNIX_TIMESTAMP_FORMAT = "x";
export const sizeNFTConfig = (size: "large" | "medium" | "small") => {
  switch (size) {
    case "large":
      return {
        wrap_xs: 12,
        wrap_md: 4,
        wrap_lg: 4,
        avatar: 40,
        contentHeight: 80,
      };
      break;
    case "small":
      return {
        wrap_xs: 6,
        wrap_md: 3,
        wrap_lg: 2,
        avatar: 28,
        contentHeight: 60,
      };
      break;
    case "medium":
      return {
        wrap_xs: 6,
        wrap_md: 3,
        wrap_lg: 3,
        avatar: 38,
        contentHeight: 72,
      };
      break;
  }
};

export enum TradeBtnStatus {
  AVAILABLE = "AVAILABLE",
  DISABLED = "DISABLED",
  LOADING = "LOADING",
}

const MapChainIdMap = new Map([
  [1, "ETHEREUM"],
  [5, "GOERLI"],
]);
export const ChainIdExtends: any = {
  NONETWORK: "unknown",
};

export const ChainTests: any[] = [5];
export const MapChainId = {};
export const NetworkMap = {};
const _NetworkMap = new Map([
  [
    1,
    {
      label: "Ethereum",
      chainId: "1",
    },
  ],
  [
    5,
    {
      label: "Görli",
      chainId: "",
      isTest: true,
    },
  ],
]);

(function (): void {
  process.env.REACT_APP_RPC_OTHERS?.split(",").forEach(
    (item: string, index: number) => {
      let [name, isTest] = process.env[
        `REACT_APP_RPC_CHAINNAME_${item}`
      ]?.split("|") ?? [""];
      if (name) {
        ChainIdExtends[name] = Number(item);
        MapChainIdMap.set(Number(item), name);
        myLog("MapChainIdMap", item, MapChainIdMap);
        if (isTest) {
          ChainTests.push(item);
        }
      } else {
        ChainIdExtends["unknown" + index] = item;
        MapChainIdMap.set(Number(item), "unknown");
      }
      _NetworkMap.set(Number(item), {
        label: name,
        chainId: index.toString(),
        // RPC: process.env[`REACT_APP_RPC_URL_${item}`] ?? "",
        isTest: isTest ? true : false,
      });
    }
  );
  [..._NetworkMap.entries()].reduce((prev, [key, value]) => {
    prev[key] = value;
    return prev;
  }, NetworkMap);
  myLog("NetworkMap", NetworkMap);
  [...MapChainIdMap.entries()].reduce((prev, [key, value]) => {
    prev[key] = value;
    return prev;
  }, MapChainId);
})();
