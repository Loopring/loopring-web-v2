export enum GuardianStep {
  LockAccount_WaitForAuth,
  LockAccount_User_Denied,
  LockAccount_Success,
  LockAccount_Failed,

  Approve_User_Denied,
  Approve_WaitForAuth,
  Approve_Success,
  Approve_Failed,
  Reject_User_Denied,
  Reject_WaitForAuth,
  Reject_Success,
  Reject_Failed,
}
