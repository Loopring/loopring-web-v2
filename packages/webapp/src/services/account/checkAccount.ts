import { walletLayer2Services } from './walletLayer2Services';
import { Account } from '@loopring-web/common-resources';
import store from '../../stores';
import { updateAccountStatus } from '../../stores/account';
import { myLog } from '../../utils/log_tools';

export const checkAccount = (accAddress:string)=>{
    const account = store.getState().account;
    if( account.accountId ==-1 ){
        myLog('After connect >>,checkAccount: step2 no account Id')
        walletLayer2Services.sendCheckAccount(accAddress)
        store.dispatch(updateAccountStatus({accAddress}))
    }else if( account.accountId && account.apiKey && account.eddsaKey){
        myLog('After connect >>,checkAccount: step2 have account from storage and assign done ')
        walletLayer2Services.sendAccountSigned();
    }else {
        myLog('After connect >>,checkAccount: step2 account locked')
        walletLayer2Services.sendAccountLock();
    }
}