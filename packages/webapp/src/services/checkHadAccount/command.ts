export enum Commands {
    LockAccount,// clear private data
    NoAccount,//
    DepositingAccount,
    ErrorApproveToken,
    ErrorDepositAssign,
    ProcessDeposit,// two or one step
    AssignAccount, //unlock or update account  assgin
    ProcessAssign,
    // ProcessAccountCheck,
}
export enum ErrorType {
    FailedConnect = 'FailedConnect'
}
// 'ConnectWallet',
// 'UnLockWallet',
// 'SignatureTransfer',
// 'SignatureApprove'


export enum ProcessingType{
    waiting = 'waiting',
    nextStep = 'nextStep'
}
