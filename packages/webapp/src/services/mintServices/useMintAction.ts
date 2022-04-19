import React from "react";
import { MintCommands, mintService } from "./mintService";
import { useNFTMint } from "./useNFTMint";
import { useModalData } from "../../stores/router";
import { FeeInfo, NFTMETA, TradeNFT } from "@loopring-web/common-resources";

export function useMintAction<T, I, C extends FeeInfo>() {
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
