import { walletLayer2Services } from './walletLayer2Services';
import { Account } from '@loopring-web/common-resources';
import store from '../../stores';
import { updateAccountStatus } from '../../stores/account';
import { myLog } from '../../utils/log_tools';
import { cleanLayer2 } from './lockAccount';

export const checkAccount = (newAccAddress:string)=>{
    const account = store.getState().account;
    if(account.accAddress !== newAccAddress){
        myLog('After connect >>,account part: diff account, clean layer2')
        cleanLayer2();
    }
    if( account.accountId ==-1 ){
        myLog('After connect >>,checkAccount: step1 no account Id')
        walletLayer2Services.sendCheckAccount(newAccAddress)
        store.dispatch(updateAccountStatus({accAddress:newAccAddress}))
    }else if( account.accountId && account.apiKey && account.eddsaKey){
        myLog('After connect >>,checkAccount: step1 have activate account from store')
        walletLayer2Services.sendAccountSigned();
    }else {
        myLog('After connect >>,checkAccount: step1 account locked')
        walletLayer2Services.sendAccountLock();
    }
}