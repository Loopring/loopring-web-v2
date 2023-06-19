import { WithTranslation } from "react-i18next";
import { Box, Grid, ListItem, ListItemText, Typography } from "@mui/material";
import { FeeInfo, IBData, TOAST_TIME } from "@loopring-web/common-resources";
import { Button, ForceWithdrawViewProps, Toast } from "../../index";
import { useSettings } from "../../../stores";
import React from "react";
import { ListStyle } from "./ForceWithdrawWrap";

export const ForceWithdrawConfirm = <
  T extends IBData<I>,
  I,
  C extends FeeInfo
>({
  t,
  handleConfirm,
  tradeData,
  realAddr,
  onWithdrawClick,
  feeInfo,
}: Partial<ForceWithdrawViewProps<T, I, C>> & {
  handleConfirm: (index: number) => void;
} & WithTranslation) => {
  const { isMobile } = useSettings();
  const [open, setOpen] = React.useState(false);
  return (
    <Grid
      className={"confirm"}
      container
      paddingLeft={isMobile ? 2 : 5 / 2}
      paddingRight={isMobile ? 2 : 5 / 2}
      direction={"column"}
      alignItems={"stretch"}
      flex={1}
      height={"100%"}
      minWidth={240}
      flexWrap={"nowrap"}
      spacing={2}
      width={"100%"}
    >
      <Grid item xs={12}>
        <Box
          display={"flex"}
          flexDirection={"column"}
          justifyContent={"center"}
          alignItems={"center"}
          marginBottom={2}
        >
          <Typography
            component={"h4"}
            variant={isMobile ? "h4" : "h3"}
            whiteSpace={"pre"}
            marginRight={1}
          >
            {t("labelForceWithdrawTitle")}
          </Typography>
        </Box>
      </Grid>
      <Grid item xs={12}>
        <Typography color={"var(--color-text-third)"} variant={"body1"}>
          {t("labelForceWithdrawAddress")}
        </Typography>
        <Typography color={"textPrimary"} marginTop={1} variant={"body1"}>
          {realAddr}
        </Typography>
      </Grid>

      <Grid item xs={12}>
        <Typography color={"var(--color-text-third)"} variant={"body1"}>
          {t("labelForceWithdrawToken")}
        </Typography>
        <Typography color={"textPrimary"} marginTop={1} variant={"body1"}>
          {tradeData?.balance + " " + tradeData?.belong}
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <Typography color={"var(--color-text-third)"} variant={"body1"}>
          {t("labelForceWithdrawFee")}
        </Typography>
        <Typography color={"textPrimary"} marginTop={1} variant={"body1"}>
          {feeInfo?.fee + " "} {feeInfo?.belong}
        </Typography>
      </Grid>

      <Grid item alignSelf={"stretch"} position={"relative"}>
        <Typography display={"inline-flex"}>
          {/*<Typography component={"span"} lineHeight={2}>*/}
          {/*  <Info2Icon color={"warning"} fontSize={"medium"} />*/}
          {/*</Typography>*/}
          <ListStyle>
            <ListItem>
              <ListItemText>{t("labelForceWithdrawConfirm")}</ListItemText>
            </ListItem>
            <ListItem>
              <ListItemText>{t("labelForceWithdrawConfirm1")}</ListItemText>
            </ListItem>
          </ListStyle>
        </Typography>
      </Grid>

      <Grid item marginTop={2} alignSelf={"stretch"} paddingBottom={0}>
        <Button
          fullWidth
          variant={"contained"}
          size={"medium"}
          color={"primary"}
          onClick={async () => {
            if (onWithdrawClick) {
              await onWithdrawClick({ ...tradeData } as unknown as T);
            } else {
              setOpen(true);
            }
            handleConfirm(1);
          }}
        >
          {t("labelConfirm")}
        </Button>
      </Grid>
      <Toast
        alertText={t("errorBase", { ns: "error" })}
        open={open}
        autoHideDuration={TOAST_TIME}
        onClose={() => {
          setOpen(false);
        }}
        severity={ToastType.error}
      />
    </Grid>
  );
};
