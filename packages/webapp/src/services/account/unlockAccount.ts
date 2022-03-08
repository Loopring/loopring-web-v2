import { connectProvides } from "@loopring-web/web3-provider";
import { LoopringAPI } from "api_wrapper";
import store from "stores";
import { accountServices } from "./accountServices";
import {
  ConnectProviders,
  myLog,
  UIERROR_CODE,
} from "@loopring-web/common-resources";
import { checkErrorInfo } from "hooks/useractions/utils";

import * as sdk from "@loopring-web/loopring-sdk";
import Web3 from "web3";

export async function unlockAccount() {
  const accoun_old = store.getState().account;
  const { exchangeInfo, chainId } = store.getState().system;
  accountServices.sendSign();
  const { isMobile } = store.getState().settings;
  myLog("unlockAccount account:", accoun_old);

  if (
    exchangeInfo &&
    LoopringAPI.userAPI &&
    LoopringAPI.exchangeAPI &&
    LoopringAPI.walletAPI &&
    accoun_old.nonce !== undefined
  ) {
    try {
      const connectName = accoun_old.connectName as sdk.ConnectorNames;
      let { accInfo: account } = await LoopringAPI.exchangeAPI.getAccount({
        owner: accoun_old.accAddress,
      });
      const nonce = account ? account.nonce : accoun_old.nonce;

      console.log(
        "unlockAccount isMobile, connectName:",
        isMobile,
        connectName
      );
      const eddsaKey = await sdk.generateKeyPair({
        web3: connectProvides.usedWeb3,
        address: account.owner,
        // exchangeAddress: exfchangeInfo.exchangeAddress,
        // keyNonce: nonce - 1,
        keySeed:
          account.keySeed && account.keySeed !== ""
            ? account.keySeed
            : sdk.GlobalAPI.KEY_MESSAGE.replace(
                "${exchangeAddress}",
                exchangeInfo.exchangeAddress
              ).replace("${nonce}", (nonce - 1).toString()),
        walletType: connectName,
        chainId: chainId as any,
        accountId: account.accountId,
      });

      console.log(
        "unlockAccount isMobile, connectName:",
        isMobile,
        connectName
      );

      const walletTypePromise: Promise<{ walletType: any }> =
        window.ethereum &&
        connectName === sdk.ConnectorNames.MetaMask &&
        isMobile
          ? Promise.resolve({ walletType: undefined })
          : LoopringAPI.walletAPI.getWalletType({
              wallet: account.owner,
            });
      const [
        response,
        // { apiKey, raw_data },
        { walletType },
      ] = await Promise.all([
        LoopringAPI.userAPI.getUserApiKey(
          {
            accountId: account.accountId,
          },
          eddsaKey.sk
        ),
        walletTypePromise.catch((error) => {
          console.log(error);
          return { walletType: undefined };
        }),
      ]);

      if (
        !response.apiKey &&
        ((response as sdk.RESULT_INFO).code ||
          (response as sdk.RESULT_INFO).message)
      ) {
        console.log("try to sendErrorUnlock....");
        accountServices.sendErrorUnlock(response as sdk.RESULT_INFO);
      } else {
        console.log("try to sendAccountSigned....");
        accountServices.sendAccountSigned({
          accountId: account.accountId,
          nonce,
          keySeed: account.keySeed,
          apiKey: response.apiKey,
          eddsaKey,
          isContract: walletType?.isContract,
          isInCounterFactualStatus: walletType?.isInCounterFactualStatus,
        });
      }
    } catch (e) {
      console.log("unlockAccount error:", JSON.stringify(e));

      const errType = checkErrorInfo(e, true);
      switch (errType) {
        case sdk.ConnectorError.USER_DENIED:
          accountServices.sendSignDeniedByUser();
          return;
        default:
          break;
      }
      accountServices.sendErrorUnlock({
        code: UIERROR_CODE.UNKNOWN,
        msg: e.message,
      });
    }
  }
}
