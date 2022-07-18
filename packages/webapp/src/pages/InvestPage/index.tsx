import { useHistory, useRouteMatch } from "react-router-dom";

import { Box, Tab, Tabs, Typography } from "@mui/material";

import { useTranslation, withTranslation } from "react-i18next";
import {
  ConfirmInvestDefiRisk,
  useSettings,
} from "@loopring-web/component-lib";
import React from "react";
import { confirmation, ViewAccountTemplate } from "@loopring-web/core";
import { usePopupState } from "material-ui-popup-state/hooks";
import MyLiquidityPanel from "./MyLiquidityPanel";
import { PoolsPanel } from "./PoolsPanel";
import { DeFiPanel } from "./DeFiPanel";
import { OverviewPanel } from "./OverviewPanel";

export enum InvestType {
  MyBalance = 0,
  AmmPool = 1,
  DeFi = 2,
  Overview = 3,
}

export const InvestRouter = ["balance", "ammpool", "defi", ""];
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
export const OverviewTitle = () => {
  const { t } = useTranslation();
  const { isMobile } = useSettings();
  return (
    <Typography display={"inline-flex"} alignItems={"center"}>
      <Typography
        component={"span"}
        variant={isMobile ? "h5" : "h5"}
        whiteSpace={"pre"}
        marginRight={1}
        className={"invest-Overview-Title"}
      >
        {t("labelInvestOverviewTitle")}
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

export const DefiTitle = () => {
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
        className={"invest-defi-Title"}
      >
        {t("labelInvestDefiTitle")}
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
  const history = useHistory();
  const { confirmDefiInvest: confirmDefiInvestFun } =
    confirmation.useConfirmation();
  const [confirmDefiInvest, setConfirmDefiInvest] = React.useState(false);
  const [tabIndex, setTabIndex] = React.useState<InvestType>(
    InvestType.Overview
  );
  React.useEffect(() => {
    switch (match?.params.item) {
      case InvestRouter[InvestType.MyBalance]:
        setTabIndex(InvestType.MyBalance);
        return;
      // return ;
      case InvestRouter[InvestType.AmmPool]:
        setTabIndex(InvestType.AmmPool);
        return;
      case InvestRouter[InvestType.DeFi]:
        setTabIndex(InvestType.DeFi);
        return;
      case InvestRouter[InvestType.Overview]:
      default:
        setTabIndex(InvestType.Overview);
        return;
    }
  }, [match?.params.item]);

  return (
    <Box flex={1} flexDirection={"column"} display={"flex"}>
      <Tabs
        variant={"standard"}
        value={tabIndex}
        onChange={(_e, value) => {
          history.push(`/invest/${InvestRouter[value]}`);
          setTabIndex(value);
        }}
      >
        <Tab value={InvestType.Overview} label={<OverviewTitle />} />
        {/*<Tab value={InvestType.AmmPool} label={<AmmTitle />} />*/}
        {/*<Tab value={InvestType.DeFi} label={<DefiTitle />} />*/}
        <Tab value={InvestType.MyBalance} label={<BalanceTitle />} />
      </Tabs>
      <Box flex={1} component={"section"} marginTop={1} display={"flex"}>
        {tabIndex === InvestType.Overview && <OverviewPanel />}
        {tabIndex === InvestType.AmmPool && <PoolsPanel />}
        {tabIndex === InvestType.DeFi && (
          <DeFiPanel setConfirmDefiInvest={setConfirmDefiInvest} />
        )}
        {tabIndex === InvestType.MyBalance && (
          <Box
            flex={1}
            alignItems={"stretch"}
            display={"flex"}
            flexDirection={"column"}
          >
            <ViewAccountTemplate activeViewTemplate={<MyLiquidityPanel />} />
          </Box>
        )}
      </Box>
      <ConfirmInvestDefiRisk
        open={confirmDefiInvest}
        handleClose={(_e, isAgree) => {
          setConfirmDefiInvest(false);
          if (!isAgree) {
            history.goBack();
          } else {
            confirmDefiInvestFun();
          }
        }}
      />
    </Box>
  );
});
