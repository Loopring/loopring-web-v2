export interface GatewayItemQRCode {
  key: string;
  imgSrc: string;
  handleSelect?: (event: React.MouseEvent) => void;
}

/**
 * @param handleSelect default hanldeSelect, if item have no private handleSelect function
 */
export interface QRCodeProps {
  title?: string | JSX.Element;
  size?: number;
  url: string;
  className?: string;
  description?: string | JSX.Element;
}

export type ModalQRCodeProps = QRCodeProps & {
  open: boolean;
  onClose: {
    bivarianceHack(event: {}, reason: "backdropClick" | "escapeKeyDown"): void;
  }["bivarianceHack"];
};
