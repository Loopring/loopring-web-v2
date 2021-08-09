import { StateBase } from './sagaStatus';
import { ConnectProviders } from './connect';

export enum AccountStatus {
    UN_CONNECT = 'UN_CONNECT',
    // CONNECT = 'CONNECT',
    NO_ACCOUNT = 'NO_ACCOUNT',
    LOCKED = 'LOCKED',
    ACTIVATED = 'ACTIVATED',
    DEPOSITING = 'DEPOSITING',
    ERROR_NETWORK = 'ERROR_NETWORK'
}

export enum fnType {
    UN_CONNECT = 'UN_CONNECT',
    CONNECT = 'CONNECT',
    NO_ACCOUNT = 'NO_ACCOUNT',
    LOCKED = 'LOCKED',
    ACTIVATED = 'ACTIVATED',
    DEPOSITING = 'DEPOSITING',
    DEFAULT = 'DEFAULT',
    ERROR_NETWORK='ERROR_NETWORK',
}

export type Account = {
    accAddress: string,
    readyState: keyof typeof AccountStatus | 'unknown',
    accountId: number,
    level: string,
    apiKey: string,
    eddsaKey: any,
    publicKey: any,
    nonce:number|undefined,
    keyNonce: number|undefined,
    connectName: keyof typeof ConnectProviders,
    wrongChain?: boolean|undefined,
    _chainId?: 1 | 5 | 'unknown',
    _userOnModel?: boolean|undefined
}
export type AccountState = Account & StateBase;
export type AccountFull = {
    account: Account,
    resetAccount:()=>void
    updateAccount:(account: Partial<Account>)=>void
} & StateBase

// export  enum StorageCommands {
//     CLEAN= 'CLEAN',
//     UPDATE='UPDATE'
// }
