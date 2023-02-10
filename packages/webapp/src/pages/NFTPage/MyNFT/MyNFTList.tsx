import {
  AccountStatus,
  CollectionMeta,
  globalSetup,
  SagaStatus,
} from "@loopring-web/common-resources";
import { NFTList, useSettings } from "@loopring-web/component-lib";
import { getIPFSString, useAccount, useSystem } from "@loopring-web/core";
import React from "react";
import { useMyNFT } from "./useMyNFT";
import { WithTranslation, withTranslation } from "react-i18next";
import * as sdk from "@loopring-web/loopring-sdk";
import { Tab, Tabs, Typography } from "@mui/material";
import { useLocation } from "react-router";

export const MyNFTList = withTranslation("common")(
  ({
    collectionMeta,
    collectionPage,
    myNFTPage,
    size,
    t,
  }: {
    collectionMeta: CollectionMeta | undefined;
    collectionPage?: number;
    myNFTPage?: number;
    size?: string;
  } & WithTranslation) => {
    const { baseURL } = useSystem();
    const { isMobile } = useSettings();
    const { status: accountStatus, account } = useAccount();
    const { search } = useLocation();
    const searchParam = new URLSearchParams(search);
    const [tab, setTab] =
      React.useState<sdk.NFT_PREFERENCE_TYPE | "all">("all");

    const nftProps = useMyNFT({
      collectionMeta,
      collectionPage,
      myNFTPage,
    });
    const onPageChange = React.useCallback(
      (page, filter) => {
        nftProps.onPageChange(page, { ...filter });
      },
      [nftProps?.onPageChange]
    );
    const handleTabChange = React.useCallback(
      (_e, value, page = 1) => {
        let _filter = {};
        setTab(value);
        switch (value) {
          case "all":
            _filter = { favourite: false, hidden: false };
            break;
          case sdk.NFT_PREFERENCE_TYPE.fav:
            _filter = { favourite: true };
            break;
          case sdk.NFT_PREFERENCE_TYPE.hide:
            _filter = { favourite: false, hidden: true };
            break;
        }
        onPageChange(page, _filter);
      },
      [tab, onPageChange]
    );

    React.useEffect(() => {
      if (
        accountStatus === SagaStatus.UNSET &&
        account.readyState === AccountStatus.ACTIVATED &&
        nftProps?.collectionMeta?.contractAddress ===
          collectionMeta?.contractAddress
      ) {
        const page = myNFTPage;
        // const page = searchParam.get("myNFTPage");
        const filter = JSON.parse(
          searchParam.get("filter") ??
            JSON.stringify({
              favourite: false,
              hidden: false,
            })
        );
        let tab = filter?.favourite
          ? sdk.NFT_PREFERENCE_TYPE.fav
          : filter?.hidden
          ? sdk.NFT_PREFERENCE_TYPE.hide
          : "all";

        handleTabChange(undefined, tab, page ?? 1);
      }
    }, [
      nftProps?.collectionMeta?.contractAddress,
      accountStatus,
      myNFTPage,
      account.readyState,
    ]);

    return (
      <>
        <Tabs value={tab} onChange={handleTabChange} aria-label="NFT Group Tab">
          {[
            "all",
            sdk.NFT_PREFERENCE_TYPE.fav,
            sdk.NFT_PREFERENCE_TYPE.hide,
          ].map((item) => {
            return (
              <Tab
                disabled={nftProps?.isLoading}
                key={item.toString()}
                value={item.toString()}
                label={
                  <Typography
                    component={"span"}
                    display={"inline-flex"}
                    alignItems={"center"}
                  >
                    {t(`labelNFTList${item}`)}
                  </Typography>
                  // </Tooltip>
                }
              />
            );
          })}
        </Tabs>
        <NFTList
          {...{
            ...nftProps,
            baseURL,
            onClick: nftProps.onDetail,
            getIPFSString,
          }}
          onPageChange={(page) => {
            const filter = JSON.parse(
              searchParam.get("filter") ??
                JSON.stringify({
                  favourite: false,
                  hidden: false,
                })
            );
            onPageChange(page, filter);
          }}
          isManage={false}
          size={size ?? isMobile ? "small" : "large"}
        />
      </>
    );
  }
);
