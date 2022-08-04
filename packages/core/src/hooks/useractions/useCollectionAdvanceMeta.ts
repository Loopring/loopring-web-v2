import {
  CollectionMeta, myLog, SDK_ERROR_MAP_TO_UI, UIERROR_CODE,

} from "@loopring-web/common-resources";
import { CollectionAdvanceProps, useOpenModals } from "@loopring-web/component-lib";
import React from 'react';
import { useAccount, useModalData, useSystem } from '../../stores';
import { useBtnStatus } from '../index';
import * as sdk from "@loopring-web/loopring-sdk";
import { LoopringAPI } from '../../api_wrapper';
import { useTranslation } from 'react-i18next';


export function useCollectionAdvanceMeta<T extends CollectionMeta>(
  {setCollectionToastOpen}: {
    // collectionToastOpen:{ open?: boolean; type: any; content: string },
    setCollectionToastOpen: any
  }) {
  const {allowTrade, chainId} = useSystem();
  const {setShowCollectionAdvance} = useOpenModals();
  const {account} = useAccount();
  const [metaData, setMetaData] = React.useState('');
  const {t} = useTranslation('common');
  const {
    btnStatus,
    setLabelAndParams,
    resetBtnInfo,
    enableBtn,
    disableBtn,
    btnInfo,
    setLoadingBtn
  } = useBtnStatus();
  const {collectionAdvanceValue, updateCollectionAdvanceData} = useModalData();
  const [error, setError] = React.useState<undefined | { code: UIERROR_CODE, message: string }>(undefined);
  const onSubmitClick = React.useCallback((_data: T) => {
    if (!error && collectionAdvanceValue.name?.trim() && collectionAdvanceValue.tileUri?.trim() && LoopringAPI.userAPI) {
      setLoadingBtn();
      try {
        const response = LoopringAPI.userAPI.submitNFTCollection({
          ...collectionAdvanceValue,
          name: collectionAdvanceValue.name?.trim(),
          tileUri: collectionAdvanceValue.tileUri?.trim(),
          owner: account.accAddress
        }, chainId as any, account.apiKey, account.eddsaKey.sk);
        if (
          response &&
          ((response as sdk.RESULT_INFO).code ||
            (response as sdk.RESULT_INFO).message)
        ) {
          if ((response as sdk.RESULT_INFO).code === 102127) {
            // @ts-ignore
            throw new Error(t(SDK_ERROR_MAP_TO_UI[ response.code ]?.message, {ns: "error"}));
          } else {
            throw new Error((response as sdk.RESULT_INFO).message)

          }

        } else {
          setCollectionToastOpen({
            open: true,
            type: "success",
            content: t("labelCreateCollectionSuccess"),
          });
        }
      } catch (error) {

        setCollectionToastOpen({
          open: true,
          type: "error",
          content: t("labelCreateCollectionFailed") + `: ${(error as any)?.message ? (error as any).message : t('errorUnknown')}`
        });
      }

      setShowCollectionAdvance({isShow: false})
    }
    // resetBtnInfo();
    // disableBtn();
    setError(undefined)
    setMetaData('');
    updateCollectionAdvanceData({})

  }, [collectionAdvanceValue, disableBtn, resetBtnInfo]);

  const updateBtnStatus = React.useCallback(
    () => {
      resetBtnInfo();
      if (
        !error && collectionAdvanceValue?.name
      ) {
        enableBtn();
        return;
      }
      if (collectionAdvanceValue === undefined || Object.keys(collectionAdvanceValue).length === 0) {
        setLabelAndParams("labelEnterMeta", {});
      } else if (error) {
        setLabelAndParams(SDK_ERROR_MAP_TO_UI[ error?.code ?? 700001 ]?.messageKey, {});
      } else if (
        !collectionAdvanceValue?.name
      ) {
        setLabelAndParams(SDK_ERROR_MAP_TO_UI[ 700014 ].messageKey, {});
      }
      disableBtn();
      myLog("try to disable collectionAdvance btn!");
    },
    [
      error,
      resetBtnInfo,
      enableBtn,
      setLabelAndParams,
      collectionAdvanceValue,
      disableBtn,
    ]
  );

  React.useEffect(() => {
    updateBtnStatus();
  }, [
    collectionAdvanceValue, error
  ]);

  const collectionAdvanceProps: CollectionAdvanceProps<T> = {
    handleDataChange: (_data: string) => {
      setMetaData(_data);
      try {

        let _metaData: T = JSON.parse(_data.replaceAll(/\n|\s/ig, ''));
        // let _metaData:any;
        // debugger;
        // eval(`_metaData =_data`)
        if (!_metaData.tileUri) {
          setError({code: UIERROR_CODE.ERROR_COLLECTION_METADATA_NO_TILEURI, message: 'empty tileUri'});
          updateCollectionAdvanceData({})
          return;
        }
        if (!_metaData.name) {
          setError({code: UIERROR_CODE.ERROR_COLLECTION_NO_NAME, message: 'empty name'});
          updateCollectionAdvanceData({})
          return;
        }
        setError(undefined);
        updateCollectionAdvanceData(_metaData)
      } catch (_error) {
        setError({code: UIERROR_CODE.ERROR_JSON_STRINGIFY, message: (_error as any)?.message})
        return;
      }
    },
    onSubmitClick,
    allowTrade,
    disabled: false,
    btnStatus,
    btnInfo,
    metaData,
  } as CollectionAdvanceProps<T>

  return {
    collectionAdvanceProps,
  }  //as CollectionAdvanceProps<T>
}