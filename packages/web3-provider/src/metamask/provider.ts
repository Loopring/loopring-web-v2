import detectEthereumProvider from "@metamask/detect-provider";
import Web3 from "web3";
import { walletServices } from "../walletServices";
import { IpcProvider } from "web3-core";
import { ErrorType } from "../command";
import { ConnectProviders } from "@loopring-web/common-resources";

export const MetaMaskProvide = async (): Promise<
  { provider: IpcProvider; web3: Web3 } | undefined
> => {
  try {
    const provider: any = await detectEthereumProvider({
      mustBeMetaMask: true,
    });
    const ethereum: any = window.ethereum;

    if (provider && ethereum && ethereum.isMetaMask) {
      // const metamaskProvider:IpcProvider = ethereum.find((provider:IpcProvider & {isMetaMask:boolean}) => provider.isMetaMask);
      const web3 = new Web3(provider as any);
      await ethereum.request({ method: "eth_requestAccounts" });
      walletServices.sendConnect(web3, provider);
      return { provider, web3 };
    } else {
      return undefined;
    }
  } catch (error) {
    console.error("Error happen at connect wallet with MetaMask:", error);
    walletServices.sendError(ErrorType.FailedConnect, {
      connectName: ConnectProviders.MetaMask,
      error,
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
