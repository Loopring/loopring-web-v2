import { CollectionMeta } from "@loopring-web/common-resources";
import { NFTList, useSettings } from "@loopring-web/component-lib";
import { getIPFSString, useSystem } from "@loopring-web/core";
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
    const { isMobile } = useSettings();
    return (
      <NFTList
        {...{ ...nftProps, baseURL, onClick: nftProps.onDetail, getIPFSString }}
        size={isMobile ? "small" : "large"}
      />
    );
  }
);
