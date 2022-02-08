import detectEthereumProvider from "@metamask/detect-provider";
import Web3 from "web3";
import { walletServices } from "../walletServices";
import { IpcProvider } from "web3-core";
import { ErrorType } from "../command";
import { ConnectProviders } from "@loopring-web/common-resources";
import { Send } from "../interface";

export const GameStop = async (): Promise<
  { provider: IpcProvider; web3: Web3 } | undefined
> => {
  try {
    // const provider: any = await detectEthereumProvider();
    // @ts-ignore
    if (!window.gme) {
      throw new Error("User not installed GameStop extension");
    }
    // @ts-ignore
    const provider = window.gme;
    await (provider.send as Send)("eth_requestAccounts");
    const web3 = new Web3(provider as any);
    walletServices.sendConnect(web3, provider);
    return { provider, web3 };
    // if (provider && ethereum) {
    // }
    //
    // const ethereum: any = window.ethereum;
    // if (window.gme) {
    //
    // }
    // if (provider && ethereum) {
    //   // const metamaskProvider:IpcProvider = ethereum.find((provider:IpcProvider & {isMetaMask:boolean}) => provider.isMetaMask);
    //   const web3 = new Web3(provider as any);
    //   await ethereum.request({ method: "eth_requestAccounts" });
    //   walletServices.sendConnect(web3, provider);
    //   return { provider, web3 };
    // } else {
    //   return undefined;
    // }
  } catch (error) {
    console.error("Error happen at connect wallet with GameStop:", error);
    walletServices.sendError(ErrorType.FailedConnect, {
      connectName: ConnectProviders.GameStop,
      error,
    });
  }
};
export const GameStopSubscribe = (provider: any, web3: Web3) => {
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

export const GameStopUnsubscribe = async (provider: any) => {
  if (provider && typeof provider.removeAllListeners === "function") {
    // provider.removeAllListeners('accountsChanged');
    // provider.removeAllListeners('chainChanged');
    // provider.removeAllListeners('disconnect');
    await provider.removeAllListeners();
  }
};
