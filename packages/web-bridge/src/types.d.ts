import { RampInstantSDK } from "@ramp-network/ramp-instant-sdk";

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
}
