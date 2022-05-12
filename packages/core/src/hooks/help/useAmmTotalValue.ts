import React from "react";
import {
  store,
  volumeToCount,
  useWalletLayer2,
  useTokenPrices,
} from "../../index";
import { Currency } from "@loopring-web/loopring-sdk";

export const useAmmTotalValue = () => {
  const { walletLayer2 } = useWalletLayer2();
  const { tokenPrices } = useTokenPrices();
  const { forex } = store.getState().system;

  type GetAmmLiquidityProps = {
    market: string;
    balance?: number;
    currency?: Currency;
  };

  const getAmmLiquidity = React.useCallback(
    ({ market, balance, currency = Currency.usd }: GetAmmLiquidityProps) => {
      const price = tokenPrices && tokenPrices[market];
      let curBalance = 0;
      if (balance) {
        curBalance = balance;
      } else {
        // if balance is not given, use walletl2 total lp token balance instead
        curBalance = Number(
          Object.entries(walletLayer2 || {}).find(
            ([token]) => token === market
          )?.[1].total || 0
        );
      }
      const formattedBalance = volumeToCount(market, curBalance);
      const unit = currency && currency === Currency.cny ? forex : 1;
      return (price || 0) * (formattedBalance || 0) * (unit as number);
    },
    [walletLayer2, forex]
  );

  return {
    getAmmLiquidity,
  };
};
