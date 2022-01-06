import store from "../../stores";
import { LoopringAPI } from "../../api_wrapper";
import * as sdk from "@loopring-web/loopring-sdk";
import { myLog } from "@loopring-web/common-resources";
import { resetActiveAccountData, updateActiveAccountData } from "stores/router";
import { WalletLayer2Map } from "../../stores/walletLayer2";
export const checkIsFeeEnough = async <T>(): Promise<boolean> => {
  const account = store.getState().account;
  // const { activeAccountValue } = store.getState()._router_modalData;

  if (account.accountId && account.accountId !== -1) {
    const { fees } =
      (await LoopringAPI?.globalAPI?.getActiveFeeInfo({
        accountId: account.accountId,
      })) ?? {};
    if (fees) {
      let tokens = "";
      const activeFee = Reflect.ownKeys(fees).reduce((pre, item) => {
        tokens += `${item.toString()},`;
        return [
          ...pre,
          {
            feeRaw: fees[item.toString()].fee,
            ...fees[item.toString()],
          },
        ];
      }, [] as any);
      const { userBalances } =
        (await LoopringAPI?.globalAPI?.getUserBalanceForFee({
          accountId: account.accountId,
          tokens,
        })) ?? {};

      if (userBalances) {
        const index = Reflect.ownKeys(userBalances).findIndex((item) => {
          myLog("check fee for Active:");
          return sdk
            .toBig(userBalances[item.toString()].total)
            .gt(sdk.toBig(activeFee[item.toString()].feeRaw));
        });
        const walletLayer2 = Reflect.ownKeys(userBalances).reduce(
          (prev, item) => {
            // @ts-ignore
            return { ...prev, [idIndex[item]]: userBalances[Number(item)] };
          },
          {} as WalletLayer2Map<T>
        );
        store.dispatch(
          updateActiveAccountData({ chargeFeeList: activeFee, walletLayer2 })
        );
        return index === -1 ? false : true;
        // walletLayer2
      } else {
        store.dispatch(
          updateActiveAccountData({
            chargeFeeList: activeFee,
            walletLayer2: undefined,
          })
        );
        return false;
      }
    } else {
      resetActiveAccountData(undefined);
      return false;
    }
  } else {
    const { fees } = (await LoopringAPI?.globalAPI?.getActiveFeeInfo({})) ?? {
      fees: {},
    };
    const activeFee = Reflect.ownKeys(fees).reduce((pre, item) => {
      return [
        ...pre,
        {
          feeRaw: fees[item.toString()].fee,
          ...fees[item.toString()],
        },
      ];
    }, [] as any);
    store.dispatch(
      updateActiveAccountData({
        chargeFeeList: activeFee,
        walletLayer2: undefined,
      })
    );
    return false;
  }
};
