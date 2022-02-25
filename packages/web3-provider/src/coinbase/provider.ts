import Web3 from "web3";
import { IpcProvider } from "web3-core";
import { walletServices } from "../walletServices";
import { ErrorType } from "../command";
import {
  ConnectProviders,
  SoursURL,
  RPC_URLS,
} from "@loopring-web/common-resources";
import { WalletLink } from "walletlink";

const APP_NAME = "Loopring App";
const APP_LOGO_URL = `${SoursURL}/logo.png`;

export const WalletLinkProvide = async (): Promise<
  { provider: IpcProvider; web3: Web3 } | undefined
> => {
  try {
    const walletLink = new WalletLink({
      appName: APP_NAME,
      walletLinkUrl: RPC_URLS[1] as string,
      appLogoUrl: APP_LOGO_URL,
      overrideIsCoinbaseWallet: true,
      overrideIsMetaMask: false,
      // supportedChainIds: [1, 5],
    });
    const provider: any = walletLink.makeWeb3Provider(RPC_URLS[1]);
    // await provider.enable();
    await provider.request({ method: "eth_requestAccounts" });
    const web3 = new Web3(provider as any);
    walletServices.sendConnect(web3, provider);
    return { provider, web3 };
  } catch (error) {
    console.error("Error happen at connect wallet with WalletLink:", error);
    walletServices.sendError(ErrorType.FailedConnect, {
      connectName: ConnectProviders.WalletLink,
      error: {
        code:
          error.message ===
          `Global ethereum is not WalletLink, Please disable other Wallet Plugin`
            ? 700002
            : 700003,
        message: error.message,
      },
    });
  }
};
export const WalletLinkSubscribe = (provider: any, web3: Web3) => {
  if (provider) {
    provider.on("accountsChanged", (accounts: Array<string>) => {
      if (accounts.length) {
        walletServices.sendConnect(web3, provider);
      } else {
        walletServices.sendDisconnect(-1, "disconnect for no account");
      }
    });
    provider.on("chainChanged", (chainId: number) => {
      walletServices.sendConnect(web3, provider);
    });
    provider.on("disconnect", (code: number, reason: string) => {
      walletServices.sendDisconnect(code, reason);
    });
  }
};

export const WalletLinkUnsubscribe = async (provider: any) => {
  if (provider && typeof provider.removeAllListeners === "function") {
    // provider.removeAllListeners('accountsChanged');
    // provider.removeAllListeners('chainChanged');
    // provider.removeAllListeners('disconnect');
    await provider.removeAllListeners();
  }
};
