export enum Commands {
  ErrorNetwork = "ErrorNetwork",
  LockAccount = "LockAccount", // clear private data
  NoAccount = "NoAccount", //
  DepositingAccount = "DepositingAccount",
  ErrorApproveToken = "ErrorApproveToken",
  ErrorDepositSign = "ErrorDepositSign",
  ProcessDeposit = "ProcessDeposit", // two or one step
  SignAccount = "SignAccount", //unlock or update account  assgin
  SignDeniedByUser = "SignDeniedByUser",
  ErrorSign = "ErrorSign",
  ProcessSign = "ProcessSign",
  ProcessAccountCheck = "ProcessAccountCheck",
  AccountUnlocked = "AccountUnlocked",
}
export enum IPFSCommands {
  ErrorGetIpfs = "ErrorGetIpfs",
  IpfsResult = "IpfsResult",
}

export enum ErrorType {
  FailedConnect = "FailedConnect",
}

// 'ConnectWallet',
// 'UnLockWallet',
// 'SignatureTransfer',
// 'SignatureApprove'

export enum ProcessingType {
  waiting = "waiting",
  nextStep = "nextStep",
}
