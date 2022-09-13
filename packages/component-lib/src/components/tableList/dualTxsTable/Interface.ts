import * as sdk from "@loopring-web/loopring-sdk";
import { DualViewInfo } from "@loopring-web/common-resources";

export type RawDataDualTxsItem = Partial<sdk.UserDualTxsHistory> & DualViewInfo;

export type RawDataDualAssetItem = DualViewInfo & {
  amount: string;
  order: string;
};

export interface DualAssetTableProps<R> {
  rawData: R[];
  idIndex: { [key: string]: string };
  tokenMap: { [key: string]: any };
  showloading: boolean;
  getDualAssetList: (props: any) => Promise<void>;
  pagination?: {
    pageSize: number;
    total: number;
  };
}

export enum LABEL_INVESTMENT_STATUS {
  INVESTMENT_SUCCEEDED = "INVESTMENT_SUCCEEDED",
  INVESTMENT_FAILED = "INVESTMENT_FAILED",
  INVESTMENT_RECEIVED = "INVESTMENT_RECEIVED",
}

export enum SETTLEMENT_STATUS {
  UNSETTLED = "UNSETTLED",
  SETTLED = "SETTLED",
  PAID = "PAID",
}

export enum LABEL_INVESTMENT_STATUS_MAP {
  INVESTMENT_RECEIVED = "labelInvestmentStatusSettled",
  DELIVERING = "labelInvestmentStatusDelivering",
  INVESTMENT_SUBSCRIBE = "labelInvestmentStatusSubscribe",
}
