import React from "react";
import { Commands, IPFSCommands } from "../account/command";
import { IpfsProvides, ipfsService } from "./ipfsService";

export function useIPFS({ handleSuccessUpload, handleFailedUpload }: any) {
  const ipfsProvides = new IpfsProvides();
  const subject = React.useMemo(() => ipfsService.onSocket(), []);

  React.useEffect(() => {
    ipfsProvides.startIpfs();
    const subscription = subject.subscribe(
      ({ data, status }: { status: keyof typeof IPFSCommands; data?: any }) => {
        switch (status) {
          case IPFSCommands.IpfsResult:
            handleSuccessUpload({ CID: data.cid, unquieID: data.unquieID });
            break;
          case IPFSCommands.ErrorGetIpfs:
            handleFailedUpload({ error: data.error });
        }
      }
    );
    return () => {
      ipfsProvides.stop();
      subscription.unsubscribe();
    };
  }, []);
  return { ipfsProvides };
}
