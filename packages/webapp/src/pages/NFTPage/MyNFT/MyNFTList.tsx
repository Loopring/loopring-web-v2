import { CollectionMeta } from "@loopring-web/common-resources";
import { NFTList } from "@loopring-web/component-lib";
import { useSystem } from "@loopring-web/core";
import React from "react";
import { useMyNFT } from "./useMyNFT";
import { WithTranslation, withTranslation } from "react-i18next";
export const MyNFTList = withTranslation("common")(
  ({
    collectionMeta,
    collectionPage,
    myNFTPage,

    t,
  }: {
    collectionMeta: CollectionMeta | undefined;
    collectionPage?: number;
    myNFTPage?: number;
  } & WithTranslation) => {
    const nftProps = useMyNFT({ collectionMeta, collectionPage, myNFTPage });
    const { baseURL } = useSystem();
    return (
      <NFTList {...{ ...nftProps, baseURL, onClick: nftProps.onDetail }} />
    );
  }
);
