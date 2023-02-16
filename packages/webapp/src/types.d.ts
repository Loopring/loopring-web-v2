import { LoopringSocket } from "@loopring-web/core";
import { RampInstantSDK } from "@ramp-network/ramp-instant-sdk";

declare module "*.html" {
  const value: string;
  export default value;
}
/// <reference types="@google/model-viewer" />

declare global {
  interface Window {
    loopringSocket: InstanceType<LoopringSocket>;
    __renderReportCall__: () => void;
    rampInstance: RampInstantSDK | undefined;
  }
  namespace JSX {
    interface IntrinsicElements {
      "model-viewer": React.DetailedHTMLProps<
        React.AllHTMLAttributes<
          Partial<globalThis.HTMLElementTagNameMap["model-viewer"]>
        >,
        Partial<globalThis.HTMLElementTagNameMap["model-viewer"]>
      >;
    }
  }
}
