import {
  AccountStatus,
  CollectionMeta,
  ErrorType,
  IPFS_HEAD_URL,
  myLog,
  SagaStatus,
  SDK_ERROR_MAP_TO_UI,
  UIERROR_CODE,
} from "@loopring-web/common-resources";
import {
  collectionService,
  getIPFSString,
  ipfsService,
  LoopringAPI,
  store,
  useBtnStatus,
  useIPFS,
  useModalData,
  useSystem,
  useToast,
  useWalletL2Collection,
} from "@loopring-web/core";
import { BigNumber } from "bignumber.js";
import React from "react";
import { useAccount } from "@loopring-web/core";
import { IpfsFile, useToggle } from "@loopring-web/component-lib";
import { useHistory, useRouteMatch } from "react-router-dom";
import * as sdk from "@loopring-web/loopring-sdk";
import { AddResult } from "ipfs-core-types/src/root";
import { useTranslation } from "react-i18next";

const enum MINT_VIEW_STEP {
  METADATA,
  MINT_CONFIRM,
}

BigNumber.config({ EXPONENTIAL_AT: 100 });
export const useCollectionPanel = <T extends CollectionMeta>({
  isEdit = false,
}: {
  isEdit?: boolean;
}) => {
  let match: any = useRouteMatch("/NFT/:item");
  const {
    toggle: { collectionNFT },
  } = useToggle();
  const {
    toastOpen: collectionToastOpen,
    setToastOpen: setCollectionToastOpen,
    closeToast: collectionToastClose,
  } = useToast();
  const { t } = useTranslation("common");
  const [disabled, _setDisabled] = React.useState(!collectionNFT.enable);
  const { collectionValue, updateCollectionData } = useModalData();
  const { baseURL, chainId } = useSystem();
  const { updateWalletL2Collection } = useWalletL2Collection();
  const history = useHistory();
  const [keys, setKeys] = React.useState<{
    [key: string]: undefined | IpfsFile;
  }>(() => {
    return isEdit
      ? {}
      : {
          banner: undefined,
          name: undefined,
          tileUri: undefined,
          avatar: undefined,
          thumbnail: undefined,
        };
  });

  const { account, status: accountStatus } = useAccount();

  const {
    btnStatus,
    btnInfo,
    enableBtn,
    disableBtn,
    setLabelAndParams,
    resetBtnInfo,
    setLoadingBtn,
  } = useBtnStatus();
  const updateBtnStatus = React.useCallback(
    (error?: ErrorType & any) => {
      resetBtnInfo();

      const ipfsProcessing = Reflect.ownKeys(keys).find(
        (key) => keys[key as string]?.isProcessing === true
      );

      if (
        !error &&
        collectionValue &&
        collectionValue.name &&
        collectionValue.tileUri &&
        ipfsProcessing == undefined
      ) {
        enableBtn();
        return;
      }
      if (!collectionValue.name) {
        setLabelAndParams("labelCollectionRequiredName", {});
      }
      if (!collectionValue.tileUri) {
        setLabelAndParams("labelCollectionRequiredTileUri", {});
      }

      if (ipfsProcessing) {
        setLoadingBtn();
        return;
      }

      disableBtn();
      myLog("try to disable nftMint btn!");
    },
    [
      keys,
      resetBtnInfo,
      collectionValue,
      disableBtn,
      enableBtn,
      setLabelAndParams,
    ]
  );

  React.useEffect(() => {
    updateBtnStatus();
  }, [collectionValue, updateBtnStatus, keys]);
  const onSubmitClick = React.useCallback(async () => {
    if (
      collectionValue.name?.trim() &&
      collectionValue.tileUri?.trim() &&
      LoopringAPI.userAPI
    ) {
      setLoadingBtn();
      // debugger;
      try {
        const response = await LoopringAPI.userAPI.submitNFTCollection(
          {
            ...collectionValue,
            name: collectionValue.name?.trim(),
            tileUri: collectionValue.tileUri?.trim(),
            owner: account.accAddress,
          } as sdk.CollectionMeta,
          chainId as any,
          account.apiKey,
          account.eddsaKey.sk
        );
        if (
          response &&
          ((response as sdk.RESULT_INFO).code ||
            (response as sdk.RESULT_INFO).message)
        ) {
          if ((response as sdk.RESULT_INFO).code === 102127) {
            // @ts-ignore
            throw new Error(
              t(
                SDK_ERROR_MAP_TO_UI[
                  (response as sdk.RESULT_INFO).code ?? UIERROR_CODE.UNKNOWN
                ]?.message ?? "",
                { ns: "error" }
              )
            );
          } else {
            throw new Error((response as sdk.RESULT_INFO).message);
          }
        } else {
          setCollectionToastOpen({
            open: true,
            type: "success",
            content: t("labelCreateCollectionSuccess"),
          });
          updateWalletL2Collection({ page: 1 });
          history.push("/nft/myCollection");
        }
      } catch (error) {
        setCollectionToastOpen({
          open: true,
          type: "error",
          content:
            t("labelCreateCollectionFailed") +
            `: ${
              (error as any)?.message
                ? (error as any).message
                : t("errorUnknown")
            }`,
        });
      }
    }
    updateCollectionData({});
  }, [collectionValue, disableBtn, resetBtnInfo]);

  const handleOnDataChange = React.useCallback((key: string, value: any) => {
    const collectionValue = store.getState()._router_modalData.collectionValue;
    myLog("collectionValue", collectionValue);
    updateCollectionData({ ...collectionValue, [key]: value });
  }, []);

  const onDelete = React.useCallback(
    (key: string) => {
      setKeys((state) => {
        return {
          ...state,
          [key]: undefined,
        };
      });
      handleOnDataChange(key, undefined);
    },
    [handleOnDataChange]
  );

  const handleFailedUpload = React.useCallback(
    (data: { uniqueId: string; error: sdk.RESULT_INFO }) => {
      setKeys((state) => {
        const key: string = Reflect.ownKeys(state).find((key) => {
          return state[key as any]?.uniqueId === data.uniqueId;
        }) as string;
        if (key) {
          handleOnDataChange(key, undefined);
          return {
            ...state,
            [key]: {
              ...state[key],
              isProcessing: false,
              ...{
                error: data.error
                  ? data.error
                  : {
                      code: UIERROR_CODE.UNKNOWN,
                      message: `Ipfs Error ${data}`,
                    },
              },
            } as IpfsFile,
          };
        } else {
          return state;
        }
      });
    },
    [handleOnDataChange]
  );
  const handleSuccessUpload = React.useCallback(
    (data: AddResult & { uniqueId: string }) => {
      setKeys((state) => {
        const key: string = Reflect.ownKeys(state).find((key) => {
          return state[key as any]?.uniqueId === data.uniqueId;
        }) as string;
        if (key) {
          const cid = data.cid.toString();
          handleOnDataChange(key, `${IPFS_HEAD_URL}${data.path}`);
          return {
            ...state,
            [key as any]: {
              ...state[key as any],
              ...{
                cid: cid,
                fullSrc: getIPFSString(`${IPFS_HEAD_URL}${data.path}`, baseURL),
                isProcessing: false,
              },
            },
          };
        } else {
          return state;
        }
      });
    },
    [handleOnDataChange]
  );

  const { ipfsProvides } = useIPFS({
    handleSuccessUpload,
    handleFailedUpload,
  });

  const onFilesLoad = React.useCallback(
    (key: string, value: IpfsFile) => {
      let uniqueId = key + "|" + Date.now();
      value.isUpdateIPFS = true;
      ipfsService.addFile({
        ipfs: ipfsProvides.ipfs,
        file: value.file,
        uniqueId: uniqueId,
      });
      setKeys((state) => {
        return {
          ...state,
          [key]: {
            file: value.file,
            isProcessing: true,
            error: undefined,
            uniqueId: uniqueId,
            isUpdateIPFS: true,
            cid: "",
          },
        };
      });
    },
    [ipfsProvides.ipfs]
  );

  React.useEffect(() => {
    if (
      accountStatus === SagaStatus.UNSET &&
      account.readyState === AccountStatus.ACTIVATED &&
      match?.params.item === "addCollection"
    ) {
      collectionService.emptyData();
    }
  }, [accountStatus, account.readyState]);

  return {
    keys,
    collectionToastOpen,
    collectionToastClose,
    onFilesLoad,
    onDelete,
    btnStatus,
    btnInfo,
    disabled,
    handleOnDataChange,
    collectionValue,
    onSubmitClick,
  };
};
