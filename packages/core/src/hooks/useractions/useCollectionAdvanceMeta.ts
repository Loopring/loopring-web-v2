import {
  CollectionMeta,
  CollectionMetaJSON,
  myLog,
  SDK_ERROR_MAP_TO_UI,
  UIERROR_CODE,
} from "@loopring-web/common-resources";
import {
  CollectionAdvanceProps,
  useOpenModals,
} from "@loopring-web/component-lib";
import React from "react";
import {
  useAccount,
  useModalData,
  useSystem,
  useWalletL2Collection,
} from "../../stores";
import { useBtnStatus } from "../index";
import * as sdk from "@loopring-web/loopring-sdk";
import { LoopringAPI } from "../../api_wrapper";
import { useTranslation } from "react-i18next";

export function useCollectionAdvanceMeta<T extends CollectionMeta>({
  setCollectionToastOpen,
}: {
  setCollectionToastOpen: any;
}) {
  const { allowTrade, chainId } = useSystem();
  const { setShowCollectionAdvance } = useOpenModals();
  const { updateWalletL2Collection } = useWalletL2Collection();
  const { account } = useAccount();
  const [metaData, setMetaData] = React.useState("");
  const { t } = useTranslation("common");
  const {
    btnStatus,
    setLabelAndParams,
    resetBtnInfo,
    enableBtn,
    disableBtn,
    btnInfo,
    setLoadingBtn,
  } = useBtnStatus();
  const { collectionAdvanceValue, updateCollectionAdvanceData } =
    useModalData();
  const [error, setError] =
    React.useState<undefined | { code: UIERROR_CODE; message: string }>(
      undefined
    );
  const onSubmitClick = React.useCallback(
    async (_data: T) => {
      if (
        !error &&
        collectionAdvanceValue.name?.trim() &&
        collectionAdvanceValue.tileUri?.trim() &&
        LoopringAPI.userAPI
      ) {
        setLoadingBtn();
        // debugger;
        try {
          const response = await LoopringAPI.userAPI.submitNFTCollection(
            {
              ...collectionAdvanceValue,
              name: collectionAdvanceValue.name?.trim(),
              tileUri: collectionAdvanceValue.tileUri?.trim(),
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

        setShowCollectionAdvance({ isShow: false });
      }
      // resetBtnInfo();
      // disableBtn();
      setError(undefined);
      setMetaData("");
      updateCollectionAdvanceData({});
    },
    [collectionAdvanceValue, disableBtn, resetBtnInfo]
  );

  const updateBtnStatus = React.useCallback(() => {
    resetBtnInfo();
    if (!error && collectionAdvanceValue?.name) {
      enableBtn();
      return;
    }
    if (
      collectionAdvanceValue === undefined ||
      Object.keys(collectionAdvanceValue).length === 0
    ) {
      setLabelAndParams("labelEnterMeta", {});
    } else if (error) {
      setLabelAndParams(
        SDK_ERROR_MAP_TO_UI[error?.code ?? 700001]?.messageKey,
        {}
      );
    } else if (!collectionAdvanceValue?.name) {
      setLabelAndParams(SDK_ERROR_MAP_TO_UI[700014].messageKey, {});
    }
    disableBtn();
    myLog("try to disable collectionAdvance btn!");
  }, [
    error,
    resetBtnInfo,
    enableBtn,
    setLabelAndParams,
    collectionAdvanceValue,
    disableBtn,
  ]);

  React.useEffect(() => {
    updateBtnStatus();
  }, [collectionAdvanceValue, error]);

  const collectionAdvanceProps: CollectionAdvanceProps<T> = {
    handleDataChange: (_data) => {
      setMetaData(_data);
      try {
        let _metaDataJSON: CollectionMetaJSON = JSON.parse(
          _data.replaceAll(/\n|\s/gi, "")
        );
        const _metaData: CollectionMeta = {
          owner: account.accAddress,
          tileUri: _metaDataJSON?.tile_uri.trim() ?? undefined,
          name: _metaDataJSON?.name?.trim() ?? undefined,
          description: _metaDataJSON?.description?.trim() ?? undefined,
          avatar: _metaDataJSON?.avatar_uri?.trim() ?? undefined,
          banner: _metaDataJSON?.banner_uri?.trim() ?? undefined,
        };
        // let _metaData:any;
        // debugger;
        // eval(`_metaData =_data`)
        if (!_metaData.tileUri) {
          setError({
            code: UIERROR_CODE.ERROR_COLLECTION_METADATA_NO_TILEURI,
            message: "empty tileUri",
          });
          updateCollectionAdvanceData({});
          return;
        }
        if (!_metaData.name) {
          setError({
            code: UIERROR_CODE.ERROR_COLLECTION_NO_NAME,
            message: "empty name",
          });
          updateCollectionAdvanceData({});
          return;
        }
        setError(undefined);
        updateCollectionAdvanceData(_metaData);
      } catch (_error) {
        setError({
          code: UIERROR_CODE.ERROR_JSON_STRINGIFY,
          message: (_error as any)?.message,
        });
        return;
      }
    },
    onSubmitClick,
    allowTrade,
    disabled: false,
    btnStatus,
    btnInfo,
    metaData,
  } as CollectionAdvanceProps<T>;

  return {
    collectionAdvanceProps,
  };
}
