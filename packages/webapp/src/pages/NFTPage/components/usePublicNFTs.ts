import {
  CollectionMeta,
  CustomError,
  ErrorMap,
  GET_IPFS_STRING,
  IPFS_LOOPRING_SITE,
  LOOPRING_NFT_METADATA,
  LOOPRING_TAKE_NFT_META_KET,
  Media,
  myLog,
  NFTLimit,
  NFTWholeINFO,
  SagaStatus,
} from "@loopring-web/common-resources";
import React, { useState } from "react";
import {
  getIPFSString,
  LoopringAPI,
  store,
  useAccount,
} from "@loopring-web/core";
import { useSystem, useNFTListDeep } from "@loopring-web/core";
import { useModalData, useWalletLayer2NFT } from "@loopring-web/core";
import { CollectionMethod, useOpenModals } from "@loopring-web/component-lib";
import { BigNumber } from "bignumber.js";
import * as sdk from "@loopring-web/loopring-sdk";
import { useHistory, useLocation, useRouteMatch } from "react-router-dom";

BigNumber.config({ EXPONENTIAL_AT: 100 });
export type CollectionProps<Co, NFT> = {
  collection: Partial<Co>;
  total: number;
  page: number;
  filter: object;
  listNFT: NFT[];
  baseURL: string;
  getIPFSString: GET_IPFS_STRING;
  onDetail: () => void;
  onFilterNFT: (props: {
    legacyFilter?: sdk.LegacyNFT | "all";
    limit?: number;
    page?: number;
  }) => void;
  isLoading: boolean;
};
export const usePublicNFTs = <
  Co extends CollectionMeta,
  NFT extends Partial<NFTWholeINFO>
>({
  collection,
  page: _page,
  pageSize = NFTLimit,
}: {
  collection: Co;
  page?: number;
  pageSize?: number;
}) => {
  const { renderNFTPromise, infoDetail, nftListReduce } = useNFTListDeep();
  const [filter, setFilter] = React.useState({});
  const { page: page_redux, collection: collection_redux } =
    useWalletLayer2NFT();
  const [{ listNFT, total, page }, setListNFTValue] = React.useState<{
    listNFT: NFT[];
    total: number;
    page: number;
  }>({
    listNFT: [],
    total: 0,
    page: _page ?? 1,
  });
  const [isLoading, setIsLoading] = React.useState(false);
  const onFilterNFT = React.useCallback(
    async (props: {
      legacyFilter?: sdk.LegacyNFT | "all";
      limit?: number;
      page?: number;
    }) => {
      if (collection?.id && LoopringAPI.nftAPI) {
        setFilter(props);
        setIsLoading(true);
        const {
          legacyFilter = sdk.LegacyNFT.undecided,
          limit = pageSize,
          page: _page = 1,
        } = props;
        const response = await LoopringAPI.nftAPI.getCollectionWholeNFTs({
          id: collection.id as any,
          offset: (_page - 1) * limit,
          limit,
          metadata: true,
        });
        if (
          (response as sdk.RESULT_INFO).code ||
          (response as sdk.RESULT_INFO).message
        ) {
        } else {
          setListNFTValue({
            total: response.totalNum,
            page: _page,
            listNFT: nftListReduce(response.userNFTBalances),
          });
          setIsLoading(false);
          renderNFTPromise({ nftLists: response.userNFTBalances }).then(
            (meta: any[]) => {
              if (page === _page) {
                setListNFTValue((state) => {
                  return {
                    ...state,
                    listNFT: state.listNFT?.map((item, index) => {
                      return {
                        ...item,
                        ...meta[index],
                        tokenAddress: item.tokenAddress?.toLowerCase(),
                        // etherscanBaseUrl,
                      };
                    }),
                  };
                });
              }
            }
          );
        }
        setIsLoading(false);
      }
    },
    [collection]
  );
  const { baseURL } = useSystem();
  React.useEffect(() => {
    // if (Number(page) !== Number(page_redux)) {
    //
    // }
    onFilterNFT({ page: 1 });
  }, [collection?.id]);

  return {
    collection: (collection ?? {}) as Partial<Co>,
    total,
    page,
    filter,
    listNFT,
    baseURL,
    getIPFSString,
    onDetail: () => {},
    onFilterNFT,
    isLoading,
  };
};
