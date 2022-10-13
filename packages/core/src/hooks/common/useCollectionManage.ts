import { BigNumber } from "bignumber.js";
import React from "react";
import {
  CollectionMeta,
  NFTWholeINFO,
} from "@loopring-web/common-resources";
import {
  useSystem,
} from "../../index";
import {
  CollectionManageProps,
} from "@loopring-web/component-lib";

BigNumber.config({ EXPONENTIAL_AT: 100 });

export const useCollectionManage = <
  Co extends CollectionMeta,
  NFT extends Partial<NFTWholeINFO>
>({collection}:{collection?:CollectionMeta|undefined}): CollectionManageProps<Co, NFT> => {
  const [filter,setFilter]= React.useState({});
  const [selectedNFTS,setSelectedNFTS] = React.useState(NFT[]);
  const [{listNFT, total, page},setListNFTValue] = React.useState<{
    listNFT:NFT[],
    total:number,
    page:number
  }>({
    listNFT:[],
    total:0,
    page:1
  });
  const [isLoading,setIsLoading] = React.useState(false);
  const onFilterNFT = React.useCallback((filter: { [key: string]: any })=>{

  },[])
  const {baseURL} = useSystem();
  const onNFTSelected = React.useCallback((item: NFT[])=>{

  },[])
  const onNFTSelectedMethod = React.useCallback((item: NFT[], method: string)=>{

  },[])
  React.useEffect(()=>{

  },[collection?.id])
  return {
    collection: (collection??{}) as Partial<Co>,
    selectedNFTS,
    onNFTSelected,
    total,
    page,
    listNFT,
    baseURL,
    onNFTSelectedMethod,
    onFilterNFT,
    isLoading,
    filter,
  };
};
