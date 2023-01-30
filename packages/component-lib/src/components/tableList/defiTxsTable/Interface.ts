import * as sdk from "@loopring-web/loopring-sdk";

export type RawDataDefiTxsItem = Partial<sdk.UserDefiTxsHistory>;

export interface DefiTxsTableProps<R = RawDataDefiTxsItem> {
  // etherscanBaseUrl?: string;
  rawData: R[];
  pagination?: {
    pageSize: number;
    total: number;
  };
  idIndex: { [key: string]: string };
  tokenMap: { [key: string]: any };

  getDefiTxList: (props: any) => Promise<void>;
  // filterTokens: string[];
  // showFilter?: boolean;
  showloading: boolean;
  // accAddress: string;
  // accountId: number;
}
