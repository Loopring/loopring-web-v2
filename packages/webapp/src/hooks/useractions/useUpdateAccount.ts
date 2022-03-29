import React from "react";

import { updateAccountStatus, useAccount } from "stores/account";
import { FeeInfo, myLog } from "@loopring-web/common-resources";
import { AccountStep, useOpenModals } from "@loopring-web/component-lib";

import { activateAccount } from "services/account/activateAccount";

import {
  ActionResult,
  ActionResultCode,
  EddsaKey,
  REFRESH_RATE,
} from "defs/common_defs";

import { useWalletInfo } from "stores/localStore/walletInfo";

import { LoopringAPI } from "api_wrapper";

import { accountServices } from "../../services/account/accountServices";

import store from "stores";

import { ConnectorError, RESULT_INFO, sleep } from "@loopring-web/loopring-sdk";

import { checkErrorInfo } from "hooks/useractions/utils";
import * as sdk from "@loopring-web/loopring-sdk";

export function useUpdateAccount() {
  const { updateHW, checkHWAddr } = useWalletInfo();

  const { setShowAccount } = useOpenModals();

  const { account } = useAccount();

  const goUpdateAccount = React.useCallback(
    async ({
      isFirstTime = false,
      isReset = false,
      feeInfo,
    }: {
      isFirstTime?: boolean;
      isReset?: boolean;
      feeInfo?: FeeInfo;
    }) => {
      setShowAccount({
        isShow: true,
        step: isReset
          ? AccountStep.ResetAccount_Approve_WaitForAuth
          : AccountStep.UpdateAccount_Approve_WaitForAuth,
      });

      const isHWAddr = !isFirstTime ? true : checkHWAddr(account.accAddress);

      myLog(
        "goUpdateAccount: isFirstTime:",
        isFirstTime,
        " isReset:",
        isReset,
        " isHWAddr:",
        isHWAddr
      );

      const response: ActionResult = await activateAccount({
        isHWAddr,
        feeInfo,
        isReset,
      });

      switch (response.code) {
        case ActionResultCode.NoError:
          const { eddsaKey, accInfo } = response?.data as EddsaKey;
          if (!isFirstTime && isHWAddr) {
            updateHW({ wallet: account.accAddress, isHWAddr });
          }
          const [{ apiKey }, { walletType }] = await Promise.all([
            LoopringAPI.userAPI && accInfo && accInfo?.accountId !== -1
              ? LoopringAPI.userAPI.getUserApiKey(
                  {
                    accountId: accInfo.accountId,
                  },
                  eddsaKey.sk
                )
              : Promise.resolve({ apiKey: undefined } as any),
            LoopringAPI.walletAPI
              ? LoopringAPI.walletAPI.getWalletType({
                  wallet: account.accAddress,
                })
              : Promise.resolve({ walletType: undefined } as any),
          ]);
          accountServices.sendAccountSigned({
            apiKey,
            eddsaKey,
            isInCounterFactualStatus: walletType?.isInCounterFactualStatus,
            isContract: walletType?.isContract,
          });

          setShowAccount({
            isShow: true,
            step: isReset
              ? AccountStep.UpdateAccount_Success
              : AccountStep.ResetAccount_Success,
          });
          await sleep(1000);
          setShowAccount({ isShow: false });
          break;
        case ActionResultCode.UpdateAccoutError:
        case ActionResultCode.GenEddsaKeyError:
          const errMsg = checkErrorInfo(
            response?.data as RESULT_INFO,
            isFirstTime as boolean
          );
          switch (errMsg) {
            case ConnectorError.NOT_SUPPORT_ERROR:
              myLog("activateAccount UpdateAccount: NOT_SUPPORT_ERROR");
              setShowAccount({
                isShow: true,
                step: isReset
                  ? AccountStep.ResetAccount_First_Method_Denied
                  : AccountStep.UpdateAccount_First_Method_Denied,
              });
              return;
            case ConnectorError.USER_DENIED:
              myLog("activateAccount: USER_DENIED");
              setShowAccount({
                isShow: true,
                step: isReset
                  ? AccountStep.ResetAccount_User_Denied
                  : AccountStep.UpdateAccount_User_Denied,
              });
              return;
            default:
              myLog("activateAccount: Error");
              setShowAccount({
                isShow: true,
                step: isReset
                  ? AccountStep.ResetAccount_Failed
                  : AccountStep.UpdateAccount_Failed,
                error: response?.data as sdk.RESULT_INFO,
              });
              return;
          }
          break;
        default:
          myLog("activateAccount: USER_DENIED");
          setShowAccount({
            isShow: true,
            step: isReset
              ? AccountStep.ResetAccount_Failed
              : AccountStep.UpdateAccount_Failed,
            error: response?.data as sdk.RESULT_INFO,
          });
          return;

          break;
      }
    },
    [account.accAddress, checkHWAddr, setShowAccount, updateHW]
  );

  return {
    goUpdateAccount,
  };
}
