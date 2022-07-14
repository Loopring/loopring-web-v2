import { InvestItem } from "@loopring-web/common-resources";
import { TokenInfo } from "@loopring-web/loopring-sdk";

export type DepartmentRow = Required<InvestItem & { token: TokenInfo }>;
export type RowInvest = DepartmentRow & {
  isExpanded?: boolean;
  children?: InvestItem[];
};

export enum SubRowAction {
  ToggleSubRow = "toggleSubRow",
  UpdateRaw = "updateRaw",
}
export interface InvestRowAction<R = DepartmentRow> {
  type: SubRowAction;
  symbol?: string;
  rows?: R[];
}
export type InvestOverviewTableProps<R = DepartmentRow> = {
  rawData: R[];
  // showFilter?: boolean;
  wait?: number;
  // tableHeight?: number;
  coinJson: any;
  // allowTrade?: { [key: string]: { enable: boolean; reason?: string } };
  showLoading?: boolean;
  filterValue: string;
  getFilteredData: (filterValue: string) => void;
  sortMethod: (sortedRows: any[], sortColumn: string) => any[];
  // hideSmallBalances: boolean;
  // setHideSmallBalances: (value: boolean) => void;
};

export enum ColumnKey {
  TYPE = "TYPE",
  APR = "APR",
  DURATION = "DURATION",
  ACTION = "ACTION",
}
