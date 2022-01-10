import { StateBase } from "./sagaStatus";
import { ConnectProviders } from "./connect";

export enum AccountStatus {
  UN_CONNECT = "UN_CONNECT",
  // CONNECT = 'CONNECT',
  NO_ACCOUNT = "NO_ACCOUNT",
  DEPOSITING = "DEPOSITING",
  NOT_ACTIVE = "NOT_ACTIVE",
  LOCKED = "LOCKED",
  ACTIVATED = "ACTIVATED",
  ERROR_NETWORK = "ERROR_NETWORK",
}

export enum fnType {
  UN_CONNECT = "UN_CONNECT",
  NO_ACCOUNT = "NO_ACCOUNT",
  NOT_ACTIVE = "NOT_ACTIVE",
  LOCKED = "LOCKED",
  ACTIVATED = "ACTIVATED",
  DEFAULT = "DEFAULT",
  DEPOSITING = "DEPOSITING",
  CONNECT = "CONNECT",
  ERROR_NETWORK = "ERROR_NETWORK",
}

export type Account = {
  accAddress: string;
  qrCodeUrl: string;
  readyState: keyof typeof AccountStatus | "unknown";
  accountId: number;
  level: string;
  apiKey: string;
  eddsaKey: any;
  publicKey: any;
  keySeed: string;
  nonce: number | undefined;
  keyNonce: number | undefined;
  connectName: keyof typeof ConnectProviders;
  wrongChain?: boolean | undefined;
  isInCounterFactualStatus?: boolean;
  isContract?: boolean;
  _chainId?: 1 | 5 | "unknown";
  _accountIdNotActive?: number;
  _userOnModel?: boolean | undefined;
};
export type AccountState = Account & StateBase;
export type AccountFull = {
  account: Account;
  resetAccount: () => void;
  updateAccount: (account: Partial<Account>) => void;
} & StateBase;

// export  enum StorageCommands {
//     CLEAN= 'CLEAN',
//     UPDATE='UPDATE'
// }
