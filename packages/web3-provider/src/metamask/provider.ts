import detectEthereumProvider from "@metamask/detect-provider";
import Web3 from "web3";
import { walletServices } from "../walletServices";
import { IpcProvider } from "web3-core";
import { ErrorType } from "../command";
import { ConnectProviders } from "@loopring-web/common-resources";
import { IsMobile } from "../utilities";
import { ethers } from "ethers";

export const MetaMaskProvide = async (): Promise<
  { provider: IpcProvider; web3: Web3 } | undefined
> => {
  try {
    if (!window.ethereum?.isMetaMask && !IsMobile.any()) {
      throw new Error(
        `Global ethereum is not MetaMask, Please disable other Wallet Plugin`
      );
    }
    let provider;
    // @ts-ignore
    if (
      IsMobile.any() &&
      window.ethereum &&
      // @ts-ignore
      window.ethereum.enable &&
      !window.ethereum.isMetaMask
    ) {
      // @ts-ignore
      await window.ethereum.enable();
    }
    if (
      window.ethereum &&
      ethers.providers.Web3Provider &&
      !window.ethereum.isMetaMask
    ) {
      provider = new ethers.providers.Web3Provider(window.ethereum);
      console.log("provider success");
    } else {
      provider = await detectEthereumProvider({
        mustBeMetaMask: !IsMobile.any(),
      });
    }

    const ethereum: any = window.ethereum;

    if (provider && ethereum) {
      // const metamaskProvider:IpcProvider = ethereum.find((provider:IpcProvider & {isMetaMask:boolean}) => provider.isMetaMask);
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
    });
  }
};

export const MetaMaskUnsubscribe = async (provider: any) => {
  if (provider && typeof provider.removeAllListeners === "function") {
    // provider.removeAllListeners('accountsChanged');
    // provider.removeAllListeners('chainChanged');
    // provider.removeAllListeners('disconnect');
    await provider.removeAllListeners();
  }
};
