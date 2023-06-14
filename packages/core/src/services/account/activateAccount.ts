import {
  DAYS,
  getTimestampDaysLater,
  LoopringAPI,
  store,
  NETWORKEXTEND,
  EddsaKey,
} from "../../index";
import { FeeInfo, myLog, UIERROR_CODE } from "@loopring-web/common-resources";
import { ConnectProviders, connectProvides } from "@loopring-web/web3-provider";
import * as sdk from "@loopring-web/loopring-sdk";
import Web3 from "web3";

export async function activateAccount({
  isHWAddr,
  feeInfo = {} as FeeInfo,
}: {
  isHWAddr: boolean;
  feeInfo?: FeeInfo;
  isReset?: boolean;
}): Promise<EddsaKey> {
  // let result: ActionResult =;
  const system = store.getState().system;
  let eddsaKey = undefined; //isReset ?  //: account.eddsaKey;
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
    !LoopringAPI?.exchangeAPI ||
    !accAddress
  ) {
    throw { code: UIERROR_CODE.DATA_NOT_READY };
  }
  let accInfo;
  try {
    const accountResponse = await LoopringAPI.exchangeAPI.getAccount({
      owner: accAddress,
    });
    if (
      (accountResponse as sdk.RESULT_INFO).code ||
      (accountResponse as sdk.RESULT_INFO).message
    ) {
      throw accountResponse;
    } else {
      accInfo = accountResponse.accInfo;
    }
  } catch (error: any) {
    throw error;
  }

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
        walletType: (ConnectProviders[connectName] ??
          connectName) as unknown as sdk.ConnectorNames,
        chainId: system.chainId as any,
        counterFactualInfo: counterFactualInfo ?? undefined,
      });
    } catch (error: any) {
      throw error;
    }
    myLog("generateKeyPair done");

    // @ts-ignore
    const request: sdk.UpdateAccountRequestV3 = {
      // // @ts-ignore
      // recommenderAccountId: "" as any,
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
    try {
      const response = await LoopringAPI?.userAPI?.updateAccount(
        {
          request,
          web3: connectProvides.usedWeb3 as unknown as Web3,
          chainId: system.chainId,
          walletType: (ConnectProviders[connectName] ??
            connectName) as unknown as sdk.ConnectorNames,
          isHWAddr,
        },
        {
          accountId: accInfo.accountId,
          counterFactualInfo: eddsaKey.counterFactualInfo,
        }
      );
      if (
        (response as sdk.RESULT_INFO).code ||
        (response as sdk.RESULT_INFO).message
      ) {
        throw response;
      } else {
        myLog("updateAccountResponse:", response);
        return {
          eddsaKey,
          accInfo,
          // code: ActionResultCode.NoError,
          // data: { eddsaKey, accInfo },
        };
      }
    } catch (error) {
      throw error;
    }
  } else {
    throw { code: UIERROR_CODE.ERROR_ON_FEE_UI };
  }
}
