import { DualViewOrder } from "@loopring-web/common-resources";
import { DualDetailType } from "../../tradePanel";

export type RawDataDualTxsItem = DualViewOrder & {
  amount: string;
};

export type RawDataDualAssetItem = DualViewOrder & {
  amount: string;
};

export interface DualAssetTableProps<R> {
  rawData: R[];
  getDetail: (item: R) => DualDetailType;
  dualMarketMap: any;
  idIndex: { [key: string]: string };
  tokenMap: { [key: string]: any };
  showloading: boolean;
  getDualAssetList: (props: any) => Promise<void>;
  showDetail: (item: R) => void;
  refresh: (item: R) => void;
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
