import { WithTranslation } from "react-i18next";
import { Box, Grid, Typography } from "@mui/material";
import {
  IBData,
  NFTWholeINFO,
  FeeInfo,
  useAddressTypeLists,
  TOAST_TIME,
} from "@loopring-web/common-resources";
import { Button, Toast } from "../../index";
import { WithdrawViewProps } from "./Interface";
import { useSettings } from "../../../stores";
import React from "react";

export const WithdrawConfirm = <
  T extends IBData<I> & Partial<NFTWholeINFO>,
  I,
  C extends FeeInfo
>({
  t,
  handleConfirm,
  tradeData,
  onWithdrawClick,
  realAddr,
  type,
  feeInfo,
  isToMyself,
  sureIsAllowAddress,
}: Partial<WithdrawViewProps<T, I, C>> & {
  handleConfirm: (index: number) => void;
} & WithTranslation) => {
  const { isMobile } = useSettings();
  const [open, setOpen] = React.useState(false);
  const { nonExchangeList, exchangeList } = useAddressTypeLists();
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
          <Typography
            component={"h4"}
            variant={isMobile ? "h4" : "h3"}
            whiteSpace={"pre"}
            marginRight={1}
          >
            {(tradeData as NFTWholeINFO)?.isCounterFactualNFT &&
            (tradeData as NFTWholeINFO)?.deploymentStatus === "NOT_DEPLOYED"
              ? t("labelL2ToL1DeployTitle")
              : isToMyself
              ? t("labelL2ToMyL1Title")
              : t("labelL2ToOtherL1Title")}
          </Typography>
          <Typography
            component={"h6"}
            variant={isMobile ? "h5" : "h4"}
            whiteSpace={"pre"}
            marginTop={1}
          >
            {t("labelL2toL2Confirm")}
          </Typography>
        </Box>
      </Grid>
      <Grid item xs={12}>
        <Typography color={"var(--color-text-third)"} variant={"body1"}>
          {t("labelL2toL2TokenAmount")}
        </Typography>
        <Typography color={"textPrimary"} marginTop={1} variant={"body1"}>
          {tradeData?.tradeValue + " "}
          {type === "NFT" ? tradeData?.name ?? "NFT" : tradeData?.belong}
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <Typography color={"var(--color-text-third)"} variant={"body1"}>
          {t("labelL2toL2Address")}
        </Typography>
        <Typography color={"textPrimary"} marginTop={1} variant={"body1"}>
          {realAddr}
        </Typography>
      </Grid>
      {!isToMyself && (
        <Grid item xs={12}>
          <Typography color={"var(--color-text-third)"} variant={"body1"}>
            {t("labelL2toL1AddressType")}
          </Typography>
          <Typography color={"textPrimary"} marginTop={1} variant={"body1"}>
            {
              [...nonExchangeList, ...exchangeList].find(
                (item) => item.value === sureIsAllowAddress
              )?.label
            }
          </Typography>
        </Grid>
      )}
      <Grid item xs={12}>
        <Typography color={"var(--color-text-third)"} variant={"body1"}>
          {t("labelL2toL2Fee")}
        </Typography>
        <Typography color={"textPrimary"} marginTop={1} variant={"body1"}>
          {feeInfo?.fee + " "} {feeInfo?.belong}
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
        severity={"error"}
      />
    </Grid>
  );
};
