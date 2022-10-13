import { BigNumber } from "bignumber.js";
import React from "react";
import {
  Account,
  CollectionMeta,
  NFTWholeINFO,
} from "@loopring-web/common-resources";
import {
  LoopringAPI,
  makeMeta,
  useAccount,
  useCollectionManage,
  useMyCollection,
} from "../../index";
import {
  ImportCollectionStep,
  ImportCollectionViewProps,
} from "@loopring-web/component-lib";

// const enum MINT_VIEW_STEP {
//   METADATA,
//   MINT_CONFIRM,
// }
BigNumber.config({ EXPONENTIAL_AT: 100 });

export const useCollectionImport = <
  Co extends CollectionMeta,
  NFT extends Partial<NFTWholeINFO>
>(): ImportCollectionViewProps<Co, NFT> => {
  const { account } = useAccount();
  const [step, setStep] = React.useState<ImportCollectionStep>(
    ImportCollectionStep.SELECTCONTRACT
  );
  const [onLoading, setOnLoading] = React.useState<boolean>(true);
  // const { baseURL } = useSystem();
  const [contractList, setContractList] = React.useState<string[]>([]);
  const [selectContract, setSelectContract] = React.useState<string>("");
  const [selectCollection, setSelectCollection] =
    React.useState<Co | undefined>(undefined);
  // collectionInputProps

  const collectionListProps = useMyCollection<Co>({
    contractAddress: selectContract,
    isLegacy: true,
  } as any);
  const {
    collection,
    selectedNFTS,
    onNFTSelected,
    baseURL,
    onNFTSelectedMethod,
    ...nftProps
  } = useCollectionManage<Co, NFT>({ collection: selectCollection });
  const onContractChange = React.useCallback(() => {}, []);
  const onContractNext = React.useCallback(() => {}, []);
  const onCollectionChange = React.useCallback(() => {}, []);
  const onCollectionNext = React.useCallback(() => {}, []);
  // const onNFTSelected = React.useCallback(() => {}, []);
  // const onNFTSelectedMethod = React.useCallback(() => {}, []);
  const onClick = React.useCallback(() => {}, []);
  return {
    account: account as Account,
    onContractChange,
    onContractNext,
    onCollectionChange,
    onCollectionNext,
    onNFTSelected,
    onNFTSelectedMethod,
    step,
    baseURL,
    setStep,
    disabled: false,
    onLoading,
    onClick,
    data: {
      contractList,
      selectContract,
      selectNFTList: selectedNFTS as NFT[],
      selectCollection,
      collectionInputProps: {
        collection: selectCollection,
        collectionListProps,
        domain: LoopringAPI.delegate?.getCollectionDomain(),
        makeMeta,
      } as any,
      nftProps: nftProps as any,
    },
  };
};
