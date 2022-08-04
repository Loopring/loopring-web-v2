import { AddResult } from 'ipfs-core-types/types/src/root';
import { useIPFS } from '../ipfs';
import { collectionService, ContractCommands } from './collectionService';
import React from 'react';
import { CreateCollectionStep } from '@loopring-web/common-resources';
import CID from 'cids';

export function useCollectionContract({setStep}: { setStep: (step: CreateCollectionStep) => void }) {
  const [collectionInfo, setCollectionInfo] = React.useState<{
    uniqueId: string,
    cid?: CID, name: string,
  }>({
    uniqueId: "",
    name: "",
  });
  const subject = React.useMemo(() => collectionService.onSocket(), []);
  // const {updateCollectionAdvanceData} = useModalData();
  const handleSuccessUpload = React.useCallback((data: AddResult & { uniqueId: string }) => {
    // @ts-ignore
    setCollectionInfo((state) => {
      if (state.uniqueId == data.uniqueId) {
        collectionService.generateCollectionTokenAddress({cid: data.cid as any});
        return {...state, cid: data.cid}
      }
      return state;
    })
  }, [])
  const commonSwitch = React.useCallback(
    async ({data, status}: { status: ContractCommands, data?: any }) => {
      switch (status) {
        case ContractCommands.CreateTokenAddressFailed:
          //TODO：
          break;
        case ContractCommands.CreateMetaData:
          // const {tokenAddress} = data;
          // updateCollectionAdvanceDatanceData({tokenAddress})
          setStep(CreateCollectionStep.ChooseMethod)
          break;
      }
    },
    []
  );
  //
  const handleFailedUpload = (data: AddResult & { uniqueId: string }) => {
    // if (uniqueId == data.uniqueId) {
    //   //TODO：
    //   setStep(CreateCollectionStep.ChooseMethod)
    // }
    // @ts-ignore
    setCollectionInfo((state) => {
      if (state.uniqueId == data.uniqueId) {
        // collectionService.generateCollectionTokenAddress({cid: data.cid as any})
        // setStep(CreateCollectionStep.ChooseMethod)
        return {uniqueId: ""}
      }
      return state;
    })
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
  React.useEffect(() => {
    // checkFeeIsEnough();

    const subscription = subject.subscribe((props) => {
      commonSwitch(props);
    });
    return () => {
      // subjectIpfs.unsubscribe();
      subscription.unsubscribe();
    };
  }, [commonSwitch, subject]);
//
  return {
    // createContract,
  };
}
