import {
  CollectionMeta, CollectionMetaKey, IPFS_LOOPRING_SITE,
} from "@loopring-web/common-resources";
import React from 'react';
import { AddResult } from 'ipfs-core-types/src/root';
import { useIPFS } from '../ipfs';
import { IpfsFile } from '@loopring-web/component-lib';
import { useModalData } from '../../stores';


export function useCollectionMeta<_T extends CollectionMeta>({keys, setKeys}: {
  keys: { [ key: string ]: undefined | IpfsFile },
  setKeys: React.Dispatch<React.SetStateAction<{ [ key: string ]: undefined | IpfsFile }>>
}) {
  const {collectionValue, updateCollectionData} = useModalData();
  // const [collectionInfo, setCollectionInfo] = React.useState<{
  //   uniqueId: string,
  //   cid?: CID, name: string,
  // }>({
  //   uniqueId: "",
  //   name: "",
  // });
  // const subject = React.useMemo(() => collectionService.onSocket(), []);
  // const {updateCollectionAdvanceData} = useModalData();
  const handleSuccessUpload = React.useCallback((data: AddResult & { uniqueId: string }) => {
    const key = Object.keys(keys).find((key: string) => {
      return new RegExp(data.uniqueId, 'ig').test(keys[ key ]?.uniqueId ?? '')
    })
    if (key !== undefined) {
      const item = keys[ key ];
      let extender = {
        [ key ]: {
          ...item,
          cid: data.cid,
          fullSrc: `${IPFS_LOOPRING_SITE}${data.path}`,
          isProcessing: false,
        }
      }
      let extenderValue = {
        [ key ]: `ipfs://${data.cid}`,
      }
      if (key === CollectionMetaKey.tileUri) {
        extender[ CollectionMetaKey.thumbnail ] = {
          ...item,
          cid: data.cid,
          fullSrc: `${IPFS_LOOPRING_SITE}${data.path}`,
          isProcessing: false,
        }
        extenderValue[ CollectionMetaKey.thumbnail ] = `ipfs://${data.cid}`;
      }
      // @ts-ignore
      setKeys((state) => {
        return {
          ...state,
          ...extender,
        }

      })
      updateCollectionData({
        ...collectionValue,
        ...extenderValue,
      })

    }
    // @ts-ignore
    // setCollectionInfo((state) => {
    //   if (state.uniqueId == data.uniqueId) {
    //     // collectionService.generateCollectionTokenAddress({cid: data.cid as any});
    //     return {...state, cid: data.cid}
    //   }
    //   return state;
    // })
  }, [collectionValue, keys, setKeys])
  // const commonSwitch = React.useCallback(
  //   async ({data, status}: { status: ContractCommands, data?: any }) => {
  //     switch (status) {
  //       case ContractCommands.CreateTokenAddressFailed:
  //         //TODO：
  //         break;
  //       case ContractCommands.CreateMetaData:
  //         // const {tokenAddress} = data;
  //         // updateCollectionAdvanceDatanceData({tokenAddress})
  //         setStep(CreateCollectionStep.ChooseMethod)
  //         break;
  //     }
  //   },
  //   []
  // );
  //
  const handleFailedUpload = (_data: AddResult & { uniqueId: string }) => {
    const key = Object.keys(keys).find((key: string) => {
      return new RegExp(_data.uniqueId, 'ig').test(keys[ key ]?.uniqueId ?? '')
    })
    if (key !== undefined) {
      const item = keys[ key ];
      // @ts-ignore
      setKeys((state) => {
        return {
          ...state,
          [ key ]: {
            ...item,
            error: {},
            // cid: _data.cid,
            // fullSrc: `${IPFS_LOOPRING_SITE}${_data.path}`,
            isProcessing: false,
          }
        }

      })
      updateCollectionData({
        ...collectionValue,
        [ key ]: `ipfs://${_data.cid}`,
      })

    }
  }
  const {ipfsProvides} = useIPFS({
    handleSuccessUpload,
    handleFailedUpload,
  });
//
//
//   const createContract = ({name}: { name: string }) => {
//     const uniqueId = Date.now() + name;
//     setCollectionInfo({uniqueId, name});
//     collectionService.updateIpfsGetTokenAddress(ipfsProvides, uniqueId);
//   }
//   React.useEffect(() => {
//     // checkFeeIsEnough();
//
//     // const subscription = subject.subscribe((props) => {
//     //   commonSwitch(props);
//     // });
//     return () => {
//       // subjectIpfs.unsubscribe();
//       subscription.unsubscribe();
//     };
//   }, [commonSwitch, subject]);
//
  return {
    ipfsProvides,
    // createContract,
  };
}
