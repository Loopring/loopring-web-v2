import React from "react";
import { MintCommands, mintService } from "./mintService";
import {
  AccountStatus,
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

export function useNFTMeta<
  T extends Partial<NFTMETA>
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
  const handleOnMetaChange = React.useCallback((nftMeta: Partial<T>) => {}, []);
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
    nftMeta: initialNFTMETA as T,
    handleOnMetaChange,
    // handleOnNFTDataChange,
    isFeeNotEnough,
    handleFeeChange,
    chargeFeeTokenList,
    feeInfo,
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
