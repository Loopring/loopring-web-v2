import { GatewayItem } from '@loopring-web/common-resources';

/**
 * @param handleSelect default hanldeSelect, if item have no private handleSelect function
 */
export interface ProviderMenuProps {
    gatewayList: GatewayItem[]
    handleSelect?: (event: React.MouseEvent, key: string) => void
}

export type  ModalWalletConnectProps =  {
    open: boolean,
    onClose: { bivarianceHack(event: {}, reason: 'backdropClick' | 'escapeKeyDown'): void; }['bivarianceHack'];
    step:number,
    panelList: Array<JSX.Element>
}
export type ModalAccountProps =  ModalWalletConnectProps;

export enum WalletConnectStep  {
    Provider,
    MetaMaskProcessing,
    WalletConnectProcessing,
    WalletConnectQRCode,
    SuccessConnect,
    FailedConnect,
}