import {
  ContractCommands,
  ipfsService,
  useIPFS, useModalData,
} from "../../index";
import { collectionService } from './collectionService';
import { AddResult } from 'ipfs-core-types/types/src/root';
import React from 'react';

export enum CreateCollectionStep {
  CreateTokenAddress,
  Loading,
  CreateTokenAddressFailed,
  ChooseMethod,

  AdvancePanel,
  CommonPanel,
}

export function useCollectionContract({setStep}: { setStep: (step: CreateCollectionStep) => void }) {
  const [uniqueId, setUniqueId] = React.useState('');
  const subject = React.useMemo(() => collectionService.onSocket(), []);
  const {updateCollectionAdvanceData} = useModalData();
  const handleSuccessUpload = (data: AddResult & { uniqueId: string }) => {
    if (uniqueId == data.uniqueId) {
      collectionService.generateCollectionTokenAddress({cid: data.cid as any})
    }
  }
  const commonSwitch = React.useCallback(
    async ({data, status}: { status: ContractCommands, data?: any }) => {
      switch (status) {
        case ContractCommands.CreateTokenAddressFailed:
          //TODO：
          break;
        case ContractCommands.CreateMetaData:
          const {tokenAddress} = data;
          updateCollectionAdvanceData({tokenAddress})
          setStep(CreateCollectionStep.ChooseMethod)
          // handleSuccessUpload(data)
          // handleTabChange(0);
          // setErrorOnMeta(data?.error);
          // if (data?.emptyData) {
          //   resetMETADAT();
          // }
          break;
      }
    },
    []
  );
  React.useEffect(() => {
    // checkFeeIsEnough();
    const subscription = subject.subscribe((props) => {
      commonSwitch(props);
    });
    return () => {
      subscription.unsubscribe();
    };
  }, [commonSwitch, subject]);
  const handleFailedUpload = (data: AddResult & { uniqueId: string }) => {
    if (uniqueId == data.uniqueId) {
      //TODO：
      setStep(CreateCollectionStep.ChooseMethod)
    }
  }
  const {ipfsProvides} = useIPFS({
    handleSuccessUpload,
    handleFailedUpload,
  });


  const createContract = ({name}: { name: string }) => {
    const uniqueId = Date.now() + name;
    setUniqueId(uniqueId);
    ipfsService.addJSON({
      ipfs: ipfsProvides.ipfs,
      json: JSON.stringify({name: name}),
      uniqueId, //:),
    });
  }


  return {
    createContract,
  };
}
