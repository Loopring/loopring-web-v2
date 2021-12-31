import { updateAccountStatus } from "../../stores/account";
import {
  AccountStep,
  setShowAccount,
  setShowConnect,
} from "@loopring-web/component-lib";
import store from "../../stores";
import { AccountStatus, FeeInfo } from "@loopring-web/common-resources";
import { myLog } from "@loopring-web/common-resources";
import { LoopringAPI } from "api_wrapper";
import { connectProvides } from "@loopring-web/web3-provider";
import * as sdk from "@loopring-web/loopring-sdk";
import { ActionResult, ActionResultCode, DAYS } from "defs/common_defs";
import { getTimestampDaysLater } from "utils/dt_tools";

export async function activeAccount({
  reason,
  shouldShow,
}: {
  reason: any;
  shouldShow: boolean;
}) {
  const account = store.getState().account;
  // const {exchangeInfo} = store.getState().system;
  if (reason?.response?.data?.resultInfo?.code === 100001) {
    // deposited, but need update account
    myLog("SignAccount");
    store.dispatch(setShowConnect({ isShow: false }));
    store.dispatch(
      setShowAccount({ isShow: true, step: AccountStep.UpdateAccount })
    );
    store.dispatch(
      updateAccountStatus({ readyState: AccountStatus.NOT_ACTIVE })
    );
  } else {
    // need to deposit.
    let activeDeposit = localStorage.getItem("activeDeposit");
    if (activeDeposit) {
      activeDeposit = JSON.stringify(activeDeposit);
    }
    if (activeDeposit && activeDeposit[account.accAddress]) {
      myLog("DEPOSITING");
      store.dispatch(setShowConnect({ isShow: false }));
      store.dispatch(
        setShowAccount({ isShow: shouldShow, step: AccountStep.Deposit_Submit })
      );
      store.dispatch(
        updateAccountStatus({ readyState: AccountStatus.DEPOSITING })
      );
      // store.dispatch(statusAccountUnset(undefined))
    } else {
      myLog("NO_ACCOUNT");
      setShowConnect({ isShow: false });
      setShowAccount({ isShow: shouldShow, step: AccountStep.NoAccount });
      store.dispatch(
        updateAccountStatus({ readyState: AccountStatus.NO_ACCOUNT })
      );
      // store.dispatch(statusAccountUnset(undefined));
    }
  }
}

export async function updateAccountFromServer({
  isHWAddr,
  feeInfo,
  isReset,
}: {
  isHWAddr: boolean;
  feeInfo?: FeeInfo;
  isReset?: boolean;
}) {
  const system = store.getState().system;
  const account = store.getState().account;

  let eddsaKey = isReset ? undefined : account.eddsaKey;

  myLog("before check!", account);

  let result: ActionResult = { code: ActionResultCode.NoError };

  try {
    if (
      LoopringAPI.userAPI &&
      LoopringAPI.exchangeAPI &&
      system.exchangeInfo &&
      connectProvides.usedWeb3 &&
      account &&
      system.chainId !== "unknown" &&
      account.connectName !== "unknown"
    ) {
      const { accInfo } = await LoopringAPI.exchangeAPI.getAccount({
        owner: account.accAddress,
      });

      if (accInfo?.owner && accInfo?.accountId) {
        const connectName = account.connectName as sdk.ConnectorNames;

        try {
          if (!eddsaKey) {
            myLog("no eddsaKey ！!");
            eddsaKey = await sdk.generateKeyPair({
              web3: connectProvides.usedWeb3,
              address: accInfo.owner,
              exchangeAddress: system.exchangeInfo.exchangeAddress,
              keyNonce: accInfo.nonce,
              walletType: connectName,
              chainId: system.chainId as any,
            });
            myLog("no eddsaKey! after generateKeyPair");
          }

          try {
            let tokenId = 0;

            let feeVol = "0";

            if (feeInfo) {
              tokenId = feeInfo.__raw__.tokenId;
              feeVol = feeInfo.__raw__.feeRaw;
            }

            const request: sdk.UpdateAccountRequestV3 = {
              exchange: system.exchangeInfo.exchangeAddress,
              owner: accInfo.owner,
              accountId: accInfo.accountId,
              publicKey: { x: eddsaKey.formatedPx, y: eddsaKey.formatedPy },
              maxFee: { tokenId, volume: feeVol },
              validUntil: getTimestampDaysLater(DAYS),
              nonce: accInfo.nonce as number,
            };

            myLog("updateAccountFromServer req:", request);

            const response = await LoopringAPI.userAPI.updateAccount({
              request,
              web3: connectProvides.usedWeb3,
              chainId: system.chainId,
              walletType: connectName,
              isHWAddr,
            });

            myLog("updateAccountResponse:", response);

            if ((response as sdk.ErrorMsg)?.errMsg) {
              result.code = ActionResultCode.UpdateAccoutError;
              result.data = {
                eddsaKey,
                ...response,
              };
            } else if (
              (response as sdk.TX_HASH_RESULT<sdk.TX_HASH_API>)?.resultInfo
            ) {
              result.code = ActionResultCode.UpdateAccoutError;
              result.data = {
                eddsaKey,
                ...response,
              };
            } else {
              result.data = {
                response,
                eddsaKey,
              };
            }
          } catch (reason) {
            result.code = ActionResultCode.UpdateAccoutError;
            result.data = reason;
            sdk.dumpError400(reason);
          }
        } catch (reason) {
          myLog("GenEddsaKeyError!!!!!! ");

          result.code = ActionResultCode.GenEddsaKeyError;
          result.data = reason;
          sdk.dumpError400(reason);
        }
      }
    }
  } catch (reason) {
    myLog("other error!!!!!!! ");
    result.code = ActionResultCode.GetAccError;
    result.data = reason;
    sdk.dumpError400(reason);
  }

  return result;
}
