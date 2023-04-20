export enum BtradeSwapsType {
  Settled = "Settled",
  Delivering = "Delivering",
  Failed = "Failed",
  Pending = "Pending",
  Cancelled = "Cancelled",
}

export type RawDataBtradeSwapsItem = {
  type: BtradeSwapsType;
  fromAmount: string;
  fromSymbol: string;
  toAmount: string;
  toSymbol: string;
  fromFAmount: string;
  toFAmount: string;
  price: {
    key: string;
    value: string;
  };
  feeAmount: string;
  feeSymbol: string;
  time: number;
  filledPercent: string;
};
