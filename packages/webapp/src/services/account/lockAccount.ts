import { AccountStatus } from '@loopring-web/common-resources';
import { accountServices } from './accountServices';
import store from '../../stores';
import { statusUnset } from '../../stores/account';

export function lockAccount() {
    accountServices.sendAccountLock();
}

export function goErrorNetWork(){
    accountServices.sendUpdateAccStatusAndReset(AccountStatus.ERROR_NETWORK)
}

export function cleanLayer2() {
    accountServices.sendUpdateAccStatusAndReset(AccountStatus.UN_CONNECT)
}
