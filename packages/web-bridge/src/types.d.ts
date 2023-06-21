import { RampInstantSDK } from '@ramp-network/ramp-instant-sdk'
import '@google/model-viewer'
import { ModelViewerElement } from '@google/model-viewer'

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
}
