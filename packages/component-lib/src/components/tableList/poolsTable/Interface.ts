import {
  Account,
  AmmDetail,
  TradeFloat,
  ForexMap,
} from "@loopring-web/common-resources";
import {
  LoopringMap,
  AmmPoolInProgressActivityRule,
  Currency,
} from "@loopring-web/loopring-sdk";

export type Row<T> = AmmDetail<T> & {
  tradeFloat?: TradeFloat;
};
export type PoolTableProps<T, R = Row<T>> = {
  rawData: R[];
  handleWithdraw: (row: R) => void;
  handleDeposit: (row: R) => void;
  activityInProgressRules: LoopringMap<AmmPoolInProgressActivityRule>;
  showFilter?: boolean;
  wait?: number;
  tableHeight?: number;
  coinJson: any;
  account: Account;
  tokenPrices: any;
  allowTrade?: { [key: string]: { enable: boolean; reason?: string } };
  showLoading?: boolean;
  tokenMap: { [key: string]: any };
  forexMap: ForexMap<Currency>;
  sortMethod: (sortedRows: any[], sortColumn: string) => any[];
};
