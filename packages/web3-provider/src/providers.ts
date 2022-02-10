import {
  WalletConnectProvide,
  WalletConnectSubscribe,
  WalletConnectUnsubscribe,
} from "./walletConnect";
import {
  MetaMaskProvide,
  MetaMaskSubscribe,
  MetaMaskUnsubscribe,
} from "./metamask";
import { IpcProvider } from "web3-core";
import Web3 from "web3";
import WalletConnectProvider from "@walletconnect/web3-provider";
import { ConnectProviders } from "@loopring-web/common-resources";
import { GameStop, GameStopSubscribe, GameStopUnsubscribe } from "./gmeWallet";

export class ConnectProvides {
  public usedProvide: undefined | IpcProvider | WalletConnectProvider;
  public usedWeb3: undefined | Web3;

  private _provideName: string | undefined;

  get provideName(): string | undefined {
    return this._provideName;
  }

  // private provderObj:provider|undefined
  public MetaMask = async () => {
    this._provideName = ConnectProviders.MetaMask;
    this.clearProviderSubscribe();
    const obj = await MetaMaskProvide();
    if (obj) {
      this.usedProvide = obj.provider;
      this.usedWeb3 = obj.web3;
    }
    this.subScribe();
  };

  public GameStop = async () => {
    this._provideName = ConnectProviders.GameStop;
    this.clearProviderSubscribe();
    const obj = await GameStop();
    if (obj) {
      this.usedProvide = obj.provider;
      this.usedWeb3 = obj.web3;
    }
    this.subScribe();
  };

  public WalletConnect = async (account?: string) => {
    this._provideName = ConnectProviders.WalletConnect;
    this.clearProviderSubscribe();
    try {
      const obj = await WalletConnectProvide(account);
      if (obj) {
        this.usedProvide = obj.provider;
        this.usedWeb3 = obj.web3;
      }
      this.subScribe(account);
    } catch (e) {
      throw e;
    }
  };

  public clear = async () => {
    return await this.clearProviderSubscribe();
  };

  private clearProviderSubscribe = async () => {
    switch (this._provideName) {
      case ConnectProviders.WalletConnect:
        if (this.usedProvide) {
          await (
            this.usedProvide as WalletConnectProvider
          ).connector.killSession();
        }
        await WalletConnectUnsubscribe(this.usedProvide);
        delete this.usedProvide;
        delete this.usedWeb3;
        break;
      case ConnectProviders.MetaMask:
        await MetaMaskUnsubscribe(this.usedProvide);
        delete this.usedProvide;
        delete this.usedWeb3;
        break;
      case ConnectProviders.GameStop:
        await GameStopUnsubscribe(this.usedProvide);
        delete this.usedProvide;
        delete this.usedWeb3;
        break;
    }

    return;
  };

  private subScribe = (account?: string) => {
    switch (this._provideName) {
      case ConnectProviders.WalletConnect:
        WalletConnectSubscribe(
          this.usedProvide,
          this.usedWeb3 as Web3,
          account
        );
        break;
      case ConnectProviders.GameStop:
        GameStopSubscribe(this.usedProvide, this.usedWeb3 as Web3);
        break;
      case ConnectProviders.MetaMask:
        MetaMaskSubscribe(this.usedProvide, this.usedWeb3 as Web3);
        break;
    }
  };
}

export const connectProvides = new ConnectProvides();
