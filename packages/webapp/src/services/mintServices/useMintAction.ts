import React from "react";
import { MintCommands, mintService } from "./mintService";
import { useNFTMint } from "./useNFTMint";
import { useModalData } from "../../stores/router";

export function useMintAction() {
  const subject = React.useMemo(() => mintService.onSocket(), []);
  const { nftMintProps } = useNFTMint();
  const { nftMintValue } = useModalData();
  const commonSwitch = React.useCallback(
    async ({ data, status }: { status: MintCommands; data?: any }) => {
      switch (status) {
        case MintCommands.HardwareSignature:
          nftMintProps.onNFTMintClick(nftMintValue as any, false);
      }
    },
    [nftMintProps]
  );
  React.useEffect(() => {
    const subscription = subject.subscribe((props) => {
      commonSwitch(props);
    });
    return () => {
      subscription.unsubscribe();
    };
  }, []);
  return {
    nftMintProps,
  };
}
