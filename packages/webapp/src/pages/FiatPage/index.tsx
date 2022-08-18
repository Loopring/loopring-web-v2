import { WithTranslation, withTranslation } from "react-i18next";
import { ConfirmInvestDefiRisk, VendorMenu } from "@loopring-web/component-lib";
import React from "react";
import { useVendorBuy, useVendorSell } from "@loopring-web/core";
import { Box, Tab, Tabs, Typography } from "@mui/material";

import { TradeTypes } from "@loopring-web/common-resources";
import { useHistory } from "react-router-dom";

export const FiatPage = withTranslation("common")(
  ({ ...rest }: WithTranslation) => {
    const history = useHistory();
    const vendorPropsBuy = useVendorBuy();
    const vendorPropsSell = useVendorSell();
    const [tabIndex, setTabIndex] = React.useState<TradeTypes>(TradeTypes.Buy);
    // <VendorMenu {...{ ...vendorPropsBuy }} />
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
        <Box flex={1} component={"section"} marginTop={1} display={"flex"}>
          {tabIndex === TradeTypes.Buy && <VendorMenu {...vendorPropsBuy} />}
          {tabIndex === TradeTypes.Sell && <VendorMenu {...vendorPropsSell} />}
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
  }
);
