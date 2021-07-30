import { ButtonProps } from '../../basic-lib';

export type AccountInfoProps = {
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
