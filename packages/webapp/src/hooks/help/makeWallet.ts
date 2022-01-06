import store from "../../stores";
import { CoinKey, myLog, WalletCoin } from "@loopring-web/common-resources";
import * as sdk from "@loopring-web/loopring-sdk";
import { BIGO } from "defs/common_defs";

export type WalletMapExtend<C> = {
  [K in CoinKey<C>]?: WalletCoin<C> & {
    detail: sdk.UserBalanceInfo;
  };
};

export const makeWalletLayer2 = <C extends { [key: string]: any }>(
  needFilterZero: boolean,
  isWithdraw?: boolean
): { walletMap: WalletMapExtend<C> | undefined } => {
  const { walletLayer2 } = store.getState().walletLayer2;
  const { tokenMap, disableWithdrawList } = store.getState().tokenMap;
  let walletMap: WalletMapExtend<C> | undefined;

  if (walletLayer2) {
    walletMap = Reflect.ownKeys(walletLayer2).reduce((prev, item) => {
      const {
        total,
        locked,
        pending: { withdraw },
      } = walletLayer2[item as string];
      const countBig = sdk.toBig(total).minus(sdk.toBig(locked));

      if (
        (needFilterZero && countBig.eq(BIGO)) ||
        (isWithdraw && disableWithdrawList.includes(item as string))
      ) {
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
