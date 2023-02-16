import { RampInstantSDK } from "@ramp-network/ramp-instant-sdk";
import "@google/model-viewer";
import { ModelViewerElement } from "@google/model-viewer";
declare module "*.html" {
  const value: string;
  export default value;
}

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

    interface MyElementAttributes {
      src: string;
    }
  }
}
