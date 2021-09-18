import { StateBase } from '@loopring-web/common-resources';
import { ChainId, ExchangeInfo } from 'loopring-sdk';

export enum ENV {
    DEV = 'DEV',
    UAT = 'UAT',
    PROD = 'PROD',
}

export enum NETWORKEXTEND {
    NONETWORK = 'unknown'
}

export type NETWORK = NETWORKEXTEND | ChainId


export type System<C extends { [ key: string ]: any }> = {
    env: keyof typeof ENV,
    chainId: 1 | 5 | 'unknown'
    // network: keyof typeof NETWORK,
    etherscanBaseUrl: string,
    socketURL: string,
    baseURL: string,
    faitPrices: { [k in keyof C]: { price: any, [ key: string ]: any } },
    gasPrice: number ,
    forex: number,
    exchangeInfo: ExchangeInfo | undefined,

}

export type SystemStatus = System<{ [ key: string ]: any }> & {
    // system:System | {}
    __timer__: NodeJS.Timeout | -1
    topics: any[]
} & StateBase






