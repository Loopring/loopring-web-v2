import { useRouteMatch } from "react-router-dom";

import { Box, Button, Divider, Typography } from "@mui/material";
import { SubMenu, SubMenuList, useSettings } from "@loopring-web/component-lib";
import { useTranslation } from "react-i18next";
import {
  AccountStatus,
  SoursURL,
  subMenuNFT,
} from "@loopring-web/common-resources";
import React from "react";
import { useAccount, WalletConnectL2Btn } from "@loopring-web/core";
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
  const viewTemplate = React.useMemo(() => {
    switch (account.readyState) {
      case AccountStatus.UN_CONNECT:
        return (
          <Box
            flex={1}
            display={"flex"}
            justifyContent={"center"}
            flexDirection={"column"}
            alignItems={"center"}
          >
            <Typography
              marginY={3}
              variant={isMobile ? "h4" : "h1"}
              textAlign={"center"}
            >
              {t("describeTitleConnectToWallet")}
            </Typography>
            <WalletConnectL2Btn />
          </Box>
        );
        break;
      case AccountStatus.LOCKED:
        return (
          <Box
            flex={1}
            display={"flex"}
            justifyContent={"center"}
            flexDirection={"column"}
            alignItems={"center"}
          >
            <Typography
              marginY={3}
              variant={isMobile ? "h4" : "h1"}
              textAlign={"center"}
            >
              {t("describeTitleLocked")}
            </Typography>
            <WalletConnectL2Btn />
          </Box>
        );
        break;
      case AccountStatus.NO_ACCOUNT:
        return (
          <Box
            flex={1}
            display={"flex"}
            justifyContent={"center"}
            flexDirection={"column"}
            alignItems={"center"}
          >
            <Typography
              marginY={3}
              variant={isMobile ? "h4" : "h1"}
              whiteSpace={"pre-line"}
              textAlign={"center"}
            >
              {t("describeTitleNoAccount")}
            </Typography>
            <WalletConnectL2Btn />
          </Box>
        );
        break;
      case AccountStatus.NOT_ACTIVE:
        return (
          <Box
            flex={1}
            display={"flex"}
            justifyContent={"center"}
            flexDirection={"column"}
            alignItems={"center"}
          >
            <Typography
              marginY={3}
              variant={isMobile ? "h4" : "h1"}
              textAlign={"center"}
            >
              {t("describeTitleNotActive")}
            </Typography>
            <WalletConnectL2Btn />
          </Box>
        );
        break;
      case AccountStatus.DEPOSITING:
        return (
          <Box
            flex={1}
            display={"flex"}
            justifyContent={"center"}
            flexDirection={"column"}
            alignItems={"center"}
          >
            <img
              className="loading-gif"
              alt={"loading"}
              width="60"
              src={`${SoursURL}images/loading-line.gif`}
            />
            {/*<LoadingIcon color={"primary"} style={{ width: 60, height: 60 }} />*/}
            <Typography
              marginY={3}
              variant={isMobile ? "h4" : "h1"}
              textAlign={"center"}
            >
              {t("describeTitleOpenAccounting")}
            </Typography>
            {/*<WalletConnectL2Btn/>*/}
          </Box>
        );
        break;
      case AccountStatus.ERROR_NETWORK:
        return (
          <Box
            flex={1}
            display={"flex"}
            justifyContent={"center"}
            flexDirection={"column"}
            alignItems={"center"}
          >
            <Typography
              marginY={3}
              variant={isMobile ? "h4" : "h1"}
              textAlign={"center"}
            >
              {t("describeTitleOnErrorNetwork", {
                connectName: account.connectName,
              })}
            </Typography>
            {/*<WalletConnectL2Btn/>*/}
          </Box>
        );
        break;

      case AccountStatus.ACTIVATED:
        return (
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
                  >
                    <Box marginY={1}>
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
                    <Box marginY={1}>
                      <Button
                        variant={"outlined"}
                        color={"primary"}
                        fullWidth
                        href={"/#/nft/depositNFT"}
                      >
                        {t("labelDepositNFT")}
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
        );
      default:
        break;
    }
  }, [t, account.readyState, selected, isMobile]);

  return <>{viewTemplate}</>;
};
