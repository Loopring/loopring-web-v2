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
    RESET='Unknown',
    UN_CONNECT='UN_CONNECT',
    NO_ACCOUNT='NO_ACCOUNT',
    LOCKED='LOCKED',
    ACTIVATED='ACTIVATED',
    DEPOSITING='DEPOSITING'
}
// export const ConnectorName = {
//     Unknown: 'Unknown',
//     MetaMask : 'MetaMask' ,
//     WalletConnect : 'Wallet Connect',
// }

export type AccountState = {
    accAddress: string,
    readyState: keyof typeof AccountStatus extends 'RESET' ? 'Unknown': keyof typeof AccountStatus | 'Unknown',
    accountId: number|-1,
    //   accountId: defaultAccId,
    //   publicKey: PublicKey,
    //   nonce: 0,
    // isContractAddress: false,
    level:string,
    apiKey: string,
    eddsaKey: string,
    connectName: keyof typeof LoopringProvider
    // connectNameTemp: ConnectorNames.Unknown,
} & StateBase


export  enum StorageCommands {
    CLEAN= 'CLEAN',
    UPDATE='UPDATE'
}
