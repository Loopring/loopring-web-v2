export enum AccountCommands {
  ErrorNetwork = 'ErrorNetwork',
  LockAccount = 'LockAccount', // clear private data
  NoAccount = 'NoAccount', //
  DepositingAccount = 'DepositingAccount',
  ErrorApproveToken = 'ErrorApproveToken',
  ErrorDepositSign = 'ErrorDepositSign',
  ProcessDeposit = 'ProcessDeposit', // two or one step
  SignAccount = 'SignAccount', //unlock or update account  assgin
  SignDeniedByUser = 'SignDeniedByUser',
  ErrorSign = 'ErrorSign',
  ProcessSign = 'ProcessSign',
  ProcessAccountCheck = 'ProcessAccountCheck',
  AccountUnlocked = 'AccountUnlocked',
}
