import {
  WalletConnectProvide,
  WalletConnectSubscribe,
  WalletConnectUnsubscribe,
} from "./walletConnect";
import { MetaMaskProvide } from "./metamask";
import { CoinbaseProvide } from "./coinbase";
import { IpcProvider } from "web3-core";
import Web3 from "web3";
import WalletConnectProvider from "@walletconnect/web3-provider";
import { ConnectProviders } from "@loopring-web/common-resources";
import { CoinbaseWalletProvider } from "@coinbase/wallet-sdk";
import { ExtensionSubscribe, ExtensionUnsubscribe } from "./command";
import { Web3Provider } from "@ethersproject/providers";

export class ConnectProvides {
  private static _isMobile = false;
  public usedProvide:
    | undefined
    | Web3Provider
    | IpcProvider
    | WalletConnectProvider
    | CoinbaseWalletProvider;
  public usedWeb3: undefined | Web3;

  private _provideName: string | undefined;

  public static set IsMobile(isMobile: boolean) {
    ConnectProvides._isMobile = isMobile;
  }

  public static get IsMobile() {
    return ConnectProvides._isMobile;
  }

  get provideName(): string | undefined {
    return this._provideName;
  }

  // private provderObj:provider|undefined
  public MetaMask = async (props: { darkMode?: boolean }) => {
    this._provideName = ConnectProviders.MetaMask;
    this.clear();
    const obj = await MetaMaskProvide(props);
    if (obj) {
      this.usedProvide = obj.provider;
      this.usedWeb3 = obj.web3;
    }
    this.subScribe();
  };

  public Coinbase = async (props: { darkMode?: boolean }) => {
    this._provideName = ConnectProviders.Coinbase;
    this.clear();
    const obj = await CoinbaseProvide(props);
    if (obj) {
      this.usedProvide = obj.provider;
      this.usedWeb3 = obj.web3;
    }
    this.subScribe();
  };

  public WalletConnect = async (props?: {
    account?: string;
    darkMode?: boolean;
  }) => {
    this._provideName = ConnectProviders.WalletConnect;
    this.clear();
    try {
      const obj = await WalletConnectProvide(props);
      if (obj) {
        this.usedProvide = obj.provider;
        this.usedWeb3 = obj.web3;
      }
      this.subScribe(props);
    } catch (e) {
      throw e;
    }
  };

  public clear = async () => {
    return await this.clearProviderSubscribe();
  };

  private clearProviderSubscribe = async () => {
    try {
      if (
        this.usedProvide &&
        typeof (this.usedProvide as WalletConnectProvider)?.connector
          ?.killSession === "function"
      ) {
        await (
          this.usedProvide as WalletConnectProvider
        ).connector.killSession();
      }
      await WalletConnectUnsubscribe(this.usedProvide);
      await ExtensionUnsubscribe(this.usedProvide);
      // await CoinbaseUnsubscribe(this.usedProvide);
      delete this.usedProvide;
      delete this.usedWeb3;
    } catch (error) {
      console.log("clearProviderSubscribe", error);
    }

    return;
  };

  private subScribe = (props?: { account?: string }) => {
    try {
      switch (this._provideName) {
        case ConnectProviders.WalletConnect:
          WalletConnectSubscribe(
            this.usedProvide,
            this.usedWeb3 as Web3,
            props?.account
          );
          break;
        case ConnectProviders.MetaMask:
        case ConnectProviders.Coinbase:
          ExtensionSubscribe(this.usedProvide, this.usedWeb3 as Web3);
          break;
      }
    } catch (error) {
      console.log("subScribe", error);
    }
  };
}

export const connectProvides = new ConnectProvides();
