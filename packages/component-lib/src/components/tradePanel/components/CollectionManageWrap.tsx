import { useTranslation } from "react-i18next";
import React from "react";
import { Box, Typography, Tab, Tabs } from "@mui/material";

import { useSettings } from "../../../stores";
import { CollectionMeta, NFTWholeINFO } from "@loopring-web/common-resources";
import { NFTList, Button } from "../../basic-lib";
import { CollectionManageProps } from "./Interface";

export enum TabNFTManage {
  Undecided = "Undecided",
  Others = "Others",
  Current = "Current",
  All = "All",
}
export const CollectionManageWrap = <
  Co extends CollectionMeta,
  NFT extends Partial<NFTWholeINFO>
>({
  onNFTSelected,
  onFilterNFT,
  collection,
  filter,
  baseURL,
  listNFT,
  total,
  page,
  isLoading,
  selectedNFTS = [],
  onNFTSelectedMethod,
}: CollectionManageProps<Co, NFT>) => {
  const { t } = useTranslation(["common"]);
  const { isMobile } = useSettings();
  const [tab, setTab] = React.useState<TabNFTManage>(TabNFTManage.Undecided);

  const handleTabChange = React.useCallback(
    (_e, value) => {
      let _filter = { ...filter };
      setTab(value);
      switch (value) {
        case TabNFTManage.Undecided:
          //filter.
          break;
        case TabNFTManage.All:
          break;
        case TabNFTManage.Others:
        case TabNFTManage.Current:
      }
      onFilterNFT({ ..._filter });
    },
    [filter, onFilterNFT]
  );
  const Btn = React.useMemo(() => {
    switch (tab) {
      case TabNFTManage.Undecided:
        return (
          <Button
            onClick={() => {
              onNFTSelectedMethod(selectedNFTS, "moveIn");
            }}
            variant={"contained"}
            size={"small"}
            sx={{ marginLeft: 1 }}
          >
            {t("labelMoveIn")}
          </Button>
        );
      case TabNFTManage.Others:
        return (
          <Button
            onClick={() => {
              onNFTSelectedMethod(selectedNFTS, "moveOut");
            }}
            variant={"contained"}
            size={"small"}
            sx={{ marginLeft: 1 }}
          >
            {t("labelMoveOut")}
          </Button>
        );
      case TabNFTManage.Current:
        return (
          <Button
            onClick={() => {
              onNFTSelectedMethod(selectedNFTS, "moveOut");
            }}
            variant={"contained"}
            size={"small"}
            sx={{ marginLeft: 1 }}
          >
            {t("labelMoveOut")}
          </Button>
        );
      case TabNFTManage.All:
        return <></>;
    }
  }, [onNFTSelectedMethod, selectedNFTS, t, tab]);
  // @ts-ignore
  return (
    <Box
      // className={walletMap ? "" : "loading"}
      display={"flex"}
      flex={1}
      flexDirection={"column"}
      padding={5 / 2}
      alignItems={"center"}
    >
      {isMobile ? (
        <Typography>
          Sorry Mobile web is not support this feature, Please try it on website
        </Typography>
      ) : (
        <Tabs
          value={tab}
          onChange={handleTabChange}
          aria-label="disabled tabs example"
        >
          {Object.keys(TabNFTManage).map((item) => {
            return (
              <Tab
                key={item.toString()}
                value={item.toString()}
                label={t(`labelImportCollection${item}`)}
              />
            );
          })}
          <Box display={"flex"} flex={1} flexDirection={"column"}>
            <Box
              display={"flex"}
              flexDirection={"row"}
              justifyContent={"space-between"}
            >
              <Typography variant={"body1"}>{collection.name}</Typography>
              <Box
                display={"flex"}
                flexDirection={"row"}
                justifyContent={"flex-end"}
              >
                <Button
                  variant={"outlined"}
                  size={"small"}
                  sx={{ marginLeft: 1 }}
                >
                  {t("labelSelectAll")}
                </Button>
                {Btn}
                <Button
                  variant={"outlined"}
                  size={"small"}
                  sx={{ marginLeft: 1 }}
                >
                  {t("labelSelectCancel")}
                </Button>
              </Box>
            </Box>
            <Box flex={1}>
              <NFTList
                onPageChange={(page: number) => {
                  onFilterNFT({ ...filter, page });
                }}
                baseURL={baseURL}
                nftList={listNFT}
                isLoading={isLoading}
                total={total}
                page={page}
                selected={selectedNFTS}
                onClick={async (_item) => {
                  // TODO:
                  // @ts-ignore
                  onNFTSelected();
                  return;
                }}
              />
            </Box>
          </Box>
        </Tabs>
      )}
    </Box>
  );
  // Undecided  12
  // Others 100
  // Current Collection 100
  // All 1000
  // Search
};
