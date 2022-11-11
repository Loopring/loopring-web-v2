import { useHistory, useRouteMatch } from "react-router-dom";

import { Box, Tab, Tabs, Typography } from "@mui/material";

import { useTranslation, withTranslation } from "react-i18next";
import {
  ConfirmInvestDefiRisk,
  ConfirmInvestDualRisk,
  useSettings,
} from "@loopring-web/component-lib";
import React from "react";
import {
  confirmation,
  useDualMap,
  ViewAccountTemplate,
} from "@loopring-web/core";
import { usePopupState } from "material-ui-popup-state/hooks";
import MyLiquidityPanel from "./MyLiquidityPanel";
import { PoolsPanel } from "./PoolsPanel";
import { DeFiPanel } from "./DeFiPanel";
import { OverviewPanel } from "./OverviewPanel";
import { DualListPanel } from "./DualPanel/DualListPanel";

export enum InvestType {
  MyBalance = 0,
  AmmPool = 1,
  DeFi = 2,
  Overview = 3,
  Dual = 4,
}

export const InvestRouter = ["balance", "ammpool", "defi", "overview", "dual"];
export const BalanceTitle = () => {
  const { t } = useTranslation();
  return (
    <Typography display={"inline-flex"} alignItems={"center"}>
      <Typography
        component={"span"}
        variant={"h5"}
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
  return (
    <Typography display={"inline-flex"} alignItems={"center"}>
      <Typography
        component={"span"}
        variant={"h5"}
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
        variant={"h5"}
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
        variant={"h5"}
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
  let match: any = useRouteMatch("/invest/:item?");
  const history = useHistory();
  const {
    confirmDefiInvest: confirmDefiInvestFun,
    confirmDualInvest: confirmDualInvestFun,
  } = confirmation.useConfirmation();
  const [showBeginnerModeHelp, setShowBeginnerModeHelp] = React.useState(false)
  const onShowBeginnerModeHelp = React.useCallback((show: boolean) => {
    setShowBeginnerModeHelp(show)
  }, [])
  const { marketArray } = useDualMap();
  const [confirmDefiInvest, setConfirmDefiInvest] = React.useState(false);
  const [confirmDualInvest, setConfirmDualInvest] = React.useState(false);
  const [tabIndex, setTabIndex] = React.useState<InvestType>(
    (InvestRouter.includes(match?.params?.item)
      ? InvestType[match?.params?.item]
      : InvestType.Overview) as any
    // InvestType.Overview
  );
  const [isShowTab, setIsShowTab] = React.useState<Boolean>(false);
  React.useEffect(() => {
    switch (match?.params.item) {
      case InvestRouter[InvestType.MyBalance]:
        setTabIndex(InvestType.MyBalance);
        setIsShowTab(true);
        return;
      // return ;
      case InvestRouter[InvestType.AmmPool]:
        setTabIndex(InvestType.AmmPool);
        setIsShowTab(false);
        return;
      case InvestRouter[InvestType.DeFi]:
        if (marketArray?.length) {
          setTabIndex(InvestType.DeFi);
          setIsShowTab(false);
        } else {
          setTabIndex(InvestType.Overview);
          setIsShowTab(true);
        }
        return;
      case InvestRouter[InvestType.Dual]:
        setTabIndex(InvestType.Dual);
        setIsShowTab(false);
        return;
      case InvestRouter[InvestType.Overview]:
      case "":
      default:
        setTabIndex(InvestType.Overview);
        setIsShowTab(true);
        return;
    }
  }, [match?.params.item]);

  return (
    <Box flex={1} flexDirection={"column"} display={"flex"}>
      {isShowTab && (
        <Box display={"flex"}>
          <Tabs
            variant={"scrollable"}
            value={tabIndex}
            onChange={(_e, value) => {
              history.push(`/invest/${InvestRouter[value]}`);
              setTabIndex(value);
            }}
          >
            <Tab value={InvestType.Overview} label={<OverviewTitle />} />
            <Tab value={InvestType.MyBalance} label={<BalanceTitle />} />
            <Tab
              sx={{ visibility: "hidden", width: 0 }}
              value={InvestType.AmmPool}
              label={<AmmTitle />}
            />
            <Tab
              sx={{ visibility: "hidden", width: 0 }}
              value={InvestType.DeFi}
              label={<DefiTitle />}
            />
          </Tabs>
        </Box>
      )}
      <Box flex={1} component={"section"} marginTop={1} display={"flex"}>
        {tabIndex === InvestType.Overview && <OverviewPanel />}
        {tabIndex === InvestType.AmmPool && <PoolsPanel />}
        {tabIndex === InvestType.DeFi && (
          <DeFiPanel setConfirmDefiInvest={setConfirmDefiInvest} />
        )}
        {tabIndex === InvestType.Dual && (
          <DualListPanel
            showBeginnerModeHelp={showBeginnerModeHelp}
            onShowBeginnerModeHelp={onShowBeginnerModeHelp}
            setConfirmDualInvest={setConfirmDualInvest}
          />
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

      <ConfirmInvestDualRisk
        open={confirmDualInvest}
        handleClose={(_e, isAgree) => {
          if (!isAgree) {
            history.goBack();
          } else {
            confirmDualInvestFun();
            setShowBeginnerModeHelp(true)
            setTimeout(() => {
              onShowBeginnerModeHelp(false)
            }, 5 * 1000);
          }
        }}
      />
    </Box>
  );
});
