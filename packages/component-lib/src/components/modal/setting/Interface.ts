export type ModalSettingFeeProps = {
  open: boolean
  onClose: {
    bivarianceHack(event: {}, reason: 'backdropClick' | 'escapeKeyDown'): void
  }['bivarianceHack']
  noClose?: boolean
  style?: any
}
