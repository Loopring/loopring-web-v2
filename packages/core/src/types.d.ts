import { LoopringSocket } from "@loopring-web/core";

declare global {
  interface Window {
    loopringSocket: InstanceType<LoopringSocket>;
    __renderReportCall__: () => void;
  }
}
