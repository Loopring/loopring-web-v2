import { useTranslation } from "react-i18next";
import React from "react";
import { Box, Typography, Tab, Tabs } from "@mui/material";

import { useSettings } from "../../../stores";
import { CollectionMeta, NFTWholeINFO } from "@loopring-web/common-resources";
import { NFTList, Button } from "../../basic-lib";
import { CollectionManageProps, CollectionMethod } from "./Interface";
import styled from "@emotion/styled";
import * as sdk from "@loopring-web/loopring-sdk";

const BoxStyle = styled(Box)`
  .nft-list-wrap {
    padding: 0 0;
  }
`;
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
  getIPFSString,
  onNFTSelectedMethod,
}: CollectionManageProps<Co, NFT>) => {
  const { t } = useTranslation(["common"]);
  const { isMobile } = useSettings();
  const [tab, setTab] = React.useState<sdk.LegacyNFT | "all">(
    sdk.LegacyNFT.undecided
  );

  const handleTabChange = React.useCallback(
    (_e, value) => {
      let _filter = { ...filter };
      setTab(value);
      switch (value) {
        case "all":
          if (tab === "all") {
            return;
          }
          _filter = { ...filter, legacyFilter: "all", page: 1 };
          break;
        case sdk.LegacyNFT.undecided:
          if (tab === sdk.LegacyNFT.undecided) {
            return;
          }
          _filter = {
            ...filter,
            legacyFilter: sdk.LegacyNFT.undecided,
            page: 1,
          };
          break;
        case sdk.LegacyNFT.outside:
          if (tab === sdk.LegacyNFT.outside) {
            return;
          }
          _filter = { ...filter, legacyFilter: sdk.LegacyNFT.outside, page: 1 };
          break;
        case sdk.LegacyNFT.inside:
          if (tab === sdk.LegacyNFT.inside) {
            return;
          }
          _filter = { ...filter, legacyFilter: sdk.LegacyNFT.inside, page: 1 };
          break;
      }
      onFilterNFT({ ..._filter });
    },
    [filter, onFilterNFT]
  );
  const Btn = React.useMemo(() => {
    switch (tab) {
      case sdk.LegacyNFT.undecided:
        return (
          <Button
            onClick={() => {
              onNFTSelectedMethod(selectedNFTS, CollectionMethod.moveIn);
            }}
            variant={"contained"}
            size={"small"}
            sx={{ marginLeft: 1, height: 24, fontSize: "1.2rem" }}
          >
            {t("labelMoveIn", { symbol: t("labelImportCollectionMove") })}
          </Button>
        );
      case sdk.LegacyNFT.outside:
        return (
          <Button
            onClick={() => {
              onNFTSelectedMethod(selectedNFTS, CollectionMethod.moveOut);
            }}
            variant={"contained"}
            size={"small"}
            sx={{ marginLeft: 1, height: 24, fontSize: "1.2rem" }}
          >
            {t("labelMoveIn", { symbol: t("labelImportCollectionMove") })}
          </Button>
        );
      case sdk.LegacyNFT.inside:
        return (
          <Button
            onClick={() => {
              onNFTSelectedMethod(selectedNFTS, CollectionMethod.moveOut);
            }}
            variant={"contained"}
            size={"small"}
            sx={{ marginLeft: 1, height: 24, fontSize: "1.2rem" }}
          >
            {t("labelMoveIn", { symbol: t("labelImportCollectionUndecided") })}
          </Button>
        );
      case "all":
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
      alignItems={"stretch"}
      width={"100%"}
    >
      {isMobile ? (
        <Typography>
          Sorry Mobile web is not support this feature, Please try it on website
        </Typography>
      ) : (
        <Box
          display={"flex"}
          flex={1}
          flexDirection={"column"}
          alignItems={"stretch"}
        >
          <Tabs
            value={tab}
            onChange={handleTabChange}
            aria-label="disabled tabs example"
            sx={{ marginLeft: -2 }}
          >
            {[...Object.keys(sdk.LegacyNFT), "all"].map((item) => {
              return (
                <Tab
                  key={item.toString()}
                  value={item.toString()}
                  label={t(`labelImportCollection${item}`)}
                />
              );
            })}
          </Tabs>
          <Box
            display={"flex"}
            flexDirection={"row"}
            justifyContent={"space-between"}
            marginTop={1}
            alignItems={"center"}
          >
            <Typography variant={"body1"}>{collection.name}</Typography>
            {tab !== "all" && (
              <Box
                display={"flex"}
                flexDirection={"row"}
                justifyContent={"flex-end"}
              >
                <Button
                  variant={"outlined"}
                  size={"small"}
                  sx={{ marginLeft: 1 }}
                  onClick={() => {
                    onNFTSelected("addAll");
                  }}
                >
                  {t("labelSelectAll")}
                </Button>
                {Btn}
                <Button
                  variant={"outlined"}
                  size={"small"}
                  sx={{ marginLeft: 1 }}
                  onClick={() => {
                    onNFTSelected("removeAll");
                  }}
                >
                  {t("labelCancelAll")}
                </Button>
              </Box>
            )}
          </Box>
          <BoxStyle flex={1}>
            <NFTList
              onPageChange={(page: number) => {
                onFilterNFT({ ...filter, page });
              }}
              isSelectOnly={true}
              isMultipleSelect={true}
              getIPFSString={getIPFSString}
              baseURL={baseURL}
              nftList={listNFT}
              isLoading={isLoading}
              total={total}
              page={page}
              size={"small"}
              selected={selectedNFTS}
              onClick={async (_item) => {
                onNFTSelected(_item as NFT);
              }}
            />
          </BoxStyle>
        </Box>
      )}
    </Box>
  );
  // Undecided  12
  // Others 100
  // Current Collection 100
  // All 1000
  // Search
};
