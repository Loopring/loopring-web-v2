import { BIGO, store } from "../../index";
import { CoinKey, WalletCoin } from "@loopring-web/common-resources";
import * as sdk from "@loopring-web/loopring-sdk";

export type WalletMapExtend<C> = {
  [K in CoinKey<C>]?: WalletCoin<C> & {
    detail: sdk.UserBalanceInfo;
  };
};

export const makeWalletLayer2 = <C extends { [key: string]: any }>(
  needFilterZero: boolean,
  _isToL1?: boolean
): { walletMap: WalletMapExtend<C> | undefined } => {
  const { walletLayer2 } = store.getState().walletLayer2;
  const { tokenMap } = store.getState().tokenMap;
  let walletMap: WalletMapExtend<C> | undefined;

  if (walletLayer2) {
    walletMap = Reflect.ownKeys(walletLayer2).reduce((prev, item) => {
      const {
        total,
        locked,
        // pending: { withdraw },
      } = walletLayer2[item as string];
      const countBig = sdk.toBig(total).minus(sdk.toBig(locked));

      if (needFilterZero && countBig.eq(BIGO)) {
        return prev;
      }
      if (_isToL1 && /^LP-/gi.test(item.toString())) {
        return prev;
      }

      return {
        ...prev,
        [item]: {
          belong: item,
          count: sdk.fromWEI(tokenMap, item, countBig.toString()),
          detail: walletLayer2[item as string],
        },
      };
    }, {} as WalletMapExtend<C>);
  }

  return { walletMap };
};
