import {
  EmptyValueTag,
  IBData,
  TOAST_TIME,
} from "@loopring-web/common-resources";
import { WithTranslation } from "react-i18next";
import React from "react";
import { Box, Grid, Typography } from "@mui/material";
import {
  Button,
  DepositTitle,
  Toast,
  ToastType,
  useSettings,
} from "../../../index";
import { DepositViewProps } from "./Interface";

export const DepositConfirm = <
  T extends {
    referAddress?: string;
    toAddress?: string;
    addressError?: { error: boolean; message?: string };
  } & IBData<I>,
  I
>({
  t,
  tradeData,
  onDepositClick,
  handleConfirm,
  title,
  lastFailed,
  realToAddress,
}: // ...rest
DepositViewProps<T, I> & {
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
    >
      <Grid item xs={12}>
        <Box
          display={"flex"}
          flexDirection={"column"}
          justifyContent={"center"}
          alignItems={"center"}
          marginBottom={2}
        >
          <DepositTitle title={title ? t(title) : undefined} isHideDes={true} />
        </Box>
      </Grid>
      <Grid item xs={12}>
        <Typography color={"var(--color-text-third)"} variant={"body1"}>
          {t("labelL2toL2TokenAmount")}
        </Typography>
        <Typography color={"textPrimary"} marginTop={1} variant={"body1"}>
          {tradeData?.tradeValue}
          <Typography
            component={"span"}
            color={"textSecondary"}
            marginLeft={1 / 2}
          >
            {tradeData?.belong}
          </Typography>
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <Typography color={"var(--color-text-third)"} variant={"body1"}>
          {t("labelDepositTo")}
        </Typography>
        <Typography color={"textPrimary"} marginTop={1} variant={"body1"}>
          {realToAddress}
        </Typography>
      </Grid>
      <Grid item marginTop={2} alignSelf={"stretch"} paddingBottom={0}>
        {lastFailed && (
          <Typography
            paddingBottom={1}
            textAlign={"center"}
            color={"var(--color-warning)"}
          >
            {t("labelConfirmAgainByFailedWithBalance", {
              symbol: ` ${tradeData?.belong}` ?? EmptyValueTag,
              count: tradeData?.balance,
            })}
          </Typography>
        )}
        <Button
          fullWidth
          variant={"contained"}
          size={"medium"}
          color={"primary"}
          onClick={async () => {
            if (onDepositClick) {
              await onDepositClick({ ...tradeData } as unknown as T);
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
