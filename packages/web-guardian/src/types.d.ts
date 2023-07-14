import { RampInstantSDK } from '@ramp-network/ramp-instant-sdk'
import { LoopringSocket } from '@loopring-web/core'
import * as sdk from '@loopring-web/loopring-sdk'

declare module '*.html' {
  const value: string
  export default value
}

declare global {
  interface Window {
    loopringSocket: InstanceType<LoopringSocket>
    __renderReportCall__: () => void
    rampInstance: RampInstantSDK | undefined
  }

  namespace JSX {
    interface IntrinsicElements {
      'model-viewer': MyElementAttributes
    }

    interface MyElementAttributes {
      src: string
      'auto-rotate': any
      'camera-controls': any
      'ar-modes': any
      'touch-action': any
      'shadow-intensity': any
      poster?: string

      [key: string]: any
    }
  }

  type ChainId = ChainIdExtends | sdk.ChainId

  namespace JSX {
    interface IntrinsicElements {
      'model-viewer': MyElementAttributes
    }

    interface MyElementAttributes {
      src: string
      'auto-rotate': any
      'camera-controls': any
      'ar-modes': any
      'touch-action': any
      'shadow-intensity': any
      poster?: string

      [key: string]: any
    }
  }
}
