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
    ProcessUnlock,
    SuccessUnlock,
    FailedUnlock,
    HadAccount,

    // new
    Deposit,
    Deposit_Approve_WaitForAuth,
    Deposit_Approve_Refused,
    Deposit_Approve_Submited,
    Deposit_WaitForAuth,
    Deposit_Refused,
    Deposit_Failed,
    Deposit_Submited,

    Transfer_WaitForAuth,
    Transfer_Refused,
    Transfer_In_Progress,
    Transfer_Success,
    Transfer_Failed,

    Withdraw_WaitForAuth,
    Withdraw_Refused,
    Withdraw_In_Progress,
    Withdraw_Success,
    Withdraw_Failed,

    CreateAccount_Approve_WaitForAuth,
    CreateAccount_Approve_Refused,
    CreateAccount_Approve_Submited,
    CreateAccount_WaitForAuth,
    CreateAccount_Refused,
    CreateAccount_Failed,
    CreateAccount_Submited,
    
    UpdateAccount,
    UpdateAccount_Approve_WaitForAuth,
    UpdateAccount_First_Method_Refused,
    UpdateAccount_User_Refused,
    UpdateAccount_Success,
    UpdateAccount_Submited,
    UpdateAccount_Failed,

}
