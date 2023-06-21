import React from 'react'
import { IPFSCommands, IpfsProvides, ipfsService } from './ipfsService'
const ipfsProvides = new IpfsProvides()

export function useIPFS({ handleSuccessUpload, handleFailedUpload }: any) {
  const subject = React.useMemo(() => ipfsService.onSocket(), [])
  const start = React.useCallback(async () => {
    await ipfsProvides.init()
  }, [])
  React.useEffect(() => {
    start()
    const subscription = subject.subscribe(
      ({ data, status }: { status: IPFSCommands; data?: any }) => {
        switch (status) {
          case IPFSCommands.IpfsResult:
            handleSuccessUpload(data)
            break
          case IPFSCommands.ErrorGetIpfs:
            handleFailedUpload(data)
        }
      },
    )
    return () => {
      ipfsProvides.stop()
      subscription.unsubscribe()
    }
  }, [])
  return { ipfsProvides }
}
