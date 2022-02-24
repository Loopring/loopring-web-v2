export enum Commands {
  // Provider = 'Provider',
  ConnectWallet = "ConnectWallet",
  DisConnect = "DisConnect",
  ChangeNetwork = "ChangeNetwork",
  Processing = "Processing",
  Error = "Error",
  // UnLockWallet=  'UnLockWallet',
  // SignatureTransfer= 'SignatureTransfer',
  // SignatureApprove= 'SignatureApprove'
  //....
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
