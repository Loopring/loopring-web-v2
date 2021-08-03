export enum Commands {
    LockAccount='LockAccount',// clear private data
    NoAccount='NoAccount',//
    DepositingAccount='DepositingAccount',
    ErrorApproveToken='ErrorApproveToken',
    ErrorDepositSign='ErrorDepositSign',
    ProcessDeposit='ProcessDeposit',// two or one step
    SignAccount='SignAccount', //unlock or update account  assgin
    ErrorSign='ErrorSign',
    ProcessSign='ProcessSign',
    ProcessAccountCheck='ProcessAccountCheck',
    AccountUnlocked = 'AccountUnlocked'
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
