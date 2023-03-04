import {
  Account,
  AmmDetail,
  CAMPAIGNTAGCONFIG,
  ForexMap,
  RowConfig,
  TradeFloat,
} from "@loopring-web/common-resources";
import { Currency } from "@loopring-web/loopring-sdk";

export type Row<T> = AmmDetail<T> & {
  tradeFloat?: TradeFloat;
};
export type PoolTableProps<T, R = Row<T>> = {
  rawData: R[];
  handleWithdraw: (row: R) => void;
  handleDeposit: (row: R) => void;
  campaignTagConfig?: CAMPAIGNTAGCONFIG;
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
  rowConfig?: typeof RowConfig;
};

export type IconColumnProps<R> = {
  row: R;
  account: Account;
  size?: number;
  campaignTagConfig?: CAMPAIGNTAGCONFIG;
};
