import { BigNumber } from "bignumber.js";
import React from "react";
import { CollectionMeta, NFTWholeINFO } from "@loopring-web/common-resources";
import { getIPFSString, LoopringAPI, useAccount, useSystem } from "../../index";
import { CollectionManageProps } from "@loopring-web/component-lib";
import * as sdk from "@loopring-web/loopring-sdk";

BigNumber.config({ EXPONENTIAL_AT: 100 });

export const useCollectionManage = <
  Co extends CollectionMeta,
  NFT extends Partial<NFTWholeINFO>
>({
  collection,
  pageSize = 24,
}: {
  collection?: CollectionMeta | undefined;
  pageSize?: number;
}): CollectionManageProps<Co, NFT> => {
  const { account } = useAccount();
  const [filter, setFilter] = React.useState({});
  const [selectedNFTS, setSelectedNFTS] = React.useState<NFT[]>([]);
  const [{ listNFT, total, page }, setListNFTValue] = React.useState<{
    listNFT: NFT[];
    total: number;
    page: number;
  }>({
    listNFT: [],
    total: 0,
    page: 1,
  });
  const [isLoading, setIsLoading] = React.useState(false);
  const onFilterNFT = React.useCallback(
    async ({
      legacyFilter = sdk.LegacyNFT.undecided,
      limit = pageSize,
      page = 1,
    }: {
      legacyFilter?: sdk.LegacyNFT | "all";
      limit?: number;
      page?: number;
    }) => {
      if (collection && LoopringAPI.userAPI) {
        debugger;
        const response = await LoopringAPI.userAPI.getUserNFTLegacyBalance(
          {
            accountId: account.accountId,
            tokenAddress: collection.contractAddress,
            // @ts-ignore
            collectionId: legacyFilter !== "all" ? collection?.id : undefined,
            filter: legacyFilter !== "all" ? legacyFilter : undefined,
            offset: (page - 1) * limit,
            limit,
            metadata: true,
          },
          account.apiKey
        );
        if (
          (response as sdk.RESULT_INFO).code ||
          (response as sdk.RESULT_INFO).message
        ) {
        } else {
          setListNFTValue({
            listNFT: response.userNFTBalances as NFT[],
            total: response.totalNum,
            page,
          });
        }
        setIsLoading(false);
      }
    },
    [collection]
  );
  const { baseURL } = useSystem();
  const onNFTSelected = React.useCallback((item: NFT[]) => {
    debugger;
  }, []);
  const onNFTSelectedMethod = React.useCallback(
    (item: NFT[], method: string) => {},
    []
  );
  React.useEffect(() => {
    if (collection?.id && account.accountId) {
      setIsLoading(true);
      onFilterNFT({});
    }
  }, [collection?.id]);
  return {
    collection: (collection ?? {}) as Partial<Co>,
    selectedNFTS,
    onNFTSelected,
    total,
    page,
    listNFT,
    baseURL,
    getIPFSString,
    onNFTSelectedMethod,
    onFilterNFT,
    isLoading,
    filter,
  };
};
