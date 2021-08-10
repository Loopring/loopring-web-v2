import { walletLayer2Services } from './walletLayer2Services';
import store from '../../stores';
import { cleanAccountStatus, updateAccountStatus } from '../../stores/account';
import { myLog } from '../../utils/log_tools';

export const checkAccount = (newAccAddress: string) => {
    const account = store.getState().account;
    if (account.accAddress === '' || account.accAddress !== newAccAddress) {
        myLog('After connect >>,account part: diff account, clean layer2')
        store.dispatch(cleanAccountStatus(undefined));
        walletLayer2Services.sendCheckAccount(newAccAddress);
    }else if (newAccAddress && newAccAddress !== '') {
        myLog('After connect >>,checkAccount: step1 address',newAccAddress)
        if (account &&  account.accountId === -1) {
            myLog('After connect >>,checkAccount: step1 no account Id')
            walletLayer2Services.sendCheckAccount(newAccAddress)
        } else if (account.accountId && account.apiKey && account.eddsaKey) {
            myLog('After connect >>,checkAccount: step1 have activate account from store, account:', account)
            walletLayer2Services.sendAccountSigned();
        } else {
            myLog('After connect >>,checkAccount: step1 account locked')
            walletLayer2Services.sendAccountLock();
        }
    }
}