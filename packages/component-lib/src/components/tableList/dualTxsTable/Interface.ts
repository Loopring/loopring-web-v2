import { DualViewOrder } from "@loopring-web/common-resources";

export type RawDataDualTxsItem = DualViewOrder & {
  amount: string;
};

export type RawDataDualAssetItem = DualViewOrder & {
  amount: string;
};

export interface DualAssetTableProps<R> {
  rawData: R[];
  dualMarketMap: any;
  idIndex: { [key: string]: string };
  tokenMap: { [key: string]: any };
  showloading: boolean;
  getDualAssetList: (props: any) => Promise<void>;
  showDetail: (item: R) => void;
  pagination?: {
    pageSize: number;
    total: number;
  };
}

export enum LABEL_INVESTMENT_STATUS_MAP {
  INVESTMENT_RECEIVED = "labelInvestmentStatusSettled",
  DELIVERING = "labelInvestmentStatusDelivering",
  INVESTMENT_SUBSCRIBE = "labelInvestmentStatusSubscribe",
}
