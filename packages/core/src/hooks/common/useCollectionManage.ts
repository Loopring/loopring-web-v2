import { BigNumber } from "bignumber.js";
import React from "react";
import { CollectionMeta, NFTWholeINFO } from "@loopring-web/common-resources";
import { getIPFSString, LoopringAPI, useAccount, useSystem } from "../../index";
import {
  CollectionManageProps,
  CollectionMethod,
} from "@loopring-web/component-lib";
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
  const { chainId } = useSystem();
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
    async (props: {
      legacyFilter?: sdk.LegacyNFT | "all";
      limit?: number;
      page?: number;
    }) => {
      if (collection && LoopringAPI.userAPI) {
        onNFTSelected("removeAll");
        setFilter(props);
        const {
          legacyFilter = sdk.LegacyNFT.undecided,
          limit = pageSize,
          page: _page = 1,
        } = props;
        const response = await LoopringAPI.userAPI.getUserNFTLegacyBalance(
          {
            accountId: account.accountId,
            tokenAddress: collection.contractAddress,
            // @ts-ignore
            collectionId: legacyFilter !== "all" ? collection?.id : undefined,
            filter: legacyFilter !== "all" ? legacyFilter : undefined,
            offset: (_page - 1) * limit,
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
            page: _page,
          });
        }
        setIsLoading(false);
      }
    },
    [collection]
  );
  const { baseURL } = useSystem();
  const onNFTSelected = React.useCallback(
    (_item: NFT | "addAll" | "removeAll") => {
      if (_item === "addAll") {
        setSelectedNFTS(listNFT);
      } else if (_item === "removeAll") {
        setSelectedNFTS([]);
      } else {
        setSelectedNFTS((state) => {
          let has = false;
          const previewList = (state ?? []).reduce((prev, item) => {
            if (_item.nftData === item.nftData) {
              has = true;
              return prev;
            } else {
              return [...prev, item];
            }
          }, [] as NFT[]);
          return has ? previewList : [_item, ...selectedNFTS];
        });
      }
    },
    [selectedNFTS, listNFT]
  );
  const onNFTSelectedMethod = React.useCallback(
    async (items: NFT[], method: CollectionMethod) => {
      switch (method) {
        case CollectionMethod.moveIn:
          setIsLoading(true);
          const hashList: string[] = items.reduce((prev, item) => {
            return [...prev, item.nftData ?? ""];
          }, [] as string[]);
          if (hashList?.length && collection?.id) {
            await LoopringAPI.userAPI?.submitUpdateNFTLegacyCollection(
              {
                accountId: account.accountId,
                nftHashes: hashList,
                collectionId: Number(collection.id),
              },
              chainId as any,
              account.apiKey,
              account.eddsaKey.sk
            );
          }

          break;
        case CollectionMethod.moveOut:
          //TODO
          break;
      }
      // setIsLoading(false)
      onFilterNFT(filter);
    },
    []
  );
  React.useEffect(() => {
    if (collection?.id && account.accountId) {
      setIsLoading(true);
      onNFTSelected("removeAll");
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
