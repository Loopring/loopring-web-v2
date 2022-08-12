import {
  AccountStatus, CollectionMeta,
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
import { useRouteMatch } from 'react-router-dom';
const enum MINT_VIEW_STEP {
  METADATA,
  MINT_CONFIRM,
}
BigNumber.config({ EXPONENTIAL_AT: 100 });
export const useMintNFTPanel = <Me extends NFTMETA,
  Mi extends MintTradeNFT<I>,
  Co extends CollectionMeta,
  I,
  C extends FeeInfo>() => {
  const [currentTab, setCurrentTab] = React.useState<MINT_VIEW_STEP>(
    MINT_VIEW_STEP.METADATA
  );
  const {account, status: accountStatus} = useAccount();
  let match: any = useRouteMatch("/NFT/:item/?:contract");
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
  } = useNFTMeta<Me, Co>({handleTabChange, nftMintValue});

  React.useEffect(() => {
    if (
      accountStatus === SagaStatus.UNSET &&
      account.readyState === AccountStatus.ACTIVATED &&
      match?.params.item === 'mintNFT'
    ) {
      mintService.emptyData(match?.params?.contract ?? '')
    }
  }, [accountStatus, account.readyState, match?.params.item]);
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
