import { GatewayItem } from '@loopring-web/common-resources';

/**
 * @param handleSelect default hanldeSelect, if item have no private handleSelect function
 */
export interface WalletConnectPanelProps {
    gatewayList: GatewayItem[]
    handleSelect?: (event: React.MouseEvent, key: string) => void
}

export type  ModalWalletConnectProps = WalletConnectPanelProps & {
    open: boolean,
    onClose: { bivarianceHack(event: {}, reason: 'backdropClick' | 'escapeKeyDown'): void; }['bivarianceHack'];
    step:number
}
