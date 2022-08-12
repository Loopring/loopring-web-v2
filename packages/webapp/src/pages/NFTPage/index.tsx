import { useRouteMatch } from "react-router-dom";

import { Box } from "@mui/material";
import { Toast, useSettings } from "@loopring-web/component-lib";
import { subMenuNFT } from "@loopring-web/common-resources";
import React from "react";
import { TOAST_TIME, useMyCollection, useNFTMintAdvance, ViewAccountTemplate } from "@loopring-web/core";
import { MyNFTPanel } from "./MyNFT";
import { MyNFTHistory } from "./NFThistory";
import { MintNFTAdvancePanel, MintNFTPanel } from "./MintNFTPanel";
import { DepositNFTPanel } from "./NFTDeposit";
import { mintService } from "@loopring-web/core";
import { NFTCollectPanel } from "./CollectionPanel";
import { CreateCollectionPanel } from './CreateCollectionPanel';
import { MintLandingPage } from './components/landingPanel';
import { useTranslation } from 'react-i18next';

export const subMenu = subMenuNFT;

export const NFTPage = () => {
  let match: any = useRouteMatch("/NFT/:item");
  const {t} = useTranslation(["common"]);
  const selected = match?.params.item ?? "assetsNFT";
  const {copyToastOpen, ...collectionListProps} = useMyCollection();
  const routerNFT = React.useMemo(() => {
    switch (selected) {
      case "transactionNFT":
        return <MyNFTHistory/>;
      case "mintNFTLanding":
        return <MintLandingPage/>;
      case "mintNFT":
        return <MintNFTPanel collectionListProps={collectionListProps}/>;
      case "mintAdvanceNFT":
        return <MintNFTAdvancePanel/>;
      case "depositNFT":
        return <DepositNFTPanel/>;
      case "myCollection":
        return <NFTCollectPanel collectionListProps={collectionListProps}/>;
      case "addCollection":
        return <CreateCollectionPanel/>;
      case "assetsNFT":
      default:
        return <MyNFTPanel/>;
    }
  }, [selected, collectionListProps]);

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

  return <>
    <ViewAccountTemplate activeViewTemplate={activeViewTemplate}/>
    <Toast
      alertText={t("labelCopyAddClip")}
      open={copyToastOpen}
      autoHideDuration={TOAST_TIME}
      onClose={() => {
        collectionListProps.setCopyToastOpen(false);
      }}
      severity={"success"}
    />
  </>;
};
// {!!isMobile && <TitleNFTMobile />}
