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
    
    UpdateAccount,
    ProcessUnlock,
    SuccessUnlock,
    FailedUnlock,
    HadAccount,
    UpdateAccountInProcess,
    UpdateAccountSigWarning,
    UpdateAccountUserDenied,
    UpdateAccountFailed,

    // new
    Deposit_Approve_WaitForAuth,
    Deposit_Approve_Refused,
    Deposit_Approve_Submited,
    Deposit_WaitForAuth,
    Deposit_Refused,
    Deposit_Failed,
    Deposit_Submited,

    Transfer_WaitForAuth,
    Transfer_Refused,
    Transfer_Submited,
    Transfer_Success,
    Transfer_Failed,

    Withdraw_WaitForAuth,
    Withdraw_Refused,
    Withdraw_Submited,
    Withdraw_Success,
    Withdraw_Failed,

}
