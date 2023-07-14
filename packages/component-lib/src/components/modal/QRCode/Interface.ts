import { ReactNode } from 'react'

export interface GatewayItemQRCode {
  key: string
  imgSrc: string
  handleSelect?: (event: React.MouseEvent) => void
}

/**
 * @param handleSelect default hanldeSelect, if item have no private handleSelect function
 */
export interface QRCodePanelProps {
  title?: string | JSX.Element
  description?: string | JSX.Element
}

export type ModalQRCodeProps = QRCodePanelProps & {
  open: boolean
  className?: string
  onClose: {
    bivarianceHack(event: {}, reason: 'backdropClick' | 'escapeKeyDown'): void
  }['bivarianceHack']
}
export type GuardianModalProps = {
  open: boolean
  onClose: {
    bivarianceHack(event: {}, reason: 'backdropClick' | 'escapeKeyDown'): void
  }['bivarianceHack']
  title: ReactNode
  body: ReactNode
  onBack?: () => void
  showBackButton?: boolean
}
