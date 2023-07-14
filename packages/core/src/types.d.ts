import { LoopringSocket } from '@loopring-web/core'
import { RampInstantSDK } from '@ramp-network/ramp-instant-sdk'

declare global {
  interface Window {
    loopringSocket: InstanceType<LoopringSocket>
    __renderReportCall__: () => void
    Banxa: any
    rampInstance: RampInstantSDK | undefined
    rampTransPromise: Promise<{ txHash: string }> | undefined
  }
}
