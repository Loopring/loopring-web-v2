import { ButtonProps } from '../../basic-lib';

export type AccountBaseProps = {
    addressShort: string
    address: string,
    level?: string,
    etherscanLink: string,
    mainBtn?: JSX.Element | React.ElementType<ButtonProps>
    connectBy: string,
    onDisconnect?: any,
    onSwitch?: any,
    onLock?: any,
    onCopy?: any,
    onViewQRCode?: any,
}


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
}