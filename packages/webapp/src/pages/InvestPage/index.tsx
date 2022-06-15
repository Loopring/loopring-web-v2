import { useRouteMatch } from "react-router-dom";

import { Box, Tab, Tabs, Typography } from "@mui/material";

import { Trans, useTranslation, withTranslation } from "react-i18next";
import styled from "@emotion/styled";
import {
  DepositPanelType,
  DepositTitle,
  LimitTrade,
  MarketTrade,
  PopoverPure,
  useSettings,
} from "@loopring-web/component-lib";
import React from "react";
import { useAccount } from "@loopring-web/core";
import { bindPopper, usePopupState } from "material-ui-popup-state/hooks";
import { HelpIcon } from "@loopring-web/common-resources";
import { bindHover } from "material-ui-popup-state";
import { TabIndex } from "../ProTradePage/panel";
import MyLiquidityPanel from "./MyLiquidityPanel";
import { PoolsPanel } from "../LiquidityPage/PoolsPanel";

const TableWrapperStyled = styled(Box)`
  display: flex;
  flex-direction: column;
  justify-content: stretch;
  align-items: stretch;
  flex: 1;
`;
export enum InvestType {
  MyBalance = 0,
  AmmPool = 1,
}
export const BalanceTitle = () => {
  const { t } = useTranslation();
  const { isMobile } = useSettings();
  return (
    <Typography display={"inline-flex"} alignItems={"center"}>
      <Typography
        component={"span"}
        variant={isMobile ? "h5" : "h5"}
        whiteSpace={"pre"}
        marginRight={1}
        className={"invest-Balance-Title"}
      >
        {t("labelInvestBalanceTitle")}
      </Typography>
    </Typography>
  );
};
export const AmmTitle = () => {
  const { t } = useTranslation();
  const { isMobile } = useSettings();
  const popupState = usePopupState({
    variant: "popover",
    popupId: `popupId-deposit`,
  });
  return (
    <Typography display={"inline-flex"} alignItems={"center"}>
      <Typography
        component={"span"}
        variant={isMobile ? "h5" : "h5"}
        whiteSpace={"pre"}
        marginRight={1}
        className={"invest-Amm-Title"}
      >
        {t("labelInvestAmmTitle")}
      </Typography>
      {/* // TODO */}
      {/*<HelpIcon*/}
      {/*  {...bindHover(popupState)}*/}
      {/*  fontSize={isMobile ? "medium" : "large"}*/}
      {/*  htmlColor={"var(--color-text-third)"}*/}
      {/*/>*/}
      {/*<PopoverPure*/}
      {/*  className={"arrow-center"}*/}
      {/*  {...bindPopper(popupState)}*/}
      {/*  anchorOrigin={{*/}
      {/*    vertical: "bottom",*/}
      {/*    horizontal: "center",*/}
      {/*  }}*/}
      {/*  transformOrigin={{*/}
      {/*    vertical: "top",*/}
      {/*    horizontal: "center",*/}
      {/*  }}*/}
      {/*>*/}
      {/*  <Typography*/}
      {/*    padding={2}*/}
      {/*    component={"p"}*/}
      {/*    variant={"body2"}*/}
      {/*    whiteSpace={"pre-line"}*/}
      {/*  >*/}
      {/*    <Trans*/}
      {/*      i18nKey={description ? description : "labelInvestAmmDescription"}*/}
      {/*    >*/}
      {/*      Once your deposit is confirmed on Ethereum, it will be added to your*/}
      {/*      balance within 2 minutes.*/}
      {/*    </Trans>*/}
      {/*  </Typography>*/}
      {/*</PopoverPure>*/}
    </Typography>
  );
};

export const InvestPage = withTranslation("common", { withRef: true })(() => {
  let match: any = useRouteMatch(["/invest/:item", ":subItem"]);
  const { account } = useAccount();
  const [tabIndex, setTabIndex] = React.useState<InvestType>(() => {
    let index = undefined;
    switch (match?.params.item) {
      case "balance":
        index = InvestType.MyBalance;
        break;
      case "ammpool":
        index = InvestType.AmmPool;
        break;
    }

    const selected =
      index ?? account.readyState === "ACTIVATED"
        ? InvestType.MyBalance
        : InvestType.AmmPool;

    return selected;
  });

  return (
    <Box flex={1} flexDirection={"column"}>
      <Tabs
        variant={"standard"}
        value={tabIndex}
        onChange={(_e, value) => setTabIndex(value)}
      >
        <Tab value={InvestType.MyBalance} label={<BalanceTitle />} />
        <Tab value={InvestType.AmmPool} label={<AmmTitle />} />
      </Tabs>
      <Box flex={1} component={"section"} marginTop={1}>
        {tabIndex === InvestType.MyBalance && <MyLiquidityPanel />}
        {tabIndex === InvestType.AmmPool && <PoolsPanel />}
      </Box>
    </Box>
  );
});
