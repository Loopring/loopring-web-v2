import { AccountStatus } from '@loopring-web/common-resources';

export function lockAccount({wrongChain,readyState}: {wrongChain?:boolean|undefined,readyState:AccountStatus}) {
    // const  dispach =  store.dispatch;
    // const account = store.getState().account;
    // const {exchangeInfo} = store.getState().system;
    return {
        readyState: readyState,
        apiKey: '',
        eddsaKey: '',
        // publicKey: '',
        // chainId: 1 | 5,
        wrongChain: wrongChain,
    }
}