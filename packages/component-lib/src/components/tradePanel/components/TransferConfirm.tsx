import { WithTranslation } from "react-i18next";
import { Box, Grid, Typography } from "@mui/material";
import {
  IBData,
  NFTWholeINFO,
  EmptyValueTag,
  FeeInfo,
} from "@loopring-web/common-resources";
import { Button } from "../../index";
import { TransferViewProps } from "./Interface";
import { useSettings } from "../../../stores";

export const TransferConfirm = <
  T extends IBData<I> & Partial<NFTWholeINFO>,
  I,
  C extends FeeInfo
>({
  t,
  // disabled,
  // walletMap,
  handleConfirm,
  tradeData,
  onTransferClick,
  realAddr,
  type,
  feeInfo,
  memo,
}: // transferI18nKey,
// type,
// chargeFeeTokenList,
// feeInfo,
// isFeeNotEnough,
// onTransferClick,
// handleSureItsLayer2,
// handleFeeChange,
// isThumb,
// isConfirmTransfer,
// transferBtnStatus,
// addressDefault,
// handleOnAddressChange,
// addressOrigin,
// wait = globalSetup.wait,
// assetsData = [],
// realAddr,
// isLoopringAddress,
// addrStatus,
// isAddressCheckLoading,
// isSameAddress,
// ...rest
Partial<TransferViewProps<T, I, C>> & {
  handleConfirm: (index: number) => void;
} & WithTranslation) => {
  const { isMobile } = useSettings();

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
    >
      <Grid item xs={12}>
        <Box
          display={"flex"}
          flexDirection={"row"}
          justifyContent={"center"}
          alignItems={"center"}
          marginBottom={2}
        >
          <Typography
            component={"h4"}
            variant={isMobile ? "h4" : "h3"}
            whiteSpace={"pre"}
          >
            {t("labelL2toL2Title")}
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
        <Typography color={"textPrimary"} variant={"h5"}>
          `${tradeData?.tradeValue} $
          {type === "NFT" ? tradeData?.name ?? "NFT" : tradeData?.belong}`
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <Typography color={"var(--color-text-third)"} variant={"body1"}>
          {t("labelL2toL2Address")}
        </Typography>
        <Typography color={"textPrimary"} variant={"h5"}>
          {realAddr}
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <Typography color={"var(--color-text-third)"} variant={"body1"}>
          {t("labelL2toL2AddressOrigin")}
        </Typography>
        <Typography color={"textPrimary"} variant={"h5"}>
          {realAddr}
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <Typography color={"var(--color-text-third)"} variant={"body1"}>
          {t("labelL2toL2AddressOrigin")}
        </Typography>
        <Typography color={"textPrimary"} variant={"h5"}>
          {realAddr}
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <Typography color={"var(--color-text-third)"} variant={"body1"}>
          {t("labelL2toL2Fee")}
        </Typography>
        <Typography color={"textPrimary"} variant={"h5"}>
          `${feeInfo?.fee} ${feeInfo?.belong}`
        </Typography>
      </Grid>

      <Grid item xs={12}>
        <Typography color={"var(--color-text-third)"} variant={"body1"}>
          {t("labelMemo")}
        </Typography>
        <Typography color={"textPrimary"} variant={"h5"}>
          ${memo ?? EmptyValueTag}
        </Typography>
      </Grid>

      <Grid
        item
        marginTop={2}
        alignSelf={"stretch"}
        paddingBottom={isMobile ? 0 : 5 / 2}
      >
        <Button
          fullWidth
          variant={"contained"}
          size={"medium"}
          color={"primary"}
          onClick={async () => {
            if (onTransferClick) {
              await onTransferClick({ ...tradeData, memo } as unknown as T);
              handleConfirm(1);
            }
            // onTransferClick(tradeData)
          }}
        >
          {t("labelConfirm")}
        </Button>
      </Grid>
    </Grid>
  );
};
