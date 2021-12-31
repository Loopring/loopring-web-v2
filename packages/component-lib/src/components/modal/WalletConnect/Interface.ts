import { GatewayItem } from "@loopring-web/common-resources";

/**
 * @param handleSelect default hanldeSelect, if item have no private handleSelect function
 */
export interface ProviderMenuProps {
  termUrl: string;
  gatewayList: GatewayItem[];
  handleSelect?: (event: React.MouseEvent, key: string) => void;
  providerName?: string;
}

export enum WalletConnectStep {
  Provider,
  MetaMaskProcessing,
  WalletConnectProcessing,
  WalletConnectQRCode,
  SuccessConnect,
  FailedConnect,
}
