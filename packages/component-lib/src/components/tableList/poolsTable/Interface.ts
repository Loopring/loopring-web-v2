import { Account, AmmDetail, TradeFloat } from "@loopring-web/common-resources";
import {
  LoopringMap,
  AmmPoolInProgressActivityRule,
} from "@loopring-web/loopring-sdk";

export type Row<T> = AmmDetail<T> & {
  tradeFloat?: TradeFloat;
};
export type PoolTableProps<T, R = Row<T>> = {
  rawData: R[];
  activityInProgressRules: LoopringMap<AmmPoolInProgressActivityRule>;
  showFilter?: boolean;
  wait?: number;
  tableHeight?: number;
  coinJson: any;
  account: Account;
  forex?: number;
  tokenPrices: any;
  showLoading?: boolean;
  sortMethod: (sortedRows: any[], sortColumn: string) => any[];
};
