import { useRouteMatch } from "react-router-dom";

import { Box, Typography } from "@mui/material";
import {
  AssetTitleMobile,
  SubMenu,
  SubMenuList,
  useSettings,
} from "@loopring-web/component-lib";
import { useTranslation } from "react-i18next";
import {
  AccountStatus,
  SoursURL,
  subMenuLayer2,
} from "@loopring-web/common-resources";

import AssetPanel from "./AssetPanel";
import HistoryPanel from "./HistoryPanel";
import OrderPanel from "./OrderPanel";
import MyLiqudityPanel from "./MyLiquidityPanel";
import React from "react";
import { useAccount, WalletConnectL2Btn } from "@loopring-web/core";
import { SecurityPanel } from "./SecurityPanel";
import { VipPanel } from "./VipPanel";
import { RewardPanel } from "./RewardPanel";
import { RedPockPanel } from "./RedPockPanel";
import { useGetAssets } from "./AssetPanel/hook";

export const subMenu = subMenuLayer2;

export const Layer2Page = () => {
  let match: any = useRouteMatch("/layer2/:item");
  const selected = match?.params.item ?? "assets";
  const { account } = useAccount();
  const { t } = useTranslation(["common", "layout"]);
  const { assetTitleProps, assetTitleMobileExtendProps } = useGetAssets();
  const layer2Router = React.useMemo(() => {
    switch (selected) {
      case "assets":
        return <AssetPanel />;
      case "my-liquidity":
        return <MyLiqudityPanel />;
      case "history":
        return <HistoryPanel />;
      case "order":
        return <OrderPanel />;
      case "redpock":
        return <RedPockPanel />;
      case "rewards":
        return <RewardPanel />;
      case "security":
        return <SecurityPanel />;
      case "vip":
        return <VipPanel />;
      default:
        <AssetPanel />;
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
              {isMobile && (
                <AssetTitleMobile
                  {...{ ...assetTitleProps, ...assetTitleMobileExtendProps }}
                />
              )}
              {layer2Router}
            </Box>
          </>
        );
      default:
        break;
    }
  }, [t, account.readyState, selected, assetTitleProps, isMobile]);

  return <>{viewTemplate}</>;
};
