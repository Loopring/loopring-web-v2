export type RawDataCexSwapsItem = {
  type: string;
  fromAmount: string;
  fromSymbol: string;
  toAmount: string;
  toSymbol: string;
  price: {
    key: string;
    value: string;
  };
  feeAmount: string;
  feeSymbol: string;
  time: number;
};

export enum CexSwapsType {
  Settled,
  Delivering,
  Failed,
  Pending,
  Cancelled,
}
