import React from "react";
import styled from "@emotion/styled";
import {
  Avatar,
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
} from "@mui/material";
import {
  useTranslation,
  WithTranslation,
  withTranslation,
} from "react-i18next";
import { DeFiTradePanel } from "./DeFiTradePanel";
import {
  boxLiner,
  Button,
  ConfirmInvestDefiServiceUpdate,
  DeFiWrap,
  Toast,
  useSettings,
  LoadingBlock,
  CardNFTStyled,
  NftImage,
} from "@loopring-web/component-lib";
import {
  confirmation,
  useDefiMap,
  useNotify,
  useToast,
} from "@loopring-web/core";
import { useHistory, useRouteMatch } from "react-router-dom";
import {
  BackIcon,
  defiAdvice,
  defiRETHAdvice,
  defiWSTETHAdvice,
  dualAdvice,
  MarketType,
  SoursURL,
  TOAST_TIME,
} from "@loopring-web/common-resources";

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
const LandDefiInvest = () => {
  const history = useHistory();
  const { notifyMap } = useNotify();
  const { t } = useTranslation("common");
  const { isMobile } = useSettings();

  const investAdviceList = [
    {
      ...defiWSTETHAdvice,
      ...(notifyMap?.invest?.STAKE ? notifyMap?.invest?.STAKE[0] : {}),
    },
    {
      ...defiRETHAdvice,
      ...(notifyMap?.invest?.STAKE ? notifyMap?.invest?.STAKE[1] : {}),
    },
  ];

  return (
    <Box
      flex={1}
      display={"flex"}
      justifyContent={"stretch"}
      flexDirection={"column"}
    >
      <Box marginBottom={2}>
        <Typography component={"h3"} variant={"h4"} marginBottom={1}>
          {t("labelStackingSelect")}
        </Typography>
        {/*<Typography component={"h3"} variant={"body1"} color={"textSecondary"}>*/}
        {/*  {t("labelMintSelectDes")}*/}
        {/*</Typography>*/}
      </Box>
      <Box
        flex={1}
        alignItems={"center"}
        display={"flex"}
        flexDirection={isMobile ? "column" : "row"}
        justifyContent={"center"}
      >
        <Grid container spacing={2} padding={3}>
          {investAdviceList.map((item, index) => {
            return (
              <Grid item xs={12} md={4} lg={3} key={item.type + index}>
                <Card onClick={() => history.push(item.router)}>
                  <CardContent>
                    <Box
                      display={"flex"}
                      flexDirection={"row"}
                      alignItems={"center"}
                    >
                      <Avatar
                        variant="circular"
                        style={{
                          height: "var(--svg-size-huge)",
                          width: "var(--svg-size-huge)",
                        }}
                        src={item.banner}
                      />
                      <Box
                        flex={1}
                        display={"flex"}
                        flexDirection={"column"}
                        paddingLeft={1}
                      >
                        <Typography variant={"h5"}>
                          {t(item.titleI18n, { ns: "layout" })}
                        </Typography>
                        <Typography
                          variant={"body2"}
                          textOverflow={"ellipsis"}
                          whiteSpace={"pre"}
                          overflow={"hidden"}
                          color={"var(--color-text-third)"}
                        >
                          {t(item.desI18n, { ns: "layout" })}
                        </Typography>
                      </Box>
                      <BackIcon
                        fontSize={"small"}
                        htmlColor={"var(--color-text-third)"}
                        sx={{
                          transform: "rotate(180deg)",
                        }}
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </Box>
    </Box>
  );
};
export const DeFiPanel: any = withTranslation("common")(
  <R extends { [key: string]: any }, I extends { [key: string]: any }>({
    t,
    setConfirmDefiInvest,
  }: WithTranslation & {
    setConfirmDefiInvest: (state: any) => void;
  }) => {
    const { marketArray } = useDefiMap();
    const {
      confirmation: { confirmedDefiInvest },
    } = confirmation.useConfirmation();
    setConfirmDefiInvest(!confirmedDefiInvest);
    const match: any = useRouteMatch("/invest/defi/:market?/:isJoin?");
    const [serverUpdate, setServerUpdate] = React.useState(false);
    const { toastOpen, setToastOpen, closeToast } = useToast();
    const history = useHistory();

    const _market: MarketType = [...(marketArray ? marketArray : [])].find(
      (_item) => {
        const value = match?.params?.market
          ?.replace(/null|-/gi, "")
          ?.toUpperCase();
        return new RegExp(value, "ig").test(_item);
      }
    ) as MarketType;

    const isJoin =
      match?.params?.isJoin?.toUpperCase() !== "Redeem".toUpperCase();

    return (
      <Box display={"flex"} flexDirection={"column"} flex={1} marginBottom={2}>
        <Box
          marginBottom={2}
          display={"flex"}
          justifyContent={"space-between"}
          alignItems={"center"}
        >
          <Button
            startIcon={<BackIcon fontSize={"small"} />}
            variant={"text"}
            size={"medium"}
            sx={{ color: "var(--color-text-secondary)" }}
            color={"inherit"}
            onClick={() =>
              history.push(
                !match?.params?.market
                  ? "/invest/overview"
                  : match?.params?.isJoin
                  ? "/invest/balance"
                  : "/invest/defi"
              )
            }
          >
            {t("labelInvestDefiTitle")}
            {/*<Typography color={"textPrimary"}></Typography>*/}
          </Button>
          <Button
            variant={"outlined"}
            sx={{ marginLeft: 2 }}
            onClick={() => history.push("/invest/balance/stack")}
          >
            {t("labelInvestMyDefi")}
          </Button>
        </Box>
        <StyleWrapper
          display={"flex"}
          flexDirection={"column"}
          justifyContent={"center"}
          alignItems={"center"}
          flex={1}
        >
          {marketArray.length ? (
            match?.params?.market && _market ? (
              <DeFiTradePanel
                market={_market}
                isJoin={isJoin}
                setServerUpdate={setServerUpdate}
                setToastOpen={setToastOpen}
              />
            ) : (
              <LandDefiInvest />
            )
          ) : (
            <LoadingBlock />
          )}
          <Toast
            alertText={toastOpen?.content ?? ""}
            severity={toastOpen?.type ?? "success"}
            open={toastOpen?.open ?? false}
            autoHideDuration={TOAST_TIME}
            onClose={closeToast}
          />

          <ConfirmInvestDefiServiceUpdate
            open={serverUpdate}
            handleClose={() => setServerUpdate(false)}
          />
        </StyleWrapper>
      </Box>
    );
  }
);
