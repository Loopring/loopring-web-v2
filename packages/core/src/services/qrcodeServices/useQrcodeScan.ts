import React from 'react'
import {
  H5QrcodeScannerCommands,
  h5QrcodeScannerService,
  Html5QrcodeScannerProvides,
} from './qrCodeService'

export const h5QrcodeScannerProvides = new Html5QrcodeScannerProvides()

export function useQrcodeScan({ handleFailedUpload, handleSuccessUpload }: any) {
  const subject = React.useMemo(() => h5QrcodeScannerService.onSocket(), [])

  const start = React.useCallback(async () => {
    await h5QrcodeScannerProvides.init()
  }, [])
  React.useEffect(() => {
    start()
    h5QrcodeScannerProvides.init()
    const subscription = subject.subscribe(
      ({ data, status }: { status: H5QrcodeScannerCommands; data?: any }) => {
        switch (status) {
          case H5QrcodeScannerCommands.SuccessH5QrcodeScanner:
            handleSuccessUpload(data)
            break
          case H5QrcodeScannerCommands.ErrorHtml5QrcodeScanner:
            handleFailedUpload(data)
            break
        }
      },
    )
    return () => {
      h5QrcodeScannerProvides.stop()
      subscription.unsubscribe()
    }
  }, [])

  return {
    h5QrcodeScannerProvides,
  }
}
