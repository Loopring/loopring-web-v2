import { useRouteMatch } from "react-router-dom";

import { Box } from "@mui/material";
import { useSettings } from "@loopring-web/component-lib";
import { subMenuNFT } from "@loopring-web/common-resources";
import React from "react";
import { useNFTMintAdvance, ViewAccountTemplate } from "@loopring-web/core";
import { MyNFTPanel } from "./MyNFT";
import { MyNFTHistory } from "./NFThistory";
import { MintLandingPage, MintNFTAdvancePanel, MintNFTPanel } from "./MintNFTPanel";
import { DepositNFTPanel } from "./NFTDeposit";
import { mintService } from "@loopring-web/core";
import { NFTCollectPanel } from "./CollectionPanel";
import { CreateCollectionPanel } from './CreateCollectionPanel';

export const subMenu = subMenuNFT;

export const NFTPage = () => {
  let match: any = useRouteMatch("/NFT/:item");
  const selected = match?.params.item ?? "assetsNFT";

  const routerNFT = React.useMemo(() => {
    switch (selected) {
      case "transactionNFT":
        return <MyNFTHistory/>;
      case "mintNFTLanding":
        return <MintLandingPage/>;
      case "mintNFT":
        mintService.emptyData();
        return <MintNFTPanel/>;
      case "mintAdvanceNFT":
        return <MintNFTAdvancePanel/>;
      case "depositNFT":
        return <DepositNFTPanel/>;
      case "myCollection":
        return <NFTCollectPanel/>;
      case "addCollection":
        return <CreateCollectionPanel/>;
      case "assetsNFT":
      default:
        return <MyNFTPanel/>;
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

  return <ViewAccountTemplate activeViewTemplate={activeViewTemplate} />;
};
// {!!isMobile && <TitleNFTMobile />}
