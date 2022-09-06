import React from "react";
import styled from "@emotion/styled";
import { Box, Grid } from "@mui/material";
import { WithTranslation, withTranslation } from "react-i18next";
import { boxLiner, Button, useSettings } from "@loopring-web/component-lib";
import { useHistory } from "react-router-dom";
import { BackIcon } from "@loopring-web/common-resources";

const StyleWrapper = styled(Box)`
  position: relative;
  border-radius: ${({ theme }) => theme.unit}px;

  .loading-block {
    background: initial;
  }

  .hasLinerBg {
    ${({ theme }) => boxLiner({ theme })}
  }

  border-radius: ${({ theme }) => theme.unit}px;
` as typeof Grid;

export const DualPanel: any = withTranslation("common")(
  <R extends { [key: string]: any }, I extends { [key: string]: any }>({
    t,
  }: WithTranslation & {
    setConfirmDefiInvest: (state: any) => void;
  }) => {
    // const { marketArray } = useDefiMap();
    // const {
    //   confirmation: { confirmedDefiInvest },
    // } = confirmation.useConfirmation();
    // setConfirmDefiInvest(!confirmedDefiInvest);
    // const match: any = useRouteMatch("/invest/defi/:market?/:isJoin?");
    // const history = useHistory();
    // const _market: MarketType = [...(marketArray ? marketArray : [])].find(
    //   (_item) => {
    //     const value = match?.params?.market
    //       ?.replace(/null|-/gi, "")
    //       ?.toUpperCase();
    //     return new RegExp(value, "ig").test(_item);
    //   }
    // ) as MarketType;

    // const isJoin =
    //   match?.params?.isJoin?.toUpperCase() !== "Redeem".toUpperCase();
    // {
    //   market: _market ?? ("WSTETH-ETH" as MarketType),
    //     isJoin,
    // }
    // const {
    // dualWrapProps,
    // closeToast,
    // toastOpen,
    // confirmShowNoBalance,
    // setConfirmShowNoBalance,
    // serverUpdate,
    // setServerUpdate,
    // } = useDualHook({ setConfirmDualInvest });
    const { isMobile } = useSettings();
    const styles = isMobile ? { flex: 1 } : { width: "var(--swap-box-width)" };
    const history = useHistory();
    return (
      <Box display={"flex"} flexDirection={"column"} flex={1} marginBottom={2}>
        <Box marginBottom={2}>
          <Button
            startIcon={<BackIcon fontSize={"small"} />}
            variant={"text"}
            size={"medium"}
            sx={{ color: "var(--color-text-secondary)" }}
            color={"inherit"}
            onClick={history.goBack}
          >
            {t("labelInvestDualTitle")}
          </Button>
        </Box>
        <StyleWrapper
          display={"flex"}
          flexDirection={"column"}
          justifyContent={"center"}
          alignItems={"center"}
          flex={1}
        ></StyleWrapper>
      </Box>
    );
  }
);
