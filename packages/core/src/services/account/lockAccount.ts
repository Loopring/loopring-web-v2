import { AccountStatus } from "@loopring-web/common-resources";
import { accountServices } from "./accountServices";

export function lockAccount() {
  accountServices.sendAccountLock();
}

export function goErrorNetWork() {
  accountServices.sendUpdateAccStatusAndReset(AccountStatus.ERROR_NETWORK);
}

export function cleanLayer2() {
  accountServices.sendUpdateAccStatusAndReset(AccountStatus.UN_CONNECT);
}
