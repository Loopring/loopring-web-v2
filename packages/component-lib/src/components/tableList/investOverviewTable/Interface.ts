import { InvestItem } from "@loopring-web/common-resources";
import { TokenInfo, XOR } from "@loopring-web/loopring-sdk";

export type DepartmentRow = Required<InvestItem & { token: TokenInfo }>;
export type RowInvest = DepartmentRow & {
  isExpanded?: boolean;
  children?: InvestItem[];
};

export enum SubRowAction {
  ToggleSubRow = "toggleSubRow",
  UpdateRaw = "updateRaw",
  SortRow = "sortRow",
}
export interface InvestRowAction<R = DepartmentRow> {
  type: SubRowAction;
  symbol?: string;
  sortColumn?: string;
  _des?: "DESC" | "ASC" | undefined;
  rows?: R[];
}
type FilterExtend = {
  showFilter: boolean;
  filterValue: string;
  getFilteredData: (filterValue: string) => void;
};
export type InvestOverviewTableProps<R = DepartmentRow> = {
  rawData: R[];
  // showFilter?: boolean;
  wait?: number;
  // tableHeight?: number;
  coinJson: any;
  // allowTrade?: { [key: string]: { enable: boolean; reason?: string } };
  showLoading?: boolean;
  // sortMethod: (
  //   sortedRows: any[],
  //   sortColumn: string,
  //   des: "DESC" | "ASC" | undefined
  // ) => any[];
  // hideSmallBalances: boolean;
  // setHideSmallBalances: (value: boolean) => void;
} & XOR<FilterExtend, {}>;

export enum ColumnKey {
  TYPE = "TYPE",
  APR = "APR",
  DURATION = "DURATION",
  ACTION = "ACTION",
}
