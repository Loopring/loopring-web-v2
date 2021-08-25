import { ButtonProps } from '../../basic-lib';
import { Account } from '@loopring-web/common-resources';

export type AccountBaseNewProps = {

    // addressShort: string
    // address: string,
    level?: string,
    mainBtn?: JSX.Element | React.ElementType<ButtonProps>,
    etherscanUrl: string
    // connectBy: string,
    onDisconnect?: any,
    onSwitch?: any,
    // onLock?: any,
    onCopy?: any,
    onViewQRCode?: any,
} & Account


export enum AccountStepNew {
    NoAccount,
    QRCode,
    Deposit,
    DepositInProcess,
    Depositing,
    DepositFailed,
    UpdateAccount,
    ProcessUnlock,
    SuccessUnlock,
    FailedUnlock,
    HadAccount,
    TokenApproveInProcess,
    TokenApproveFailed,
    UpdateAccountInProcess,
    UpdateAccountSigWarning,
    UpdateAccountUserDenied,
    UpdateAccountFailed,
    DepositInProcess_WITH_ACC,
    DepositFailed_WITH_ACC,
    WithdrawInProgress,
    WithdrawFailed,

    // new
    Deposit_Approve_WaitForAuth,
    Deposit_Approve_Refused,
    Deposit_Approve_Submited,
    Deposit_WaitForAuth,
    Deposit_Refused,
    Deposit_Submited,

}
