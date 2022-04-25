import {
  AccountStatus,
  FeeInfo,
  MintTradeNFT,
  myLog,
  NFTMETA,
  NFTWholeINFO,
  SagaStatus,
} from "@loopring-web/common-resources";
import React, { useState } from "react";
import { LoopringAPI } from "api_wrapper";
import { connectProvides } from "@loopring-web/web3-provider";
import { useSystem } from "stores/system";
import {
  LOOPRING_URLs,
  NftData,
  NFTTokenInfo,
  DEPLOYMENT_STATUS,
} from "@loopring-web/loopring-sdk";
import { NFT_MINT_VALUE, useModalData } from "stores/router";
import { useOpenModals } from "@loopring-web/component-lib";
import { BigNumber } from "bignumber.js";
import { useWalletLayer2NFT } from "stores/walletLayer2NFT";
import * as loopring_defs from "@loopring-web/loopring-sdk";
import { useAccount } from "stores/account";
import { useNFTMeta } from "../../../services/mintServices/useNFTMeta";
import { useNFTMint } from "../../../services/mintServices";

BigNumber.config({ EXPONENTIAL_AT: 100 });
export const useMintNFTPanel = <
  Me extends NFTMETA,
  Mi extends MintTradeNFT<I>,
  I,
  C extends FeeInfo
>() => {
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
    tokenAddress,
    resetMETADAT,
  } = useNFTMeta<Me>();
  const { nftMintProps } = useNFTMint<Me, Mi, I, C>({
    chargeFeeTokenList,
    isFeeNotEnough,
    checkFeeIsEnough,
    handleFeeChange,
    feeInfo,
    tokenAddress,
  });
  const { nftMintValue } = useModalData();
  return {
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
  };
};
