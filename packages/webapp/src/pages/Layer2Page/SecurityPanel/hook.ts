import { AccountStatus, myLog } from "@loopring-web/common-resources";
import { useAccount } from "../../../stores/account";
import React from "react";

import { AccountStep, useOpenModals } from "@loopring-web/component-lib";
import store from "stores";
import * as sdk from "@loopring-web/loopring-sdk";
import { LoopringAPI } from "api_wrapper";

import { connectProvides } from "@loopring-web/web3-provider";

import { checkErrorInfo } from "hooks/useractions/utils";

export function useResetAccount() {
  const { setShowResetAccount } = useOpenModals();

  const resetKeypair = React.useCallback(() => {
    setShowResetAccount({ isShow: true });
  }, [setShowResetAccount]);

  return {
    resetKeypair,
  };
}

export function useExportAccountInfo() {
  const { account } = useAccount();

  const { setShowExportAccount, setShowAccount } = useOpenModals();

  const exportAccInfo = React.useCallback(() => {
    if (account.readyState !== AccountStatus.ACTIVATED) {
      return undefined;
    }

    return {
      address: account.accAddress,
      accountId: account.accountId,
      level: account.level,
      nonce: account.nonce,
      apiKey: account.apiKey,
      publicX: account.eddsaKey.formatedPx,
      publicY: account.eddsaKey.formatedPy,
      privateKey: account.eddsaKey.sk,
    };
  }, [account]);

  const exportAccount = React.useCallback(async () => {
    const account = store.getState().account;
    const { exchangeInfo, chainId } = store.getState().system;

    myLog("exportAccount account:", account);

    if (exchangeInfo && LoopringAPI.userAPI && account.nonce !== undefined) {
      try {
        setShowAccount({
          isShow: true,
          step: AccountStep.ExportAccount_Approve_WaitForAuth,
        });

        const connectName = account.connectName as sdk.ConnectorNames;

        const eddsaKey = await sdk.generateKeyPair({
          web3: connectProvides.usedWeb3,
          address: account.accAddress,
          chainId: chainId as any,
          exchangeAddress: exchangeInfo.exchangeAddress,
          keyNonce: account.nonce - 1,
          walletType: connectName,
          accountId: account.accountId,
        });

        const { apiKey, raw_data } = await LoopringAPI.userAPI.getUserApiKey(
          {
            accountId: account.accountId,
          },
          eddsaKey.sk
        );

        myLog("unlockAccount raw_data:", raw_data);

        if (!apiKey && raw_data.resultInfo) {
          myLog("try to sendErrorUnlock....");
          setShowAccount({
            isShow: true,
            step: AccountStep.ExportAccount_Failed,
          });
        } else {
          myLog("try to sendAccountSigned....");
          setShowAccount({ isShow: false });
          setShowExportAccount({ isShow: true });
        }
      } catch (e) {
        myLog("unlockAccount e:", e);

        const errType = checkErrorInfo(e, true);
        switch (errType) {
          case sdk.ConnectorError.USER_DENIED:
            setShowAccount({
              isShow: true,
              step: AccountStep.ExportAccount_User_Denied,
            });
            return;
          default:
            break;
        }
        setShowAccount({
          isShow: true,
          step: AccountStep.ExportAccount_Failed,
        });
      }
    }
  }, [setShowAccount, setShowExportAccount]);

  return {
    exportAccInfo,
    exportAccount,
  };
}
