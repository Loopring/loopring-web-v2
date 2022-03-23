import Web3 from "web3";
import { walletServices } from "../walletServices";
import { ErrorType } from "../command";
import {
  ConnectProviders,
  SoursURL,
  RPC_URLS,
} from "@loopring-web/common-resources";
import CoinbaseWalletSDK from "@coinbase/wallet-sdk";
import { CoinbaseWalletProvider } from "@coinbase/wallet-sdk";

const APP_NAME = "Loopring App";
const APP_LOGO_URL = `${SoursURL}/logo.png`;

export const CoinbaseProvide = async (props?: {
  darkMode?: boolean;
}): Promise<{ provider: CoinbaseWalletProvider; web3: Web3 } | undefined> => {
  try {
    const coinbaseWallet = new CoinbaseWalletSDK({
      appName: APP_NAME,
      appLogoUrl: APP_LOGO_URL,
      overrideIsCoinbaseWallet: false,
      overrideIsMetaMask: false,
      darkMode: props?.darkMode,
      // supportedChainIds: [1, 5],
    });
    const provider: CoinbaseWalletProvider = coinbaseWallet.makeWeb3Provider(
      RPC_URLS[1]
    );
    await provider.request({ method: "eth_requestAccounts" });
    const web3 = new Web3(provider as any);
    walletServices.sendConnect(web3, provider);
    return { provider, web3 };
  } catch (error) {
    console.error("Error happen at connect wallet with Coinbase:", error);
    walletServices.sendError(ErrorType.FailedConnect, {
      connectName: ConnectProviders.Coinbase,
      error: {
        code:
          error.message ===
          `Global ethereum is not Coinbase, Please disable other Wallet Plugin`
            ? 700002
            : 700003,
        message: error.message,
      },
    });
  }
};
// export const CoinbaseSubscribe = (provider: any, web3: Web3) => {
//   if (provider) {
//     provider.on("accountsChanged", (accounts: Array<string>) => {
//       if (accounts.length) {
//         walletServices.sendConnect(web3, provider);
//       } else {
//         walletServices.sendDisconnect(-1, "disconnect for no account");
//       }
//     });
//     provider.on("chainChanged", (chainId: number) => {
//       walletServices.sendConnect(web3, provider);
//     });
//     provider.on("disconnect", (code: number, reason: string) => {
//       walletServices.sendDisconnect(code, reason);
//     });
//   }
// };
//
// export const CoinbaseUnsubscribe = async (provider: any) => {
//   if (provider && typeof provider.removeAllListeners === "function") {
//     // provider.removeAllListeners('accountsChanged');
//     // provider.removeAllListeners('chainChanged');
//     // provider.removeAllListeners('disconnect');
//     await provider.removeAllListeners();
//   }
// };
