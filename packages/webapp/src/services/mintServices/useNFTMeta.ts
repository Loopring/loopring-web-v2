import React from "react";
import { MintCommands, mintService } from "./mintService";
import { NFTMETA } from "@loopring-web/common-resources";
import { useModalData } from "../../stores/router";

export function useNFTMeta<T extends Partial<NFTMETA>>() {
  const subject = React.useMemo(() => mintService.onSocket(), []);
  const { nftMintValue, updateNFTMintData } = useModalData();

  const commonSwitch = React.useCallback(
    async ({ data, status }: { status: MintCommands; data?: any }) => {
      switch (status) {
        case MintCommands.FailedIPFS:
        case MintCommands.ProcessingIPFS:
          break;
      }
    },
    []
  );
  const handleONMetaChange = React.useCallback(
    (nftMeta: Partial<NFTMETA>) => {},
    []
  );
  // ProcessingIPFS,
  //   //CompleteIPFS,
  //   FailedIPFS,
  const nftMetaProps = {
    nftMeta: {} as Partial<NFTMETA>,
    handleONMetaChange,
  };
  React.useEffect(() => {
    const subscription = subject.subscribe((props) => {
      commonSwitch(props);
    });
    return () => {
      subscription.unsubscribe();
    };
  }, []);
  return {
    nftMetaProps,
    handleONMetaChange,
  };
}
