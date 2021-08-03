import { AccountStatus } from '@loopring-web/common-resources';
import store from '../../stores';
import { walletLayer2Services } from './walletLayer2Services';
import { updateAccountStatus } from '../../stores/account';

export function lockAccount() {
    const account = store.getState().account;
    walletLayer2Services.sendAccountLock()
    store.dispatch(updateAccountStatus({
        readyState: AccountStatus.LOCKED,
        apiKey: '',
        eddsaKey: '',
        publicKey: '',
        // chainId: 1 | 5,
        // wrongChain: wrongChain,
    }))

}