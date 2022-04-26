import React from "react";
import { MintCommands, mintService } from "./mintService";
import {
  AccountStatus,
  ErrorType,
  IPFS_LOOPRING_SITE,
  IPFS_META_URL,
  MINT_LIMIT,
  myLog,
  NFTMETA,
  SagaStatus,
} from "@loopring-web/common-resources";
import {
  initialMintNFT,
  initialNFTMETA,
  NFT_MINT_VALUE,
  useModalData,
} from "../../stores/router";
import { IpfsFile, NFTMetaProps } from "@loopring-web/component-lib";
import { useChargeFees } from "../../hooks/common/useChargeFees";
import * as sdk from "@loopring-web/loopring-sdk";
import store from "../../stores";
import { LoopringAPI } from "../../api_wrapper";
import { useAccount } from "../../stores/account";
import { useSystem } from "../../stores/system";
import { useBtnStatus } from "../../hooks/common/useBtnStatus";
import { ipfsService, useIPFS } from "../ipfs";
import { AddResult } from "ipfs-core-types/types/src/root";

export function useNFTMeta<
  T extends NFTMETA
  // I extends Partial<MintTradeNFT>
>({ handleTabChange }: { handleTabChange: (value: 0 | 1) => void }) {
  const subject = React.useMemo(() => mintService.onSocket(), []);
  const { nftMintValue, updateNFTMintData } = useModalData();
  const { status: accountStatus } = useAccount();
  const [_cidUniqueID, setCIDUniqueId] =
    React.useState<string | undefined>(undefined);
  const { chainId } = useSystem();
  const [tokenAddress, setTokenAddress] =
    React.useState<string | undefined>(undefined);
  const [ipfsMediaSources, setIpfsMediaSources] =
    React.useState<IpfsFile | undefined>(undefined);

  const handleOnMetaChange = React.useCallback(
    (_newnftMeta: Partial<T>) => {
      const { nftMETA, mintData } =
        store.getState()._router_modalData.nftMintValue;
      const buildNFTMeta = { ...nftMETA };
      const buildMint = { ...mintData };
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
    [updateNFTMintData]
  );
  const handleFailedUpload = React.useCallback(
    (data: { uniqueId: string; error: sdk.RESULT_INFO }) => {
      setIpfsMediaSources((value) => {
        let _value: IpfsFile = { ...(value ?? {}) } as IpfsFile;
        if (value && value?.uniqueId === data.uniqueId) {
          _value = {
            ..._value,
            ...data,
          };
          handleOnMetaChange({
            image: undefined,
          } as Partial<T>);
        }
        return _value;
      });
    },
    [handleOnMetaChange]
  );
  const handleSuccessUpload = React.useCallback(
    (data: AddResult & { uniqueId: string }) => {
      setIpfsMediaSources((value) => {
        let _value: IpfsFile = { ...(value ?? {}) } as IpfsFile;
        if (value && value?.uniqueId === data.uniqueId) {
          const cid = data.cid.toString();
          _value = {
            ..._value,
            cid: cid,
            fullSrc: `${IPFS_LOOPRING_SITE}/ipfs/${data.path}`,
            // `${LoopringIPFSSiteProtocol}://${LoopringIPFSSite}/ipfs/${cid}`,
            // `${LOOPRING_URLs.IPFS_META_URL}${cid}`,
            isProcessing: false,
          };
          handleOnMetaChange({
            image: `${IPFS_META_URL}${data.path}`,
          } as T);
        }
        return _value;
      });
      setCIDUniqueId((cidUniqueID) => {
        if (cidUniqueID && cidUniqueID === data.uniqueId) {
          mintService.completedIPFS({ ipfsResult: data });
          // if (data.cid && LoopringAPI.nftAPI) {
          //   let nftId: string = "";
          //   const cid = data.cid.toString();
          //   try {
          //     nftId = LoopringAPI.nftAPI.ipfsCid0ToNftID(cid);
          //     let nftIdView = new BigNumber(nftId ?? "0", 16).toString();
          //     updateNFTMintData({
          //       ...nftMintValue,
          //       mintData: {
          //         ...nftMintValue.nftMETA,
          //         nftIdView,
          //         nftId,
          //       },
          //     });
          //   } catch (error: any) {
          //     myLog("handleMintDataChange ->.cid", error);
          //     updateNFTMintData({
          //       ...nftMintValue,
          //       error: {
          //         code: UIERROR_CODE.IPFS_CID_TO_NFTID_ERROR,
          //         message: `CID: ${cid} to nftId: ${nftId} failed`,
          //       },
          //     });
          //   }
          // }
        }
        return cidUniqueID;
      });
    },
    [handleOnMetaChange]
  );
  const { ipfsProvides } = useIPFS({
    handleSuccessUpload,
    handleFailedUpload,
  });
  const onFilesLoad = React.useCallback(
    (value: IpfsFile) => {
      value.isUpdateIPFS = true;
      setIpfsMediaSources(value);
      ipfsService.addFile({
        ipfs: ipfsProvides.ipfs,
        file: value.file,
        uniqueId: value.uniqueId,
      });
    },
    [ipfsProvides.ipfs]
  );
  const onDelete = React.useCallback(() => {
    setIpfsMediaSources(undefined);
    handleOnMetaChange({
      image: undefined,
    } as Partial<T>);
  }, [handleOnMetaChange]);
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
  }, [accountStatus, chainId]);
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
      myLog(
        "nftMetaBtnStatus nftMintValue",
        nftMintValue.mintData,
        nftMintValue.nftMETA
      );

      if (
        !error &&
        nftMintValue &&
        nftMintValue.mintData &&
        nftMintValue.nftMETA &&
        tokenAddress &&
        nftMintValue.nftMETA.royaltyPercentage !== undefined &&
        Number.isInteger(nftMintValue.nftMETA.royaltyPercentage / 1) &&
        nftMintValue.nftMETA.royaltyPercentage / 1 >= 0 &&
        nftMintValue.nftMETA.royaltyPercentage / 1 <= 10 &&
        nftMintValue.mintData.tradeValue &&
        Number(nftMintValue.mintData.tradeValue) > 0 &&
        Number(nftMintValue.mintData.tradeValue) <= MINT_LIMIT &&
        !!nftMintValue.nftMETA.name &&
        !!nftMintValue.nftMETA.image &&
        nftMintValue.mintData.fee &&
        nftMintValue.mintData.fee.belong &&
        nftMintValue.mintData.fee.__raw__ &&
        !isFeeNotEnough
      ) {
        enableBtn();
        return;
      }

      if (
        !nftMintValue.nftMETA.image ||
        nftMintValue.nftMETA.image.trim() == ""
      ) {
        setLabelAndParams("labelMintNoImageBtn", {});
      }
      if (
        !nftMintValue.nftMETA.name ||
        nftMintValue.nftMETA.name.trim() == ""
      ) {
        setLabelAndParams("labelMintNoNameBtn", {});
      }
      if (
        !(
          nftMintValue.nftMETA.royaltyPercentage !== undefined &&
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
      resetBtnInfo,
      nftMintValue,
      tokenAddress,
      isFeeNotEnough,
      disableBtn,
      enableBtn,
      setLabelAndParams,
    ]
  );

  React.useEffect(() => {
    updateBtnStatus();
  }, [
    isFeeNotEnough,
    nftMintValue.mintData,
    nftMintValue.nftMETA,
    feeInfo,
    updateBtnStatus,
  ]);
  const commonSwitch = React.useCallback(
    async ({ data, status }: { status: MintCommands; data?: any }) => {
      switch (status) {
        case MintCommands.EmptyData:
        case MintCommands.MetaDataSetup:
        case MintCommands.FailedIPFS:
          handleTabChange(0);
          break;
        case MintCommands.ProcessingIPFS:
          break;
      }
    },
    [handleTabChange]
  );

  const resetMETADAT = (_nftMintValue?: NFT_MINT_VALUE<any>) => {
    let nftMETA = {},
      mintData = {};
    if (_nftMintValue && _nftMintValue.nftMETA) {
      nftMETA = _nftMintValue.nftMETA;
      mintData = _nftMintValue.mintData ?? {};
    }
    updateNFTMintData({
      mintData: {
        ...initialMintNFT,
        ...mintData,
        tokenAddress,
      },
      nftMETA: {
        ...initialNFTMETA,
        ...nftMETA,
      },
    });
  };
  const onMetaClick = React.useCallback(() => {
    const uniqueId = (nftMintValue.nftMETA as T).name + Date.now();
    setCIDUniqueId(uniqueId);
    mintService.processingIPFS({ ipfsProvides, uniqueId });
  }, [ipfsProvides, nftMintValue.nftMETA]);
  const nftMetaProps: NFTMetaProps<T> = {
    nftMeta: nftMintValue.nftMETA as T,
    handleOnMetaChange,
    isFeeNotEnough,
    handleFeeChange,
    chargeFeeTokenList,
    feeInfo,
    nftMetaBtnStatus: btnStatus,
    btnInfo,

    onMetaClick,
  };
  React.useEffect(() => {
    const subscription = subject.subscribe((props) => {
      commonSwitch(props);
    });
    return () => {
      subscription.unsubscribe();
    };
  }, [commonSwitch, subject]);
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
  };
}
