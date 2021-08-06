import { AccountStatus } from '@loopring-web/common-resources';
import { walletLayer2Services } from './walletLayer2Services';
import { Commands } from './command';

export function lockAccount() {
    walletLayer2Services.sendAccountLock()
}

export function goErrorNetWork(){
    walletLayer2Services.sendUpdateAccStatusAndReset(AccountStatus.ERROR_NETWORK)

}

export function cleanLayer2() {
    walletLayer2Services.sendUpdateAccStatusAndReset(AccountStatus.UN_CONNECT)
}
