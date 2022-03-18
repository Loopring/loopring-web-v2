import detectEthereumProvider from "@metamask/detect-provider";
import Web3 from "web3";
import { walletServices } from "../walletServices";
import { ErrorType } from "../command";
import { ConnectProviders } from "@loopring-web/common-resources";
import { IsMobile } from "../utilities";
import { Web3Provider } from "@ethersproject/providers";
// import { ethers } from "ethers";

export const MetaMaskProvide = async (): Promise<
  { provider: Web3Provider; web3: Web3 } | undefined
> => {
  try {
    if (!window.ethereum?.isMetaMask && !IsMobile.any()) {
      throw new Error(
        `Global ethereum is not MetaMask, Please disable other Wallet Plugin`
      );
    }
    let provider = await detectEthereumProvider({
      mustBeMetaMask: !IsMobile.any(),
    });

    const ethereum: any = window.ethereum;

    if (provider && ethereum) {
      const web3 = new Web3(provider as any);
      await ethereum.request({ method: "eth_requestAccounts" });
      walletServices.sendConnect(web3, provider);
      // @ts-ignore
      return { provider, web3 };
    } else {
      return undefined;
    }
  } catch (error) {
    console.error(
      "Error happen at connect wallet with MetaMask:",
      error.message
    );
    walletServices.sendError(ErrorType.FailedConnect, {
      connectName: ConnectProviders.MetaMask,
      error: {
        code:
          error.message ===
          `Global ethereum is not MetaMask, Please disable other Wallet Plugin`
            ? 700002
            : 700003,
        message: error.message,
      },
    });
  }
};
export const MetaMaskSubscribe = (provider: any, web3: Web3) => {
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
      console.log("metamask on disconnect");
    });
  }
};

export const MetaMaskUnsubscribe = async (provider: any) => {
  if (provider && typeof provider.removeAllListeners === "function") {
    await provider.removeAllListeners();
  }
};
