import { AccountStatus } from '@loopring-web/common-resources';
import store from '../../stores';
import { walletLayer2Services } from './walletLayer2Services';
import { updateAccountStatus } from '../../stores/account';

export function lockAccount() {
    walletLayer2Services.sendAccountLock()
}

export function goErrorNetWork(){
    store.dispatch(updateAccountStatus({
        readyState: AccountStatus.ERROR_NETWORK,
        apiKey: '',
        eddsaKey: '',
        publicKey: '',
        nonce:undefined,
    }))
}
export function cleanLayer2() {
    store.dispatch(updateAccountStatus({
        account: -1,
        readyState: AccountStatus.UN_CONNECT,
        apiKey: '',
        eddsaKey: '',
        publicKey: '',
        nonce:undefined,
    }))
}