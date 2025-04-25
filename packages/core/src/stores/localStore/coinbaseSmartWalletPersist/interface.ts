import { ChainId } from "@loopring-web/loopring-sdk";

export interface CoinbaseSmartWalletPersist {
  data:   CoinbaseSmartWalletPersistData | undefined
}
    
export interface CoinbaseSmartWalletPersistData {
  wallet: string;
  eddsaKey: {
    sk: string;
    formatedPx: string;
    formatedPy: string;
    keyPair: {
      publicKeyX: string;
      publicKeyY: string;
      secretKey: string;
    };
  };
  nonce: number
  chainId: ChainId
  updateAccountData: {
    updateAccountNotFinished: boolean
    json: string
  }
}
