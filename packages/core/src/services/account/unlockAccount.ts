import { connectProvides } from "@loopring-web/web3-provider";
import { checkErrorInfo, LoopringAPI, store } from "../../index";
import { accountServices } from "./accountServices";
import { myLog, UIERROR_CODE } from "@loopring-web/common-resources";
import * as sdk from "@loopring-web/loopring-sdk";

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
      const connectName = accounStore.connectName as sdk.ConnectorNames;
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
        walletTypePromise.catch((_error) => {
          return { walletType: undefined };
        }),
      ]);

      const nonce = account ? account.nonce : accounStore.nonce;

      const msg =
        account.keySeed && account.keySeed !== ""
          ? account.keySeed
          : sdk.GlobalAPI.KEY_MESSAGE.replace(
              "${exchangeAddress}",
              exchangeInfo.exchangeAddress
            ).replace("${nonce}", (nonce - 1).toString());

      myLog("generateKeyPair:", msg, chainId, isMobile);
      const eddsaKey = await sdk.generateKeyPair({
        web3: connectProvides.usedWeb3,
        address: account.owner,
        keySeed: msg,
        walletType: connectName,
        chainId: Number(chainId),
        accountId: Number(account.accountId),
        isMobile: isMobile,
      });

      const response = await LoopringAPI.userAPI.getUserApiKey(
        {
          accountId: account.accountId,
        },
        eddsaKey.sk
      );

      if (
        !response.apiKey &&
        ((response as sdk.RESULT_INFO).code ||
          (response as sdk.RESULT_INFO).message)
      ) {
        accountServices.sendErrorUnlock(
          response as sdk.RESULT_INFO,
          walletType
        );
      } else {
        accountServices.sendAccountSigned({
          apiKey: response.apiKey,
          eddsaKey,
          isInCounterFactualStatus: walletType?.isInCounterFactualStatus,
          isContract: walletType?.isContract,
        });
      }
    } catch (e: any) {
      myLog("unlockAccount error:", JSON.stringify(e));
      const error = LoopringAPI.globalAPI?.genErr(e);
      const code = checkErrorInfo(error as sdk.RESULT_INFO, true);
      switch (code) {
        case sdk.ConnectorError.USER_DENIED:
          accountServices.sendSignDeniedByUser();
          return;
        default:
          break;
      }
      accountServices.sendErrorUnlock(
        {
          code: UIERROR_CODE.UNKNOWN,
          msg: e.message,
        },
        walletType
      );
    }
  }
}
