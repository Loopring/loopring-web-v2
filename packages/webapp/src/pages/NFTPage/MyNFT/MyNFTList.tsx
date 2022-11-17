import { CollectionMeta, Info2Icon } from "@loopring-web/common-resources";
import { NFTList, useSettings } from "@loopring-web/component-lib";
import { getIPFSString, useSystem } from "@loopring-web/core";
import React from "react";
import { useMyNFT } from "./useMyNFT";
import { WithTranslation, withTranslation } from "react-i18next";
import * as sdk from "@loopring-web/loopring-sdk";
import { Box, Tab, Tabs, Tooltip, Typography } from "@mui/material";
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
    const nftProps = useMyNFT({ collectionMeta, collectionPage, myNFTPage });
    const { baseURL } = useSystem();
    const { isMobile } = useSettings();
    const [tab, setTab] =
      React.useState<sdk.NFT_PREFERENCE_TYPE | "all">("all");

    const handleTabChange = React.useCallback(
      (_e, value) => {
        setTab(value);
        let _filter = {};
        switch (value) {
          case "all":
            if (tab === "all") {
              return;
            }
            _filter = { favourite: false, hidden: false };
            break;
          case sdk.NFT_PREFERENCE_TYPE.fav:
            if (tab === sdk.NFT_PREFERENCE_TYPE.fav) {
              return;
            }
            _filter = { favourite: true };
            break;
          case sdk.NFT_PREFERENCE_TYPE.hide:
            if (tab === sdk.NFT_PREFERENCE_TYPE.hide) {
              return;
            }
            _filter = { favourite: false, hidden: true };
            break;
        }
        nftProps.onPageChange(1, _filter);
      },
      [tab]
    );
    return (
      <>
        <Tabs
          value={tab}
          onChange={handleTabChange}
          aria-label="NFT Group Tab"
          // sx={{  }}
        >
          {[
            "all",
            sdk.NFT_PREFERENCE_TYPE.fav,
            sdk.NFT_PREFERENCE_TYPE.hide,
          ].map((item) => {
            return (
              <Tab
                key={item.toString()}
                value={item.toString()}
                label={
                  // <Tooltip
                  //   placement={"top"}
                  //   title={t(`labelImportCollection${item}Des`).toString()}
                  // >
                  <Typography
                    component={"span"}
                    display={"inline-flex"}
                    alignItems={"center"}
                  >
                    {/*<Info2Icon*/}
                    {/*  fontSize={"small"}*/}
                    {/*  htmlColor={"var(--color-text-secondary)"}*/}
                    {/*  sx={{ marginRight: 1 / 2 }}*/}
                    {/*/>*/}

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
          isManage={false}
          size={size ?? isMobile ? "small" : "large"}
        />
      </>
    );
  }
);
