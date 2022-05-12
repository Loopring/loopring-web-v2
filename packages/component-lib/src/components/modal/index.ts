export * from "./QRCode";
export * from "./WalletConnect";
export * from "./ModalPanelBase";
export * from "./ModalPanels";
export * from "./WalletPanels";
export * from "./setting";
export type ModalBasicProps = {
  open: boolean;
  onClose: {
    bivarianceHack(event: {}, reason: "backdropClick" | "escapeKeyDown"): void;
  }["bivarianceHack"];
  onBack?: () => void;
  isLayer2Only?: boolean;
  step: number;
  noClose?: boolean;
  style?: any; //{w,h}
  onQRClick?: () => void;
  etherscanBaseUrl: string;
  panelList: Array<{
    view: JSX.Element;
    onBack?: undefined | (() => void);
    height?: any;
    width?: any;
  }>;
};
export type ModalWalletConnectProps = ModalBasicProps;
export type ModalAccountProps = ModalWalletConnectProps;
export type ModalGuardianProps = ModalWalletConnectProps;
