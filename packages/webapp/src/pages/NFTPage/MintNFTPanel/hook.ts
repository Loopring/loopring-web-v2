import {
  AccountStatus,
  FeeInfo,
  MintTradeNFT,
  NFTMETA,
  SagaStatus,
} from "@loopring-web/common-resources";
import { useModalData } from "@loopring-web/core";
import { BigNumber } from "bignumber.js";
import { useNFTMeta } from "@loopring-web/core";
import { mintService, useNFTMint } from "@loopring-web/core";
import React from "react";
import { useAccount } from "@loopring-web/core";
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
  const { account, status: accountStatus } = useAccount();

  const handleTabChange = React.useCallback((value: MINT_VIEW_STEP) => {
    setCurrentTab(value);
  }, []);
  const { nftMintValue } = useModalData();
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
    // resetMETADAT,
  } = useNFTMeta<Me>({ handleTabChange, nftMintValue });
  React.useEffect(() => {
    if (
      accountStatus === SagaStatus.UNSET &&
      account.readyState === AccountStatus.ACTIVATED
    ) {
      mintService.emptyData();
    }
  }, [accountStatus, account.readyState]);
  const { nftMintProps } = useNFTMint<Me, Mi, I, C>({
    chargeFeeTokenList,
    isFeeNotEnough,
    checkFeeIsEnough,
    handleFeeChange,
    feeInfo,
    handleTabChange,
    nftMintValue,
  });

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
    // resetMETADAT,
    nftMintProps,
    nftMintValue,
    currentTab,
    handleTabChange,
  };
};
