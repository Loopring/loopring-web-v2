import { CollectionMeta, Info2Icon } from "@loopring-web/common-resources";
import { NFTList, useSettings } from "@loopring-web/component-lib";
import { getIPFSString, useSystem } from "@loopring-web/core";
import React from "react";
import { useMyNFT } from "./useMyNFT";
import { WithTranslation, withTranslation } from "react-i18next";
import * as sdk from "@loopring-web/loopring-sdk";
import { Box, Tab, Tabs, Tooltip, Typography } from "@mui/material";
import { useHistory, useLocation, useParams, useRouteMatch } from "react-router";
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
    const match = useRouteMatch("/NFT/assetsNFT/:mainTab?")
    // const tabParams = match?.params['mainTab'] === 'byCollection' 
    //   ? useRouteMatch("/NFT/assetsNFT/byCollection/:contract?/:tab?")?.params['tab']
    //   : useRouteMatch("/NFT/assetsNFT/byList/:tab?")?.params['tab']
    const isByCollection = match?.params['mainTab'] === 'byCollection'
    const tabParams = isByCollection
      ? useRouteMatch("/NFT/assetsNFT/byCollection/:contract?/:tab?")?.params['tab']
      : useRouteMatch("/NFT/assetsNFT/byList/:tab?")?.params['tab']
    const contractParam = isByCollection
      ? useRouteMatch("/NFT/assetsNFT/byCollection/:contract?/:tab?")?.params['contract']
      : undefined
    const tab: sdk.NFT_PREFERENCE_TYPE | 'all' = tabParams === sdk.NFT_PREFERENCE_TYPE.fav 
      ? sdk.NFT_PREFERENCE_TYPE.fav 
      : tabParams === sdk.NFT_PREFERENCE_TYPE.hide
        ? sdk.NFT_PREFERENCE_TYPE.hide
        : "all"
    // const tab 
    // const [tab, setTab] =
    //   React.useState<sdk.NFT_PREFERENCE_TYPE | "all">(initialTab);
    const nftProps = useMyNFT({ collectionMeta, collectionPage, myNFTPage });
    const history = useHistory();
    const location = useLocation();
    // location.pathname
    // history.replace(location,)
    // const a = useParams();
    // debugger

    const handleTabChange = React.useCallback(
      (_e, value) => {
        // setTab(value);
        // let _filter = {};
        // switch (value) {
        //   case "all":
        //     if (tab === "all") {
        //       return;
        //     }
        //     _filter = { hidden: false };
        //     break;
        //   case sdk.NFT_PREFERENCE_TYPE.fav:
        //     if (tab === sdk.NFT_PREFERENCE_TYPE.fav) {
        //       return;
        //     }
        //     _filter = { favourite: true, hidden: false };
        //     break;
        //   case sdk.NFT_PREFERENCE_TYPE.hide:
        //     if (tab === sdk.NFT_PREFERENCE_TYPE.hide) {
        //       return;
        //     }
        //     _filter = { hidden: true };
        //     break;
        // }
        // debugger
        if (isByCollection) {
          // const contract = useRouteMatch("/NFT/assetsNFT/byCollection/:contract?/:tab?")?.params['contract']
          // history.replace(value === 'all' 
          // ? `/NFT/assetsNFT/byCollection/${contractParam}`
          // : `/NFT/assetsNFT/byCollection/${contractParam}/${value}`)
          history.replace({
            ...location,
            pathname: value === 'all' 
              ? `/NFT/assetsNFT/byCollection/${contractParam}`
              : `/NFT/assetsNFT/byCollection/${contractParam}/${value}`
          })
          // const a = 1
          // debugger
        } else {
          // const contract = useRouteMatch("/NFT/assetsNFT/byCollection/:contract?/:tab?")?.params['contract']
          history.replace({
            ...location,
            pathname: value === 'all' 
              ? `/NFT/assetsNFT/byList`
              : `/NFT/assetsNFT/byList/${value}`
          })
        }
        // const tabParams = match?.params['mainTab'] === 'byCollection' 
        //   ? useRouteMatch("/NFT/assetsNFT/byCollection/:contract?/:tab?")?.params['tab']
        //   : useRouteMatch("/NFT/assetsNFT/byList/:tab?")?.params['tab']

        // nftProps.setFilter(_filter);
        // nftProps.onPageChange(1);
      },
      [tab, history, location, match, contractParam, isByCollection]
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
          // onPageChange={nftProps.onPageChange}
          isManage={false}
          size={size ?? isMobile ? "small" : "large"}
        />
      </>
    );
  }
);
