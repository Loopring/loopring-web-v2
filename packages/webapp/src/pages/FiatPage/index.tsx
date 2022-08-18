import { WithTranslation, withTranslation } from "react-i18next";
import { VendorMenu } from "@loopring-web/component-lib";
import React from "react";
import {
  useVendorBuy,
  useVendorSell,
  ViewAccountTemplate,
} from "@loopring-web/core";
import { Box, Grid, Tab, Tabs, Typography } from "@mui/material";

import { TradeTypes } from "@loopring-web/common-resources";
import { useHistory } from "react-router-dom";
import styled from "@emotion/styled";

const StyledPaper = styled(Grid)`
  background: var(--color-box);
  border-radius: ${({ theme }) => theme.unit}px;
`;
export const FiatPage = withTranslation("common")(
  ({ t, ...rest }: WithTranslation) => {
    const history = useHistory();
    const vendorPropsBuy = useVendorBuy();
    const vendorPropsSell = useVendorSell();
    const [tabIndex, setTabIndex] = React.useState<TradeTypes>(TradeTypes.Buy);
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
              width={"var(--swap-box-width)"}
              paddingY={5 / 2}
              flex={"initial "}
            >
              {tabIndex === TradeTypes.Buy && (
                <VendorMenu {...vendorPropsBuy} />
              )}
              {tabIndex === TradeTypes.Sell && (
                <VendorMenu {...vendorPropsSell} />
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
    }, []);
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
  }
);
