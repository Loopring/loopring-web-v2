import { FeeInfo, MintTradeNFT, NFTMETA } from "@loopring-web/common-resources";
import { useModalData } from "stores/router";
import { BigNumber } from "bignumber.js";
import { useNFTMeta } from "../../../services/mintServices/useNFTMeta";
import { useNFTMint } from "../../../services/mintServices";
import React from "react";
const enum MINT_VIEW_STEP {
  METADATA,
  MINT_CONFIRM,
}
BigNumber.config({ EXPONENTIAL_AT: 100 });
export const useMintNFTPanel = <
  Me extends NFTMETA,
  Mi extends MintTradeNFT<I>,
  I,
  C extends FeeInfo
>() => {
  const [currentTab, setCurrentTab] = React.useState<MINT_VIEW_STEP>(
    MINT_VIEW_STEP.METADATA
  );
  const handleTabChange = React.useCallback((value: MINT_VIEW_STEP) => {
    setCurrentTab(value);
  }, []);
  const {
    onFilesLoad,
    onDelete,
    ipfsMediaSources,
    ipfsProvides,
    nftMetaProps,
    chargeFeeTokenList,
    isFeeNotEnough,
    checkFeeIsEnough,
    handleFeeChange,
    feeInfo,
    errorOnMeta,
    tokenAddress,
    resetMETADAT,
  } = useNFTMeta<Me>({ handleTabChange });

  const { nftMintProps } = useNFTMint<Me, Mi, I, C>({
    chargeFeeTokenList,
    isFeeNotEnough,
    checkFeeIsEnough,
    handleFeeChange,
    feeInfo,
    tokenAddress,
    handleTabChange,
  });
  const { nftMintValue } = useModalData();
  return {
    errorOnMeta,
    onFilesLoad,
    onDelete,
    ipfsMediaSources,
    ipfsProvides,
    nftMetaProps,
    chargeFeeTokenList,
    isFeeNotEnough,
    checkFeeIsEnough,
    handleFeeChange,
    feeInfo,
    tokenAddress,
    resetMETADAT,
    nftMintProps,
    nftMintValue,
    currentTab,
    handleTabChange,
  };
};
