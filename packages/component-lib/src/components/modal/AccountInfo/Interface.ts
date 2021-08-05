import { ButtonProps } from '../../basic-lib';
import { Account } from '@loopring-web/common-resources';

export type AccountBaseProps = {

    // addressShort: string
    // address: string,
    level?: string,
    mainBtn?: JSX.Element | React.ElementType<ButtonProps>,
    etherscanUrl: string
    // connectBy: string,
    // onDisconnect?: any,
    onSwitch?: any,
    // onLock?: any,
    onCopy?: any,
    onViewQRCode?: any,
} & Account


export enum AccountStep {
    NoAccount,
    Deposit,
    Depositing,
    FailedDeposit,
    SignAccount,
    ProcessUnlock,
    SuccessUnlock,
    FailedUnlock,
    HadAccount,
    TokenAccessProcess,
    DepositApproveProcess,
    FailedTokenAccess,
    ActiveAccountProcess,
}