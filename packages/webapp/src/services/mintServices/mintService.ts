import { Subject } from "rxjs";

export enum MintCommands {
  ProcessingIPFS,
  //CompleteIPFS,
  FailedIPFS,
  SignatureMint,
  CancelSignature,
  HardwareSignature,
  Complete,
}
const subject = new Subject<{
  status: MintCommands;
  data?: {
    uniqueId?: string;
    [key: string]: any;
  };
}>();

export const mintService = {
  sendHardwareRetry: (isHardware?: boolean) => {
    subject.next({
      status: MintCommands.HardwareSignature,
    });
  },
  processingIPFS: (data: any) => {
    subject.next({
      status: MintCommands.ProcessingIPFS,
      data,
    });
  },
  // clearMessages: () => subject.next(),
  onSocket: () => subject.asObservable(),
};
