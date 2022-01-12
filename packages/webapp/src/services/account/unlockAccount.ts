import { connectProvides } from "@loopring-web/web3-provider";
import { LoopringAPI } from "api_wrapper";
import store from "stores";
import { accountServices } from "./accountServices";
import { myLog } from "@loopring-web/common-resources";
import { checkErrorInfo } from "hooks/useractions/utils";

import * as sdk from "@loopring-web/loopring-sdk";

export async function unlockAccount() {
  const account = store.getState().account;
  const { exchangeInfo, chainId } = store.getState().system;
  accountServices.sendSign();

  myLog("unlockAccount account:", account);

  if (
    exchangeInfo &&
    LoopringAPI.userAPI &&
    LoopringAPI.walletAPI &&
    account.nonce !== undefined
  ) {
    try {
      const connectName = account.connectName as sdk.ConnectorNames;

      const eddsaKey = await sdk.generateKeyPair({
        web3: connectProvides.usedWeb3,
        address: account.accAddress,
        exchangeAddress: exchangeInfo.exchangeAddress,
        keyNonce: account.nonce - 1,
        walletType: connectName,
        chainId: chainId as any,
        accountId: account.accountId,
      });

      myLog("unlockAccount eddsaKey:", eddsaKey);

      const [{ apiKey, raw_data }, { walletType }] = await Promise.all([
        LoopringAPI.userAPI.getUserApiKey(
          {
            accountId: account.accountId,
          },
          eddsaKey.sk
        ),
        LoopringAPI.walletAPI.getWalletType({
          wallet: account.accAddress,
        }),
      ]);

      myLog("unlockAccount raw_data:", raw_data);

      if (!apiKey && raw_data.resultInfo) {
        myLog("try to sendErrorUnlock....");
        accountServices.sendErrorUnlock();
      } else {
        myLog("try to sendAccountSigned....");
        accountServices.sendAccountSigned({
          accountId: account.accountId,
          nonce: account.nonce,
          apiKey,
          eddsaKey,
          isContract: walletType?.isContract,
          isInCounterFactualStatus: walletType?.isInCounterFactualStatus,
        });
      }
    } catch (e) {
      myLog("unlockAccount e:", e);

      const errType = checkErrorInfo(e, true);
      switch (errType) {
        case sdk.ConnectorError.USER_DENIED:
          accountServices.sendSignDeniedByUser();
          return;
        default:
          break;
      }
      accountServices.sendErrorUnlock();
    }
  }
}
