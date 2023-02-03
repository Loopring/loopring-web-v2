import { CollectionMeta } from "@loopring-web/common-resources";
import {
  NFTList,
  useOpenModals,
  useSettings,
  useToggle,
} from "@loopring-web/component-lib";
import {
  getIPFSString,
  useAccount,
  useModalData,
  useSystem,
} from "@loopring-web/core";
import React from "react";
import { useMyNFT } from "./useMyNFT";
import { WithTranslation, withTranslation } from "react-i18next";
import * as sdk from "@loopring-web/loopring-sdk";
import { Tab, Tabs, Typography } from "@mui/material";
import { useHistory, useLocation, useRouteMatch } from "react-router";

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
    const {
      // setShowNFTDetail,
      // setShowAccount,
      setShowNFTDeploy,
      setShowNFTDetail,
      setShowNFTTransfer,
      setShowNFTWithdraw,
      setShowTradeIsFrozen,
      setShowRedPacket,
      setShowAccount,
      setNFTMetaNotReady,
      // modals: { isShowNFTDetail },
    } = useOpenModals();
    const {
      updateNFTDeployData,
      updateNFTTransferData,
      updateNFTWithdrawData,
    } = useModalData();
    const { account } = useAccount();
    const { toggle } = useToggle();

    const match = useRouteMatch("/NFT/assetsNFT/:mainTab?");
    const isByCollection = match?.params["mainTab"] === "byCollection";
    const tabParams = isByCollection
      ? useRouteMatch("/NFT/assetsNFT/byCollection/:contract?/:tab?")?.params[
          "tab"
        ]
      : useRouteMatch("/NFT/assetsNFT/byList/:tab?")?.params["tab"];
    const contractParam = isByCollection
      ? useRouteMatch("/NFT/assetsNFT/byCollection/:contract?/:tab?")?.params[
          "contract"
        ]
      : undefined;
    const tab: sdk.NFT_PREFERENCE_TYPE | "all" =
      tabParams === sdk.NFT_PREFERENCE_TYPE.fav
        ? sdk.NFT_PREFERENCE_TYPE.fav
        : tabParams === sdk.NFT_PREFERENCE_TYPE.hide
        ? sdk.NFT_PREFERENCE_TYPE.hide
        : "all";
    const nftProps = useMyNFT({ collectionMeta, collectionPage, myNFTPage });
    const history = useHistory();
    const location = useLocation();
    const onPageChangeCallback = React.useCallback(
      (page: string) => {
        const params = new URLSearchParams(location.search);
        isByCollection
          ? params.set("collectionPage", page)
          : params.set("myNFTPage", page);
        history.replace({
          ...location,
          search: params.toString(),
        });
      },
      [isByCollection, location]
    );

    const handleTabChange = React.useCallback(
      (_e, value) => {
        if (tab === value) return;
        if (isByCollection) {
          history.replace({
            ...location,
            pathname:
              value === "all"
                ? `/NFT/assetsNFT/byCollection/${contractParam}`
                : `/NFT/assetsNFT/byCollection/${contractParam}/${value}`,
            search: "",
          });
        } else {
          history.replace({
            ...location,
            pathname:
              value === "all"
                ? `/NFT/assetsNFT/byList`
                : `/NFT/assetsNFT/byList/${value}`,
            search: "",
          });
        }
      },
      [tab, history, location, match, contractParam, isByCollection]
    );
    // @ts-ignore
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
          account={account}
          isEdit={false}
          toggle={toggle}
          // @ts-ignore
          setShowNFTDeploy={(item: any) => {
            updateNFTDeployData({ ...item });
            setShowNFTDeploy({ isShow: true, info: { ...{ item } } });
            setShowAccount({ isShow: false });
          }}
          setShowNFTDetail={(item: any) => {
            // updateNFTDetail({...item})
            setShowNFTDetail({ isShow: true, info: { ...{ item } } });
            setShowAccount({ isShow: false });
          }}
          setShowNFTTransfer={(item: any) => {
            updateNFTTransferData({ ...item });
            setShowNFTTransfer({ isShow: false, info: { ...{ item } } });
            setShowAccount({ isShow: false });
          }}
          setShowNFTWithdraw={(item: any) => {
            updateNFTWithdrawData({ ...item });
            setShowNFTWithdraw({ isShow: false, info: { ...{ item } } });
            setShowAccount({ isShow: false });
          }}
          setShowTradeIsFrozen={setShowTradeIsFrozen}
          setShowRedPacket={(item: any) => {
            setShowRedPacket({ isShow: true, info: { ...item } });
            setShowAccount({ isShow: false });
          }}
          setShowAccount={setShowAccount}
          setNFTMetaNotReady={setNFTMetaNotReady}
          onPageChangeCallback={onPageChangeCallback}
          isManage={false}
          size={size ?? isMobile ? "small" : "large"}
        />
      </>
    );
  }
);
