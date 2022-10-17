import { BigNumber } from "bignumber.js";
import React from "react";
import {
  Account,
  CollectionMeta,
  CustomError,
  ErrorMap,
  NFTWholeINFO,
} from "@loopring-web/common-resources";
import * as sdk from "@loopring-web/loopring-sdk";
import {
  LoopringAPI,
  makeMeta,
  useAccount,
  useCollectionManage,
  useMyCollection,
  useWalletL2Collection,
} from "../../index";
import {
  ImportCollectionStep,
  ImportCollectionViewProps,
} from "@loopring-web/component-lib";
import { useRouteMatch } from "react-router-dom";

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
  let match: any = useRouteMatch("/nft/importLegacyCollection/:id?");
  const stepList = match?.id?.split("--");
  const contract = stepList && stepList[0].startsWith("0x");
  const contractId = stepList && stepList[1];
  const [step, setStep] = React.useState<ImportCollectionStep>(() => {
    if (stepList && contract) {
      return ImportCollectionStep.SELECTCOLLECTION;
    } else if (stepList && contractId) {
      return ImportCollectionStep.SELECTNFT;
    } else {
      return ImportCollectionStep.SELECTCONTRACT;
    }
  });
  const { legacyContract } = useWalletL2Collection();

  const [onLoading, setOnLoading] = React.useState<boolean>(false);
  // const { baseURL } = useSystem();
  // const [contractList, setContractList] = React.useState<string[]>([""]);
  const [selectContract, setSelectContract] = React.useState<
    | { value: string; total?: number; list?: sdk.UserNFTBalanceInfo[] }
    | undefined
  >(() => {
    if (stepList && contract) {
      onContractChange(contract);
      return { value: contract };
    }
  });
  const [filter, setFilter] = React.useState<{
    isLegacy: boolean;
    tokenAddress: string;
  }>({
    isLegacy: true,
    tokenAddress: selectContract?.value ?? "",
  });
  const collectionListProps = useMyCollection<Co>(filter as any);
  const [selectCollection, setSelectCollection] =
    React.useState<Co | undefined>(undefined);
  const onContractChange = React.useCallback(
    async (item) => {
      setSelectContract({ value: item });
      setOnLoading(true);
      let _filter = { offset: 0 };
      if (LoopringAPI.userAPI) {
        //TODO: wait api
        const { userNFTBalances, totalNum } = await LoopringAPI.userAPI
          .getUserNFTBalances(
            {
              accountId: account.accountId,
              tokenAddrs: item,
              limit: 3,
              ..._filter,
              nonZero: true,
              metadata: true, // close metadata
            },
            account.apiKey
          )
          .catch((_error) => {
            throw new CustomError(ErrorMap.TIME_OUT);
          });
        setSelectContract((state) => ({
          ...state,
          value: item,
          list: userNFTBalances,
          total: totalNum,
        }));
      }
      setOnLoading(false);
    },
    [selectContract]
  );
  React.useEffect(() => {
    if (
      legacyContract?.length &&
      step === ImportCollectionStep.SELECTCONTRACT
    ) {
      onContractChange(legacyContract[0]);
    }
  }, [legacyContract, step]);

  const {
    collection,
    selectedNFTS,
    onNFTSelected,
    baseURL,
    onNFTSelectedMethod,
    ...nftProps
  } = useCollectionManage<Co, NFT>({ collection: selectCollection });
  const onCollectionChange = React.useCallback((item: Co | undefined) => {
    setSelectCollection(item);
  }, []);

  const onContractNext = React.useCallback(async (value: string) => {
    const _filter = {
      isLegacy: true,
      tokenAddress: value,
    };
    setFilter(_filter);
    collectionListProps.onPageChange(1, _filter);
    setOnLoading(collectionListProps.isLoading);
  }, []);

  const onCollectionNext = React.useCallback(() => {}, []);

  const onClick = React.useCallback(() => {}, []);

  // React.useEffect(() => {
  //   updateLegacyCollection();
  // }, []);

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
      contractList: legacyContract,
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
