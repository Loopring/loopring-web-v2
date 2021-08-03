import { walletLayer2Services } from './walletLayer2Services';
import { Account } from '@loopring-web/common-resources';
import store from '../../stores';
import { updateAccountStatus } from '../../stores/account';

export const checkAccount = (accAddress:string)=>{
    const account = store.getState().account;
    if(!account.accountId){
        walletLayer2Services.sendCheckAccount(accAddress)
        store.dispatch(updateAccountStatus({accAddress}))
    }else if( account.accountId && account.apiKey && account.eddsaKey){
        walletLayer2Services.sendAccountSigned();
    }else {
        walletLayer2Services.sendAccountLock();
    }
}