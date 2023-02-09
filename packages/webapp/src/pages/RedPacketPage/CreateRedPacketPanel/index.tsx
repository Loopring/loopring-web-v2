import { Box, Button } from "@mui/material";
import { CreateRedPacketPanel, useToggle } from "@loopring-web/component-lib";

import React from "react";
import {
  getIPFSString,
  StylePaper,
  useCreateRedPacket,
  useSystem,
} from "@loopring-web/core";
import {
  BackIcon,
  FeeInfo,
  MY_NFT_VIEW,
  NFTWholeINFO,
  RedPacketOrderData,
} from "@loopring-web/common-resources";
import { useGetAssets } from "../../AssetPage/AssetPanel/hook";
import { useTranslation } from "react-i18next";
import { useHistory, useLocation, useRouteMatch } from "react-router-dom";
import { useNFTCollection } from "../../NFTPage/MyNFT/useMyNFT";
import * as sdk from "@loopring-web/loopring-sdk";
import { MyNFTPanelUI } from "../../NFTPage/MyNFT";

export const ChooseNFTPanel = React.memo(
  <NFT extends NFTWholeINFO>({
    selectNFT,
    onSelect,
  }: {
    selectNFT: NFT[];
    onSelect: (value: NFT[]) => void;
  }) => {
    const matchPreUrl = "/redPacket/create/";
    const preMatch = useRouteMatch(`/redPacket/create/:tab?/:contract?`);
    const { search } = useLocation();
    const searchParam = new URLSearchParams(search);
    const tabBy = preMatch?.params["tab"] ?? MY_NFT_VIEW.LIST_COLLECTION;
    const { toggle } = useToggle();
    const contractStr = preMatch?.params["contract"] ?? "";
    const filter = JSON.parse(
      searchParam.get("filter") ??
        JSON.stringify({
          favourite: false,
          hidden: false,
        })
    );
    const { collectionMeta } = useNFTCollection({ contractStr, matchPreUrl });

    return (
      <MyNFTPanelUI
        tabBy={tabBy}
        filter={
          filter?.favourite
            ? sdk.NFT_PREFERENCE_TYPE.fav
            : filter?.hidden
            ? sdk.NFT_PREFERENCE_TYPE.hide
            : "all"
        }
        collectionMeta={collectionMeta}
        isMultipleSelect={false}
        isSelect={true}
        size={"small"}
        selected={selectNFT ? selectNFT[0] : undefined}
        onSelect={onSelect && onSelect}
        contractStr={preMatch?.params["contract"] ?? ""}
        matchPreUrl={matchPreUrl}
        toggle={toggle}
      />
    );
  }
);
export const CreateRedPacketUIPanel = <
  T extends RedPacketOrderData<I>,
  I extends any,
  F extends FeeInfo
>() => {
  const { assetsRawData } = useGetAssets();
  let match: any = useRouteMatch("/redPacket/:item");
  const history = useHistory();
  const { baseURL } = useSystem();
  const { t } = useTranslation();
  const { createRedPacketProps } = useCreateRedPacket<T, I, F>({
    assetsRawData,
    isShow: match?.params?.item?.toLowerCase() === "create",
  });

  return (
    <Box display={"flex"} flex={1} flexDirection={"column"}>
      <Box
        display={"flex"}
        justifyContent={"space-between"}
        alignItems={"center"}
        marginBottom={2}
      >
        <Button
          startIcon={<BackIcon fontSize={"small"} />}
          variant={"text"}
          size={"medium"}
          sx={{ color: "var(--color-text-secondary)" }}
          color={"inherit"}
          onClick={() => history.push("/redPacket/markets")}
        >
          {t("labelCreateRedPacketTitle")}
        </Button>
      </Box>
      <StylePaper flex={1} display={"flex"} justifyContent={"center"}>
        <CreateRedPacketPanel
          {...{
            _height: "auto",
            ...createRedPacketProps,
            getIPFSString: getIPFSString,
            baseURL,
            myNFTPanel: (
              <ChooseNFTPanel
                onSelect={(value: any) => {
                  createRedPacketProps?.handleOnChoose &&
                    createRedPacketProps.handleOnChoose(value);
                }}
                selectNFT={[createRedPacketProps.selectNFT]}
              />
            ),
          }}
        />
      </StylePaper>
    </Box>
  );
};
