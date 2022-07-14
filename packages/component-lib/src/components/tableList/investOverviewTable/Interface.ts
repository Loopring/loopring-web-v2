import { InvestItem } from "@loopring-web/common-resources";

export type DepartmentRow = Required<InvestItem>;
export type RowInvest = DepartmentRow & {
  isExpanded?: boolean;
  children?: InvestItem[];
};

export enum SubRowAction {
  ToggleSubRow = "toggleSubRow",
}
export interface InvestRowAction {
  type: SubRowAction;
  symbol: string;
}
export type InvestOverviewTableProps<R = DepartmentRow> = {
  rawData: R[];
  // handleWithdraw: (row: R) => void;
  // handleDeposit: (row: R) => void;
  showFilter?: boolean;
  wait?: number;
  tableHeight?: number;
  coinJson: any;
  // account: Account;
  // tokenPrices: any;
  allowTrade?: { [key: string]: { enable: boolean; reason?: string } };
  showLoading?: boolean;
  // tokenMap: { [key: string]: any };
  // forexMap: ForexMap<Currency>;
  sortMethod: (sortedRows: any[], sortColumn: string) => any[];
  hideSmallBalances: boolean;
  setHideSmallBalances: (value: boolean) => void;
};
