import { Account, AmmDetail, MyAmmLP } from "@loopring-web/common-resources";
import { Currency } from "@loopring-web/loopring-sdk";

export type MyPoolRow<R> = MyAmmLP<R> & {
  ammDetail: AmmDetail<R>;
};

export type Method<R> = {
  handleWithdraw: (row: R) => void;
  handleDeposit: (row: R) => void;
  allowTrade?: any;
};

export type MyPoolTableProps<T, R = MyPoolRow<T>> = {
  rawData: R[];
  pagination?: {
    pageSize: number;
  };
  allowTrade?: any;
  page?: number;
  account: Account;
  handlePageChange: (page: number) => void;
  showFilter?: boolean;
  wait?: number;
  showloading?: boolean;
  currency?: Currency;
} & Method<R>;
