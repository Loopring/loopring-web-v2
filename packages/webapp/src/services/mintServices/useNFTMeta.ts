import React from "react";
import { MintCommands, mintService } from "./mintService";
import {
  AccountStatus,
  ErrorType,
  MINT_LIMIT,
  myLog,
  NFTMETA,
  SagaStatus,
} from "@loopring-web/common-resources";
import {
  initialNFTMETA,
  NFT_MINT_VALUE,
  useModalData,
} from "../../stores/router";
import { NFTMetaProps } from "@loopring-web/component-lib";
import { useChargeFees } from "../../hooks/common/useChargeFees";
import * as sdk from "@loopring-web/loopring-sdk";
import store from "../../stores";
import { LoopringAPI } from "../../api_wrapper";
import { useAccount } from "../../stores/account";
import { useSystem } from "../../stores/system";
import { useBtnStatus } from "../../hooks/common/useBtnStatus";

export function useNFTMeta<
  T extends NFTMETA
  // I extends Partial<MintTradeNFT>
>() {
  const subject = React.useMemo(() => mintService.onSocket(), []);
  const { nftMintValue, updateNFTMintData } = useModalData();
  const { status: accountStatus } = useAccount();
  const { chainId } = useSystem();
  const [tokenAddress, setTokenAddress] =
    React.useState<string | undefined>(undefined);
  React.useEffect(() => {
    const account = store.getState().account;
    if (
      account.readyState === AccountStatus.ACTIVATED &&
      accountStatus === SagaStatus.UNSET
    ) {
      setTokenAddress(() => {
        if (account.accAddress && LoopringAPI.nftAPI) {
          return (
            LoopringAPI.nftAPI?.computeNFTAddress({
              nftOwner: account.accAddress,
              nftFactory: sdk.NFTFactory[chainId],
              nftBaseUri: "",
            }).tokenAddress || undefined
          );
        } else {
          return undefined;
        }
      });
    }
  }, [accountStatus]);
  const {
    chargeFeeTokenList,
    isFeeNotEnough,
    checkFeeIsEnough,
    handleFeeChange,
    feeInfo,
  } = useChargeFees({
    tokenAddress: tokenAddress?.toLowerCase(),
    requestType: sdk.OffchainNFTFeeReqType.NFT_MINT,
    updateData: (feeInfo, _chargeFeeList) => {
      updateNFTMintData({
        ...nftMintValue,
        mintData: { ...nftMintValue.mintData, fee: feeInfo },
      });
    },
  });
  const {
    btnStatus,
    btnInfo,
    enableBtn,
    disableBtn,
    setLabelAndParams,
    resetBtnInfo,
  } = useBtnStatus();
  const updateBtnStatus = React.useCallback(
    (error?: ErrorType & any) => {
      resetBtnInfo();
      if (
        !error &&
        nftMintValue &&
        nftMintValue.mintData &&
        nftMintValue.nftMETA &&
        tokenAddress &&
        !!nftMintValue.nftMETA.royaltyPercentage &&
        Number.isInteger(nftMintValue.nftMETA.royaltyPercentage / 1) &&
        nftMintValue.nftMETA.royaltyPercentage / 1 >= 0 &&
        nftMintValue.nftMETA.royaltyPercentage / 1 <= 10 &&
        nftMintValue.mintData.tradeValue &&
        Number(nftMintValue.mintData.tradeValue) > 0 &&
        Number(nftMintValue.mintData.tradeValue) <= MINT_LIMIT &&
        nftMintValue.nftMETA.name &&
        nftMintValue.nftMETA.image &&
        nftMintValue.mintData.fee &&
        nftMintValue.mintData.fee.belong &&
        nftMintValue.mintData.fee.__raw__ &&
        !isFeeNotEnough
      ) {
        enableBtn();
        return;
      }
      if (nftMintValue.nftMETA && !nftMintValue.nftMETA.image) {
        setLabelAndParams("labelMintNoImageBtn", {});
      }
      if (nftMintValue.nftMETA && !nftMintValue.nftMETA.name) {
        setLabelAndParams("labelMintNoNameBtn", {});
      }
      if (
        !(
          !!nftMintValue.nftMETA.royaltyPercentage &&
          Number.isInteger(nftMintValue.nftMETA.royaltyPercentage / 1) &&
          nftMintValue.nftMETA.royaltyPercentage / 1 >= 0 &&
          nftMintValue.nftMETA.royaltyPercentage / 1 <= 10
        )
      ) {
        setLabelAndParams("labelMintWrongRoyaltyBtn", {});
      }
      if (nftMintValue.nftMETA && !nftMintValue.nftMETA.royaltyPercentage) {
        setLabelAndParams("labelMintNoRoyaltyPercentageBtn", {});
      }
      if (nftMintValue.mintData && !nftMintValue.mintData.tradeValue) {
        setLabelAndParams("labelMintTradeValueBtn", {});
      }
      disableBtn();
      myLog("try to disable nftMint btn!");
    },
    [
      isFeeNotEnough,
      resetBtnInfo,
      nftMintValue,
      tokenAddress,
      enableBtn,
      setLabelAndParams,
      disableBtn,
    ]
  );

  React.useEffect(() => {
    updateBtnStatus();
  }, [isFeeNotEnough, nftMintValue, feeInfo]);
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
  const handleOnMetaChange = React.useCallback(
    (_newnftMeta: Partial<T>) => {
      const buildNFTMeta = { ...nftMintValue.nftMETA };
      const buildMint = { ...nftMintValue.mintData };
      Reflect.ownKeys(_newnftMeta).map((key) => {
        switch (key) {
          case "image":
            buildNFTMeta.image = _newnftMeta.image;
            break;
          case "name":
            buildNFTMeta.name = _newnftMeta.name;
            break;
          case "royaltyPercentage":
            const value = Number(_newnftMeta.royaltyPercentage);
            if (
              Number.isInteger(value) &&
              [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].includes(value)
            ) {
              buildNFTMeta.royaltyPercentage = value;
              buildMint.royaltyPercentage = value;
            }
            break;
          case "description":
            buildNFTMeta.description = _newnftMeta.description;
            break;
          case "collection":
            buildNFTMeta.collection = _newnftMeta.collection;
            break;
          case "properties":
            buildNFTMeta.properties = _newnftMeta.properties;
            break;
        }
      });
      updateNFTMintData({ mintData: buildMint, nftMETA: buildNFTMeta });
      myLog("updateNFTMintData buildNFTMeta", buildNFTMeta);
    },
    [nftMintValue]
  );
  // const handleOnNFTDataChange  = React.useCallback(
  //   (m: Partial<I>) => {},
  //   []
  // );
  const resetMETADAT = (_nftMintValue?: NFT_MINT_VALUE<any>) => {
    if (!_nftMintValue) {
      _nftMintValue = { ...(nftMintValue ?? {}) };
    }
    updateNFTMintData({
      ..._nftMintValue,
      nftMETA: initialNFTMETA,
    });
  };

  const nftMetaProps: NFTMetaProps<T> = {
    nftMeta: nftMintValue.nftMETA,
    handleOnMetaChange,
    // handleOnNFTDataChange,
    isFeeNotEnough,
    handleFeeChange,
    chargeFeeTokenList,
    feeInfo,
    nftMetaBtnStatus: btnStatus,
    btnInfo,
    // isAvaiableId,
    // isNFTCheckLoading,
    onMetaClick: () => {},
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
    chargeFeeTokenList,
    isFeeNotEnough,
    checkFeeIsEnough,
    handleFeeChange,
    feeInfo,
    tokenAddress,
    resetMETADAT,
  };
}
