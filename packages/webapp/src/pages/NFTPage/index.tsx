import { useRouteMatch } from "react-router-dom";

import { Box } from "@mui/material";
import { Toast, useSettings } from "@loopring-web/component-lib";
import { subMenuNFT, TOAST_TIME } from "@loopring-web/common-resources";
import React from "react";
import {
  useMyCollection,
  useNFTMintAdvance,
  ViewAccountTemplate,
} from "@loopring-web/core";
import { MyNFTPanel } from "./MyNFT";
import { MyNFTHistory } from "./NFThistory";
import { MintNFTAdvancePanel, MintNFTPanel } from "./MintNFTPanel";
import { DepositNFTPanel } from "./NFTDeposit";
import { NFTCollectPanel } from "./CollectionPanel";
import { CreateCollectionPanel } from "./CreateCollectionPanel";
import { MintLandingPage } from "./components/landingPanel";
import { useTranslation } from "react-i18next";

export const subMenu = subMenuNFT;

export const NFTPage = () => {
  let match: any = useRouteMatch("/NFT/:item");
  const { t } = useTranslation(["common"]);
  const selected = match?.params?.item ?? "assetsNFT";

  const routerNFT = React.useMemo(() => {
    switch (selected) {
      case "transactionNFT":
        return <MyNFTHistory />;
      case "mintNFTLanding":
        return <MintLandingPage />;
      case "mintNFT":
        return <MintNFTPanel />;
      case "mintNFTAdvance":
        return <MintNFTAdvancePanel />;
      case "depositNFT":
        return <DepositNFTPanel />;
      case "myCollection":
        return <NFTCollectPanel />;
      case "addCollection":
        return <CreateCollectionPanel />;
      case "assetsNFT":
      default:
        return <MyNFTPanel />;
    }
  }, [selected]);

  const { isMobile } = useSettings();

  const activeViewTemplate = React.useMemo(
    () => (
      <>
        <Box
          // minHeight={420}
          display={"flex"}
          alignItems={"stretch"}
          flexDirection={"column"}
          marginTop={0}
          flex={1}
        >
          {routerNFT}
        </Box>
      </>
    ),
    [routerNFT]
  );

  return (
    <>
      <ViewAccountTemplate activeViewTemplate={activeViewTemplate} />
    </>
  );
};
// {!!isMobile && <TitleNFTMobile />}
