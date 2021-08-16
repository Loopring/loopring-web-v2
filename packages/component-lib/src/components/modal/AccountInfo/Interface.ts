import { ButtonProps } from '../../basic-lib';
import { Account } from '@loopring-web/common-resources';

export type AccountBaseProps = {

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


export enum AccountStep {
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
    DepositApproveProcess,
    TokenApproveFailed,
    UpdateAccountInProcess,
    UpdateAccountFailed,
}
