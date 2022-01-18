import store from "../../stores";
import { LoopringAPI } from "../../api_wrapper";
import { Account } from "@loopring-web/common-resources";
import { updateActiveAccountData } from "stores/router";
export const checkIsFeeEnough = async <T>(account?: Partial<Account>) => {
  account = account ?? store.getState().account;
  const { fees } =
    (await LoopringAPI?.globalAPI?.getActiveFeeInfo({
      accountId:
        account.accountId && account.accountId !== -1
          ? account.accountId
          : undefined,
    })) ?? {};
  if (fees) {
    const activeFee = Reflect.ownKeys(fees).reduce((pre, item) => {
      return [
        ...pre,
        {
          feeRaw: fees[item.toString()].fee,
          belong: item.toString(),
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
  }
};
