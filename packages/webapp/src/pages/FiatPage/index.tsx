import { WithTranslation, withTranslation } from "react-i18next";
import {
  BanxaConfirm,
  Button,
  RampConfirm,
  useSettings,
  VendorMenu,
} from "@loopring-web/component-lib";
import React from "react";
import {
  RAMP_SELL_PANEL,
  useBanxaConfirm,
  useModalData,
  useNotify,
  useRampConfirm,
  useVendor,
  ViewAccountTemplate,
} from "@loopring-web/core";
import { Box, Grid, Tab, Tabs, Typography } from "@mui/material";
import { banxaService, OrderENDReason } from "@loopring-web/core";

import {
  BackIcon,
  myLog,
  SoursURL,
  TradeTypes,
} from "@loopring-web/common-resources";
import { useHistory, useRouteMatch } from "react-router-dom";
import styled from "@emotion/styled";

const StyledPaper = styled(Grid)`
  background: var(--color-box);
  border-radius: ${({ theme }) => theme.unit}px;
`;
export const FiatPage = withTranslation("common")(({ t }: WithTranslation) => {
  const history = useHistory();
  const { vendorListBuy, vendorListSell, sellPanel, setSellPanel } =
    useVendor();
  const { resetTransferRampData, resetTransferBanxaData } = useModalData();
  const { campaignTagConfig } = useNotify().notifyMap ?? {};

  const { isMobile } = useSettings();
  const match: any = useRouteMatch("/trade/fiat/:tab?");
  const [tabIndex, setTabIndex] = React.useState<TradeTypes>(
    match?.params?.tab?.toLowerCase() === "Buy".toLowerCase()
      ? TradeTypes.Buy
      : TradeTypes.Sell
  );
  const { banxaViewProps, offBanxaValue } = useBanxaConfirm({
    sellPanel,
    setSellPanel,
  });

  const fiatView = React.useMemo(() => {
    return (
      <Box flex={1} flexDirection={"column"} display={"flex"}>
        <Box display={"flex"}>
          <Tabs
            variant={"scrollable"}
            value={tabIndex}
            onChange={(_e, value) => {
              history.push(`/trade/fiat/${value}`);
              setTabIndex(value);
            }}
          >
            <Tab
              value={TradeTypes.Buy}
              label={
                <Typography
                  display={"inline-flex"}
                  alignItems={"center"}
                  component={"span"}
                  variant={"h5"}
                  whiteSpace={"pre"}
                  marginRight={1}
                  className={"fiat-Title"}
                >
                  {t("labelBuy")}
                </Typography>
              }
            />
            <Tab
              value={TradeTypes.Sell}
              label={
                <Typography
                  display={"inline-flex"}
                  alignItems={"center"}
                  component={"span"}
                  variant={"h5"}
                  whiteSpace={"pre"}
                  marginRight={1}
                  className={"fiat-Title"}
                >
                  {t("labelSell")}
                </Typography>
              }
            />
          </Tabs>
        </Box>
        <Box
          flex={1}
          component={"section"}
          alignItems={"center"}
          justifyContent={"center"}
          marginTop={1}
          display={"flex"}
        >
          <StyledPaper
            width={isMobile ? "100%" : "var(--modal-width)"}
            paddingY={5 / 2}
            flex={"initial "}
          >
            {tabIndex === TradeTypes.Buy && (
              <VendorMenu
                type={TradeTypes.Buy}
                vendorList={vendorListBuy}
                vendorForce={undefined}
                campaignTagConfig={campaignTagConfig}
              />
            )}
            {tabIndex === TradeTypes.Sell && (
              <>
                {sellPanel === RAMP_SELL_PANEL.LIST &&
                vendorListSell?.length ? (
                  <VendorMenu
                    type={TradeTypes.Sell}
                    vendorList={vendorListSell}
                    vendorForce={undefined}
                    campaignTagConfig={campaignTagConfig}
                  />
                ) : (
                  <></>
                )}
                {sellPanel === RAMP_SELL_PANEL.BANXA_CONFIRM && (
                  <Box flex={1} display={"flex"} flexDirection={"column"}>
                    <Box marginBottom={2}>
                      <Button
                        startIcon={<BackIcon fontSize={"small"} />}
                        variant={"text"}
                        size={"medium"}
                        sx={{ color: "var(--color-text-secondary)" }}
                        color={"inherit"}
                        onClick={(e) => {
                          if (window.rampInstance) {
                            window.rampInstance.close();
                          } else {
                            setSellPanel(RAMP_SELL_PANEL.LIST);

                            const close =
                              window.document.querySelector(
                                "#iframeBanxaClose"
                              );
                            if (close) {
                              close.dispatchEvent(new Event("click"));
                            }
                            banxaService.banxaEnd({
                              reason: OrderENDReason.UserCancel,
                              data: { resource: "on close" },
                            });
                            // resetTransferRampData();
                          }
                        }}
                      >
                        {t("labelBack")}
                      </Button>
                    </Box>
                    {banxaViewProps ? (
                      <BanxaConfirm
                        {...{ ...banxaViewProps }}
                        offBanxaValue={offBanxaValue}
                      />
                    ) : (
                      <Box
                        flex={1}
                        display={"flex"}
                        alignItems={"center"}
                        justifyContent={"center"}
                        height={"90%"}
                      >
                        <img
                          className="loading-gif"
                          alt={"loading"}
                          width="36"
                          src={`${SoursURL}images/loading-line.gif`}
                        />
                        {/*<LoadingIcon style={{ width: 32, height: 32 }} />*/}
                      </Box>
                    )}
                  </Box>
                )}
                {/*{sellPanel === RAMP_SELL_PANEL.RAMP_CONFIRM && (*/}
                {/*  <Box flex={1} display={"flex"} flexDirection={"column"}>*/}
                {/*    <Box marginBottom={2}>*/}
                {/*      <Button*/}
                {/*        startIcon={<BackIcon fontSize={"small"} />}*/}
                {/*        variant={"text"}*/}
                {/*        size={"medium"}*/}
                {/*        sx={{ color: "var(--color-text-secondary)" }}*/}
                {/*        color={"inherit"}*/}
                {/*        onClick={() => {*/}
                {/*          if (window.rampInstance) {*/}
                {/*            window.rampInstance.close();*/}
                {/*          } else {*/}
                {/*            setSellPanel(RAMP_SELL_PANEL.LIST);*/}
                {/*            resetTransferRampData();*/}
                {/*          }*/}
                {/*        }}*/}
                {/*      >*/}
                {/*        {t("labelBack")}*/}
                {/*      </Button>*/}
                {/*    </Box>*/}
                {/*    {rampViewProps ? (*/}
                {/*      <RampConfirm {...{ ...rampViewProps }} />*/}
                {/*    ) : (*/}
                {/*      <Box*/}
                {/*        flex={1}*/}
                {/*        display={"flex"}*/}
                {/*        alignItems={"center"}*/}
                {/*        justifyContent={"center"}*/}
                {/*        height={"90%"}*/}
                {/*      >*/}
                {/*        <img*/}
                {/*          className="loading-gif"*/}
                {/*          alt={"loading"}*/}
                {/*          width="36"*/}
                {/*          src={`${SoursURL}images/loading-line.gif`}*/}
                {/*        />*/}
                {/*        /!*<LoadingIcon style={{ width: 32, height: 32 }} />*!/*/}
                {/*      </Box>*/}
                {/*    )}*/}
                {/*  </Box>*/}
                {/*)}*/}
              </>
            )}
          </StyledPaper>
        </Box>
        {/*<ConfirmInvestDefiRisk*/}
        {/*  open={confirmDefiInvest}*/}
        {/*  handleClose={(_e, isAgree) => {*/}
        {/*    setConfirmDefiInvest(false);*/}
        {/*    if (!isAgree) {*/}
        {/*      history.goBack();*/}
        {/*    } else {*/}
        {/*      confirmDefiInvestFun();*/}
        {/*    }*/}
        {/*  }}*/}
        {/*/>*/}
      </Box>
    );
  }, [t, tabIndex, vendorListBuy, vendorListSell]);
  const activeView = React.useMemo(
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
          {fiatView}
        </Box>
      </>
    ),
    [fiatView]
  );
  return <ViewAccountTemplate activeViewTemplate={activeView} />;
});
