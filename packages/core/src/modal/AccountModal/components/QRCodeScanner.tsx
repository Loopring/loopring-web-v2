import { ImportRedPacketWrap } from '@loopring-web/component-lib'
import { useQrcodeScan } from '../../../services'
import React from 'react'
import { myLog } from '@loopring-web/common-resources'
// import { useLocation } from 'react-use';

export const ImportRedPacket = ({
  handleSuccess,
}: {
  handleSuccess: (value: string) => Promise<void>
}) => {
  const ref = React.useRef()
  // const { search } = useLocation();
  const handleFailedUpload = React.useCallback((data: any) => {
    myLog('handleFailedUpload', data)
  }, [])
  const handleSuccessUpload = React.useCallback((result: any) => {
    myLog('handleSuccessUpload', result?.data?.decodedText)
    if (result?.data?.decodedText) {
      handleSuccess(result?.data?.decodedText)
    }
  }, [])

  const { h5QrcodeScannerProvides } = useQrcodeScan({
    handleFailedUpload,
    handleSuccessUpload,
  })
  React.useEffect(() => {
    if (ref.current) {
      h5QrcodeScannerProvides.render()
    } else {
      h5QrcodeScannerProvides.clear()
    }
    return () => {
      h5QrcodeScannerProvides.clear()
    }
  }, [ref.current])
  return <ImportRedPacketWrap ref={ref} />
}
