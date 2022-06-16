import { useRouteMatch } from "react-router-dom";

import { Box, Button, Divider, Typography } from "@mui/material";
import {
  SubMenu,
  SubMenuList,
  useOpenModals,
  useSettings,
} from "@loopring-web/component-lib";
import { useTranslation } from "react-i18next";
import {
  AccountStatus,
  SoursURL,
  subMenuNFT,
} from "@loopring-web/common-resources";
import React from "react";
import {
  useAccount,
  ViewAccountTemplate,
  WalletConnectL2Btn,
} from "@loopring-web/core";
import { MyNFTPanel } from "./MyNFT";
import { MyNFTHistory } from "./NFThistory";
import { MintNFTPanel } from "./MintNFTPanel";
import { DepositNFTPanel } from "./NFTDeposit";
import { mintService } from "@loopring-web/core";
import { TitleNFTMobile } from "./components/titleNFTMobile";

export const subMenu = subMenuNFT;

export const NFTPage = () => {
  let match: any = useRouteMatch("/NFT/:item");
  const selected = match?.params.item ?? "assetsNFT";
  const { account } = useAccount();
  const { setShowNFTMintAdvance } = useOpenModals();
  const { t } = useTranslation(["common", "layout"]);
  const routerNFT = React.useMemo(() => {
    switch (selected) {
      case "transactionNFT":
        return <MyNFTHistory />;
      case "mintNFT":
        mintService.emptyData();
        return <MintNFTPanel />;
      case "depositNFT":
        return <DepositNFTPanel />;
      case "assetsNFT":
      default:
        return <MyNFTPanel />;
    }
  }, [selected]);
  const { isMobile } = useSettings();
  // myLog("assetTitleProps", assetTitleProps.assetInfo);
  const activeViewTemplate = React.useMemo(
    () => (
      <>
        {!isMobile && (
          <Box
            width={"200px"}
            display={"flex"}
            justifyContent={"stretch"}
            marginRight={3}
            marginBottom={2}
            className={"MuiPaper-elevation2"}
          >
            <SubMenu>
              <SubMenuList selected={selected} subMenu={subMenu as any} />
              <Box marginX={3}>
                <Divider />
              </Box>
              <Box
                marginTop={1}
                display={"flex"}
                flexDirection={"column"}
                alignItems={"center"}
                marginX={3}
              >
                <Box marginY={1} width={"100%"}>
                  <Button
                    variant={"contained"}
                    color={"primary"}
                    fullWidth
                    size={"small"}
                    href={"/#/nft/mintNFT"}
                  >
                    {t("labelMintNFT")}
                  </Button>
                </Box>
                <Box marginY={1} width={"100%"}>
                  <Button
                    onClick={() => {
                      setShowNFTMintAdvance({ isShow: true });
                    }}
                    variant={"outlined"}
                    color={"primary"}
                    fullWidth
                  >
                    {t("labelAdvanceMint")}
                  </Button>
                </Box>
                <Box marginY={1} width={"100%"}>
                  <Button
                    variant={"outlined"}
                    color={"primary"}
                    fullWidth
                    href={"/#/nft/depositNFT"}
                  >
                    {t("labelL1toL2NFT")}
                  </Button>
                </Box>
              </Box>
            </SubMenu>
          </Box>
        )}

        <Box
          // minHeight={420}
          display={"flex"}
          alignItems={"stretch"}
          flexDirection={"column"}
          marginTop={0}
          flex={1}
        >
          {!!isMobile && <TitleNFTMobile />}
          {routerNFT}
        </Box>
      </>
    ),
    [isMobile, selected, t, routerNFT, setShowNFTMintAdvance]
  );

  return <ViewAccountTemplate activeViewTemplate={activeViewTemplate} />;
};
