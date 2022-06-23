import {
  Account,
  AmmDetail,
  CoinKey,
  ForexMap,
  MyAmmLP,
} from "@loopring-web/common-resources";
import { Currency, LoopringMap, TokenInfo } from "@loopring-web/loopring-sdk";

export type MyPoolRow<R> = MyAmmLP<R> & {
  ammDetail: AmmDetail<R>;
};

export type Method<R> = {
  handleWithdraw: (row: R) => void;
  handleDeposit: (row: R) => void;
  allowTrade?: any;
};

export type MyPoolTableProps<R> = {
  rawData: R[];
  account: Account;
  title: string | (() => JSX.Element) | JSX.Element;
  pagination?: {
    pageSize: number;
  };
  forexMap: ForexMap<Currency>;
  tokenMap: LoopringMap<TokenInfo & { tradePairs: Array<CoinKey<R>> }>;
  allowTrade?: any;
  page?: number;
  tableHeight?: number;
  showFilter?: boolean;
  hideSmallBalances?: boolean;
  wait?: number;
  showloading?: boolean;
  currency?: Currency;
  handlePageChange: (page: number) => void;
  setHideSmallBalances: (value: boolean) => void;
} & Method<R>;
