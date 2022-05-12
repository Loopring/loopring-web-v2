import {
  AccountStatus,
  myLog,
  UIERROR_CODE,
} from "@loopring-web/common-resources";
import { useAccount } from "@loopring-web/core";
import React from "react";

import { AccountStep, useOpenModals } from "@loopring-web/component-lib";
import { store } from "@loopring-web/core";
import * as sdk from "@loopring-web/loopring-sdk";
import { LoopringAPI } from "@loopring-web/core";

import { connectProvides } from "@loopring-web/web3-provider";

import { checkErrorInfo } from "@loopring-web/core";

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
          keySeed:
            account.keySeed && account.keySeed !== ""
              ? account.keySeed
              : sdk.GlobalAPI.KEY_MESSAGE.replace(
                  "${exchangeAddress}",
                  exchangeInfo.exchangeAddress
                ).replace("${nonce}", (account.nonce - 1).toString()),
          walletType: connectName,
          accountId: account.accountId,
        });

        const response = await LoopringAPI.userAPI.getUserApiKey(
          {
            accountId: account.accountId,
          },
          eddsaKey.sk
        );

        myLog("ExportAccount raw_data:", response);

        if (
          (response as sdk.RESULT_INFO).code ||
          (response as sdk.RESULT_INFO).message ||
          !response.apiKey
        ) {
          myLog("try to sendErrorUnlock....");
          setShowAccount({
            isShow: true,
            step: AccountStep.ExportAccount_Failed,
            error: response as sdk.RESULT_INFO,
          });
        } else {
          myLog("try to sendAccountSigned....");
          setShowAccount({ isShow: false });
          setShowExportAccount({ isShow: true });
        }
      } catch (e: any) {
        myLog("ExportAccount e:", e);

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
          error: {
            code: UIERROR_CODE.UNKNOWN,
            msg: e?.message,
          },
        });
      }
    }
  }, [setShowAccount, setShowExportAccount]);

  return {
    exportAccInfo,
    exportAccount,
  };
}
