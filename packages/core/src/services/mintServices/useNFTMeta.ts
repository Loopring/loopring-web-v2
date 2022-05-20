import React from "react";
import {
  ErrorType,
  IPFS_LOOPRING_SITE,
  IPFS_META_URL,
  MINT_LIMIT,
  myLog,
  NFTMETA,
  UIERROR_CODE,
} from "@loopring-web/common-resources";
import { IpfsFile, NFTMetaProps } from "@loopring-web/component-lib";
import {
  store,
  useBtnStatus,
  useChargeFees,
  NFT_MINT_VALUE,
  useModalData,
  MintCommands,
  mintService,
} from "../../index";
import * as sdk from "@loopring-web/loopring-sdk";
import { ipfsService, useIPFS } from "../ipfs";
import { AddResult } from "ipfs-core-types/types/src/root";

export function useNFTMeta<T extends NFTMETA>({
  handleTabChange,
  nftMintValue,
}: {
  nftMintValue: NFT_MINT_VALUE<any>;
  handleTabChange: (value: 0 | 1) => void;
}) {
  const subject = React.useMemo(() => mintService.onSocket(), []);
  const { updateNFTMintData } = useModalData();
  const [errorOnMeta, setErrorOnMeta] =
    React.useState<sdk.RESULT_INFO | undefined>(undefined);
  const [_cidUniqueID, setCIDUniqueId] =
    React.useState<string | undefined>(undefined);
  const [ipfsMediaSources, setIpfsMediaSources] =
    React.useState<IpfsFile | undefined>(undefined);
  const [userAgree, setUserAgree] = React.useState(false);

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
            buildMint.royaltyPercentage = value;
            buildNFTMeta.royaltyPercentage = value;
            // if (
            //   Number.isInteger(value) &&
            //   [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].includes(value)
            // ) {
            //   buildNFTMeta.royaltyPercentage = value;
            //   buildMint.royaltyPercentage = value;
            // }
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
            ...{
              error: data.error
                ? data.error
                : {
                    code: UIERROR_CODE.UNKNOWN,
                    message: `Ipfs Error ${data}`,
                  },
            },
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
            fullSrc: `${IPFS_LOOPRING_SITE}${data.path}`,
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
          mintService.completedIPFSCallMint({ ipfsResult: data });
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

  const {
    chargeFeeTokenList,
    isFeeNotEnough,
    checkFeeIsEnough,
    handleFeeChange,
    feeInfo,
  } = useChargeFees({
    tokenAddress: nftMintValue.mintData.tokenAddress?.toLowerCase(),
    requestType: sdk.OffchainNFTFeeReqType.NFT_MINT,
    updateData: ({ fee }) => {
      const { nftMETA, mintData } =
        store.getState()._router_modalData.nftMintValue;
      updateNFTMintData({
        nftMETA: nftMETA,
        mintData: { ...mintData, fee },
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
      // myLog(
      //   "nftMetaBtnStatus nftMintValue",
      //   nftMintValue.mintData,
      //   nftMintValue.nftMETA,
      //   nftMintValue.mintData.fee
      // );
      if (
        !error &&
        nftMintValue &&
        nftMintValue.mintData &&
        nftMintValue.nftMETA &&
        userAgree &&
        // tokenAddress &&
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
      if (!userAgree) {
        setLabelAndParams("labelMintUserAgree", {});
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

      if (
        !(
          nftMintValue.mintData.tradeValue &&
          Number(nftMintValue.mintData.tradeValue) > 0 &&
          Number(nftMintValue.mintData.tradeValue) <= MINT_LIMIT
        )
      ) {
        setLabelAndParams("labelMintTradeValueBtn", {});
      }

      disableBtn();
      myLog("try to disable nftMint btn!");
    },
    [
      resetBtnInfo,
      nftMintValue,
      userAgree,
      // tokenAddress,
      // isFeeNotEnough,
      disableBtn,
      enableBtn,
      setLabelAndParams,
    ]
  );

  React.useEffect(() => {
    updateBtnStatus();
  }, [
    // isFeeNotEnough,
    nftMintValue.mintData,
    nftMintValue.nftMETA,
    // feeInfo,
    userAgree,
    updateBtnStatus,
  ]);

  const resetMETADAT = (_nftMintValue?: NFT_MINT_VALUE<any>) => {
    onDelete();
  };
  const onMetaClick = React.useCallback(() => {
    const uniqueId = (nftMintValue.nftMETA as T).name + Date.now();
    setCIDUniqueId(uniqueId);
    mintService.processingIPFS({ ipfsProvides, uniqueId });
  }, [ipfsProvides, nftMintValue.nftMETA]);
  const handleUserAgree = (value: boolean) => {
    setUserAgree(value);
  };
  const nftMetaProps: NFTMetaProps<T> = {
    handleOnMetaChange,
    isFeeNotEnough,
    handleFeeChange,
    userAgree,
    handleUserAgree,
    chargeFeeTokenList,
    feeInfo,
    nftMetaBtnStatus: btnStatus,
    btnInfo,
    onMetaClick,
  };
  const commonSwitch = React.useCallback(
    async ({ data, status }: { status: MintCommands; data?: any }) => {
      switch (status) {
        case MintCommands.MetaDataSetup:
          handleTabChange(0);
          setErrorOnMeta(data?.error);
          if (data?.emptyData) {
            resetMETADAT();
          }
          break;
      }
    },
    [handleTabChange]
  );
  React.useEffect(() => {
    checkFeeIsEnough();
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
    // tokenAddress,
    // resetMETADAT,
    errorOnMeta,
  };
}
