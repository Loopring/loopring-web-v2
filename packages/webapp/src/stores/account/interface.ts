import { LoopringProvider } from "@loopring-web/web3-provider"

export type ErrorObject = {
    from?: string,
    timestamp?: number,
    messageKey: string
    [ key: string ]: any,
}

export enum STATUS {
    UNSET='UNSET',
    PENDING='PENDING',
    ERROR='ERROR',   // success failed timeout is Done
    DONE='DONE',   // success failed timeout is Done
}


 type StateBase = {
    status: keyof typeof STATUS,
    errorMessage?:ErrorObject|null,
}

export enum AccountStatus {
    UN_CONNECT='UN_CONNECT',
    CONNECT='CONNECT',
    NO_ACCOUNT='NO_ACCOUNT',
    LOCKED='LOCKED',
    ACTIVATED='ACTIVATED',
    DEPOSITING='DEPOSITING'
}

export enum fnType {
    UN_CONNECT,
    CONNECT,
    NO_ACCOUNT,
    LOCKED,
    ACTIVATED,
    DEPOSITING,
    DEFAULT,
}

export type Account = {
    accAddress: string,
    readyState: keyof typeof AccountStatus | 'Unknown',
    accountId: number|-1,
    level:string,
    apiKey: string,
    eddsaKey: any,
    connectName: keyof typeof LoopringProvider
}
export type AccountState = Account & StateBase;

// export  enum StorageCommands {
//     CLEAN= 'CLEAN',
//     UPDATE='UPDATE'
// }
