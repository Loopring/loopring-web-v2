import {
  ConnectProvidersSignMap,
  connectProvides,
} from "@loopring-web/web3-provider";
import { LoopringAPI, store } from "../../index";
import { accountServices } from "./accountServices";
import { myLog, UIERROR_CODE } from "@loopring-web/common-resources";
import * as sdk from "@loopring-web/loopring-sdk";
import Web3 from "web3";

export async function unlockAccount() {
  myLog("unlockAccount starts");
  const accounStore = store.getState().account;
  const { exchangeInfo, chainId } = store.getState().system;
  accountServices.sendSign();
  const { isMobile } = store.getState().settings;
  myLog("unlockAccount account:", accounStore);

  if (
    exchangeInfo &&
    LoopringAPI.userAPI &&
    LoopringAPI.exchangeAPI &&
    LoopringAPI.walletAPI &&
    accounStore.nonce !== undefined
  ) {
    let walletType, account;
    try {
      const connectName = (ConnectProvidersSignMap[accounStore.connectName] ??
        accounStore.connectName) as unknown as sdk.ConnectorNames;
      const walletTypePromise: Promise<{ walletType: any }> =
        window.ethereum &&
        connectName === sdk.ConnectorNames.MetaMask &&
        isMobile
          ? Promise.resolve({ walletType: undefined })
          : LoopringAPI.walletAPI.getWalletType({
              wallet: accounStore.accAddress,
            });
      [{ accInfo: account }, { walletType }] = await Promise.all([
        LoopringAPI.exchangeAPI.getAccount({
          owner: accounStore.accAddress,
        }),
        walletTypePromise,
      ])
        .then((response) => {
          if ((response[0] as sdk.RESULT_INFO)?.code) {
            throw response[0];
          }
          return response as any;
        })
        .catch((error) => {
          throw error;
        });

      const nonce = account ? account.nonce : accounStore.nonce;

      const msg =
        account.keySeed && account.keySeed !== ""
          ? account.keySeed
          : sdk.GlobalAPI.KEY_MESSAGE.replace(
              "${exchangeAddress}",
              exchangeInfo.exchangeAddress
            ).replace("${nonce}", (nonce - 1).toString());

      myLog("generateKeyPair:", msg, chainId, isMobile);
      // @ts-ignore
      const response = await LoopringAPI.userAPI.unLockAccount(
        {
          keyPair: {
            web3: connectProvides.usedWeb3 as unknown as Web3,
            address: account.owner,
            keySeed: msg,
            walletType: connectName,
            chainId: Number(chainId),
            accountId: Number(account.accountId),
            isMobile: isMobile,
          },
          request: {
            accountId: account.accountId,
          },
        },
        // @ts-ignore
        account.publicKey
      );
      if (
        response.hasOwnProperty("apiKey") &&
        response.hasOwnProperty("eddsaKey")
      ) {
        accountServices.sendAccountSigned({
          apiKey: (response as any).apiKey,
          eddsaKey: (response as any).eddsaKey,
          isInCounterFactualStatus: walletType?.isInCounterFactualStatus,
          isContract: walletType?.isContract,
        });
      } else {
        throw response;
      }
    } catch (e: any) {
      myLog("unlock", e);
      const error = LoopringAPI.exchangeAPI.genErr(e);
      const code = sdk.checkErrorInfo(error, true);
      switch (code) {
        case sdk.ConnectorError.USER_DENIED:
        case sdk.ConnectorError.USER_DENIED_2:
          accountServices.sendSignDeniedByUser();
          return;
        default:
          break;
      }
      accountServices.sendErrorUnlock(
        {
          msg: error.msg ?? error.message,
          code: error.code ?? UIERROR_CODE.UNKNOWN,
          ...error,
        },
        walletType
      );
    }
  }
}
