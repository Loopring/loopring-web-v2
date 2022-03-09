import { AmmDetail, TradeFloat } from "@loopring-web/common-resources";
import { ActivityRulesMap } from "@loopring-web/webapp/src/stores/Amm/AmmActivityMap";

export type Row<T> = AmmDetail<T> & {
  tradeFloat?: TradeFloat;
};
export type PoolTableProps<T, R = Row<T>> = {
  rawData: R[];
  activityInProgressRules: ActivityRulesMap;
  showFilter?: boolean;
  wait?: number;
  tableHeight?: number;
  coinJson: any;
  forex?: number;
  tokenPrices: any;
  showLoading?: boolean;
  sortMethod: (sortedRows: any[], sortColumn: string) => any[];
};
