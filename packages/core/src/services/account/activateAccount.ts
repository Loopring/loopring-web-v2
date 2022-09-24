import {
  ActionResult,
  ActionResultCode,
  DAYS,
  getTimestampDaysLater,
  LoopringAPI,
  store,
  NETWORKEXTEND,
} from "../../index";
import { FeeInfo, myLog, UIERROR_CODE } from "@loopring-web/common-resources";
import {
  ConnectProviders,
  ConnectProvidersSignMap,
  connectProvides,
} from "@loopring-web/web3-provider";
import * as sdk from "@loopring-web/loopring-sdk";
import Web3 from "web3";

export async function activateAccount({
  isHWAddr,
  feeInfo = {} as FeeInfo,
}: {
  isHWAddr: boolean;
  feeInfo?: FeeInfo;
  isReset?: boolean;
}): Promise<ActionResult> {
  // let result: ActionResult =;
  let eddsaKey = undefined; //isReset ?  //: account.eddsaKey;
  const system = store.getState().system;
  const { tokenMap } = store.getState().tokenMap;
  const {
    accAddress,
    connectName,
    eddsaKey: { counterFactualInfo },
  } = store.getState().account;
  if (
    !system.exchangeInfo?.exchangeAddress ||
    system.chainId === NETWORKEXTEND.NONETWORK ||
    connectName === ConnectProviders.Unknown ||
    !accAddress
  ) {
    return {
      code: ActionResultCode.DataNotReady,
      data: {
        code: UIERROR_CODE.DATA_NOT_READY,
        message: "DATA NOT READY",
      },
    };
  }
  const accountResponse = await LoopringAPI?.exchangeAPI?.getAccount({
    owner: accAddress,
  });

  if (
    (accountResponse &&
      ((accountResponse as sdk.RESULT_INFO).code ||
        (accountResponse as sdk.RESULT_INFO).message)) ||
    !accountResponse?.accInfo?.accountId
  ) {
    return {
      code: ActionResultCode.GetAccError,
      data: accountResponse as sdk.RESULT_INFO,
    };
  }
  const { accInfo } = accountResponse;
  let keySeed = sdk.GlobalAPI.KEY_MESSAGE.replace(
    "${exchangeAddress}",
    system.exchangeInfo.exchangeAddress
  ).replace("${nonce}", accInfo.nonce.toString());
  if (feeInfo?.belong && feeInfo.feeRaw) {
    const feeToken = tokenMap[feeInfo.belong];
    const tokenId = feeToken.tokenId;
    const fee = feeInfo.feeRaw;
    try {
      eddsaKey = await sdk.generateKeyPair({
        web3: connectProvides.usedWeb3 as unknown as Web3,
        address: accInfo.owner,
        keySeed,
        walletType: (ConnectProvidersSignMap[connectName] ??
          connectName) as unknown as sdk.ConnectorNames,
        chainId: system.chainId as any,
        counterFactualInfo: counterFactualInfo ?? undefined,
      });
    } catch (error: any) {
      const data =
        typeof error === "string"
          ? {
              code: UIERROR_CODE.GENERATE_EDDSA,
              message: error,
            }
          : {
              code: UIERROR_CODE.GENERATE_EDDSA,
              ...error,
            };

      return {
        code: ActionResultCode.GenEddsaKeyError,
        data,
      };
    }
    myLog("generateKeyPair done");

    const request: sdk.UpdateAccountRequestV3 = {
      exchange: system.exchangeInfo.exchangeAddress,
      owner: accInfo.owner,
      accountId: accInfo.accountId,
      publicKey: { x: eddsaKey.formatedPx, y: eddsaKey.formatedPy },
      maxFee: {
        tokenId,
        volume: fee.toString(),
      },
      validUntil: getTimestampDaysLater(DAYS),
      keySeed,
      nonce: accInfo.nonce as number,
    };
    myLog("updateAccountFromServer req:", request);
    const response = await LoopringAPI?.userAPI?.updateAccount(
      {
        request,
        web3: connectProvides.usedWeb3 as unknown as Web3,
        chainId: system.chainId,
        walletType: (ConnectProvidersSignMap[connectName] ??
          connectName) as unknown as sdk.ConnectorNames,
        isHWAddr,
      },
      {
        accountId: accInfo.accountId,
        counterFactualInfo: eddsaKey.counterFactualInfo,
      }
    );
    myLog("updateAccountResponse:", response);
    if (
      response &&
      ((response as sdk.RESULT_INFO).code ||
        (response as sdk.RESULT_INFO).message)
    ) {
      return {
        code: ActionResultCode.UpdateAccountError,
        data: response as sdk.RESULT_INFO,
      };
    } else {
      return {
        code: ActionResultCode.NoError,
        data: { eddsaKey, accInfo },
      };
    }
  } else {
    return {
      code: ActionResultCode.DataNotReady,
      data: { eddsaKey, accInfo },
    };
  }
}
