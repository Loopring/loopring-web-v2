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
  step: number;
  noClose?: boolean;
  style?: any; //{w,h}
  onQRClick?: () => void;
  panelList: Array<{ view: JSX.Element; onBack?: undefined | (() => void) }>;
};
export type ModalWalletConnectProps = ModalBasicProps;
export type ModalAccountProps = ModalWalletConnectProps;
export type ModalGuardianProps = ModalWalletConnectProps;
