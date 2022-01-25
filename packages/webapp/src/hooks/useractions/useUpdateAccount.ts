import React from "react";

import { updateAccountStatus, useAccount } from "stores/account";
import { FeeInfo, myLog } from "@loopring-web/common-resources";
import { AccountStep, useOpenModals } from "@loopring-web/component-lib";

import { updateAccountFromServer } from "services/account/activateAccount";

import { ActionResult, ActionResultCode, REFRESH_RATE } from "defs/common_defs";

import { useWalletInfo } from "stores/localStore/walletInfo";

import { LoopringAPI } from "api_wrapper";

import { accountServices } from "../../services/account/accountServices";

import store from "stores";

import { ConnectorError, sleep } from "@loopring-web/loopring-sdk";

import { checkErrorInfo } from "hooks/useractions/utils";
import * as sdk from "@loopring-web/loopring-sdk";

export function useUpdateAccount() {
  const { updateHW, checkHWAddr } = useWalletInfo();

  const { setShowAccount } = useOpenModals();

  const { account } = useAccount();

  const goUpdateAccount = React.useCallback(
    async ({
      isFirstTime,
      isReset,
      feeInfo,
    }: {
      isFirstTime?: boolean;
      isReset?: boolean;
      feeInfo?: FeeInfo;
    }) => {
      if (isFirstTime === undefined) {
        isFirstTime = true;
      }

      if (isReset === undefined) {
        isReset = false;
      }

      if (!account.accAddress) {
        myLog("account.accAddress is nil");
        return;
      }

      setShowAccount({
        isShow: true,
        step: isReset
          ? AccountStep.ResetAccount_Approve_WaitForAuth
          : AccountStep.UpdateAccount_Approve_WaitForAuth,
      });

      let isHWAddr = checkHWAddr(account.accAddress);

      isHWAddr = !isFirstTime ? !isHWAddr : isHWAddr;

      myLog(
        "goUpdateAccount.... isFirstTime:",
        isFirstTime,
        " isReset:",
        isReset,
        " isHWAddr:",
        isHWAddr
      );

      const updateAccAndCheck = async () => {
        const result: ActionResult = await updateAccountFromServer({
          isHWAddr,
          feeInfo,
          isReset,
        });

        switch (result.code) {
          case ActionResultCode.NoError:
            const eddsaKey = result?.data?.eddsaKey;
            myLog(" after NoError:", eddsaKey);
            await sleep(REFRESH_RATE);

            if (
              LoopringAPI.userAPI &&
              LoopringAPI.exchangeAPI &&
              LoopringAPI.walletAPI &&
              eddsaKey
            ) {
              const response = await LoopringAPI.exchangeAPI.getAccount({
                owner: account.accAddress,
              });
              if (
                (response &&
                  ((response as sdk.RESULT_INFO).msg ||
                    (response as sdk.RESULT_INFO).message)) ||
                (response.accInfo && !response.accInfo?.accountId)
              ) {
                return;
              } else {
                const accInfo = response.accInfo;
                const [{ apiKey }, { walletType }] = await Promise.all([
                  LoopringAPI.userAPI.getUserApiKey(
                    {
                      accountId: accInfo.accountId,
                    },
                    eddsaKey.sk
                  ),
                  LoopringAPI.walletAPI?.getWalletType({
                    wallet: account.accAddress,
                  }),
                ]);

                myLog("After connect >>, get apiKey", apiKey);

                if (!isFirstTime && isHWAddr) {
                  updateHW({ wallet: account.accAddress, isHWAddr });
                }

                accountServices.sendAccountSigned({
                  accountId: accInfo.accountId,
                  nonce: accInfo.nonce,
                  apiKey,
                  eddsaKey,
                  isReset,
                  isInCounterFactualStatus:
                    walletType?.isInCounterFactualStatus,
                  isContract: walletType?.isContract,
                });
              }
            }

            if (isReset) {
              myLog("reset show success!!");
              setShowAccount({
                isShow: true,
                step: AccountStep.ResetAccount_Success,
              });
              if (LoopringAPI.exchangeAPI) {
                const { accInfo } = await LoopringAPI.exchangeAPI.getAccount({
                  owner: account.accAddress,
                });
                if (
                  accInfo &&
                  accInfo.accountId &&
                  accInfo.publicKey.x &&
                  accInfo.publicKey.y
                ) {
                  store.dispatch(updateAccountStatus(accInfo));
                } else {
                  myLog("unexpected accInfo:", accInfo);
                }
              }
            } else {
              myLog("not reset show account close!!");
              setShowAccount({ isShow: false });
            }
            break;
          case ActionResultCode.GetAccError:
          case ActionResultCode.GenEddsaKeyError:
          case ActionResultCode.UpdateAccoutError:
            const errMsg = checkErrorInfo(result?.data, isFirstTime as boolean);

            myLog("----------UpdateAccoutError errMsg:", errMsg);

            switch (errMsg) {
              case ConnectorError.NOT_SUPPORT_ERROR:
                myLog(" 00000---- got NOT_SUPPORT_ERROR");
                setShowAccount({
                  isShow: true,
                  step: isReset
                    ? AccountStep.ResetAccount_First_Method_Denied
                    : AccountStep.UpdateAccount_First_Method_Denied,
                });
                return;
              case ConnectorError.USER_DENIED:
                myLog(" 11111---- got USER_DENIED");
                setShowAccount({
                  isShow: true,
                  step: isReset
                    ? AccountStep.ResetAccount_User_Denied
                    : AccountStep.UpdateAccount_User_Denied,
                });
                return;
              default:
                myLog(" 11111---- got UpdateAccount_Success");
                setShowAccount({
                  isShow: true,
                  step: isReset
                    ? AccountStep.ResetAccount_Success
                    : AccountStep.UpdateAccount_Success,
                });
                accountServices.sendCheckAccount(account.accAddress);
                break;
            }
            break;
          default:
            break;
        }
      };

      updateAccAndCheck();
    },
    [account.accAddress, checkHWAddr, setShowAccount, updateHW]
  );

  return {
    goUpdateAccount,
  };
}
