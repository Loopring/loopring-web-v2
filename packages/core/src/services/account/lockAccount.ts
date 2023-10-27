import { AccountStatus } from '@loopring-web/common-resources'
import { accountServices } from './accountServices'
import { resetSystemData } from './resetAccount'

export function lockAccount() {
  accountServices.sendAccountLock()
}

export function goErrorNetWork() {
  alert('goErrorNetWork')
  accountServices.sendUpdateAccStatusAndReset(AccountStatus.ERROR_NETWORK)
}

// Do something clear the session storage related to Network
export function cleanLayer2() {
  accountServices.sendUpdateAccStatusAndReset(AccountStatus.UN_CONNECT)
  resetSystemData()
}
