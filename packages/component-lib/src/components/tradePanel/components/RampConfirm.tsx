import { WithTranslation } from "react-i18next";
import { Box, Grid, Typography } from "@mui/material";
import {
  IBData,
  NFTWholeINFO,
  EmptyValueTag,
  FeeInfo,
  useAddressTypeLists,
  TOAST_TIME,
} from "@loopring-web/common-resources";
import {
  Button,
  DropdownIconStyled,
  FeeToggle,
  FeeTokenItemWrapper,
  RampViewProps,
  Toast,
} from "../../index";
import { useSettings } from "../../../stores";
import React from "react";

export const RampConfirm = <
  T extends IBData<I> & Partial<NFTWholeINFO>,
  I,
  C extends FeeInfo
>({
  t,
  sureItsLayer2,
  handleConfirm,
  tradeData,
  onTransferClick,
  realAddr,
  isFeeNotEnough,
  handleFeeChange,
  chargeFeeTokenList,
  feeInfo,
  memo,
}: RampViewProps<T, I, C> & {
  handleConfirm: (index: number) => void;
} & WithTranslation) => {
  const { isMobile } = useSettings();
  const { walletList } = useAddressTypeLists();
  const [open, setOpen] = React.useState(false);
  const [dropdownStatus, setDropdownStatus] =
    React.useState<"up" | "down">("down");
  const handleToggleChange = (value: C) => {
    if (handleFeeChange) {
      handleFeeChange(value);
    }
  };
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
          >
            {t("labelL2toL2Title")}
          </Typography>
        </Box>
      </Grid>
      <Grid item xs={12}>
        <Typography color={"var(--color-text-third)"} variant={"body1"}>
          {t("labelL2toL2TokenAmount")}
        </Typography>
        <Typography color={"textPrimary"} marginTop={1} variant={"body1"}>
          {tradeData?.tradeValue + " "}
          {tradeData?.belong}
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
      <Grid item xs={12}>
        <Typography color={"var(--color-text-third)"} variant={"body1"}>
          {t("labelL2toL2AddressType")}
        </Typography>
        <Typography color={"textPrimary"} marginTop={1} variant={"body1"}>
          {walletList.find((item) => item.value === sureItsLayer2)?.label}
        </Typography>
      </Grid>
      <Grid item xs={12} alignSelf={"stretch"} position={"relative"}>
        {!chargeFeeTokenList?.length ? (
          <Typography>{t("labelFeeCalculating")}</Typography>
        ) : (
          <>
            <Typography
              component={"span"}
              display={"flex"}
              flexWrap={"wrap"}
              alignItems={"center"}
              variant={"body1"}
              color={"var(--color-text-secondary)"}
              marginBottom={1}
            >
              <Typography component={"span"} color={"inherit"} minWidth={28}>
                {t("labelL2toL2Fee")}：
              </Typography>
              <Box
                component={"span"}
                display={"flex"}
                alignItems={"center"}
                style={{ cursor: "pointer" }}
                onClick={() =>
                  setDropdownStatus((prev) => (prev === "up" ? "down" : "up"))
                }
              >
                {feeInfo && feeInfo.belong && feeInfo.fee
                  ? feeInfo.fee + " " + feeInfo.belong
                  : EmptyValueTag + " " + feeInfo?.belong}
                <DropdownIconStyled
                  status={dropdownStatus}
                  fontSize={"medium"}
                />
                {isFeeNotEnough.isOnLoading ? (
                  <Typography
                    color={"var(--color-warning)"}
                    marginLeft={1}
                    component={"span"}
                  >
                    {t("labelFeeCalculating")}
                  </Typography>
                ) : (
                  isFeeNotEnough.isFeeNotEnough && (
                    <Typography
                      marginLeft={1}
                      component={"span"}
                      color={"var(--color-error)"}
                    >
                      {t("labelL2toL2FeeNotEnough")}
                    </Typography>
                  )
                )}
              </Box>
            </Typography>
            {dropdownStatus === "up" && (
              <FeeTokenItemWrapper padding={2}>
                <Typography
                  variant={"body2"}
                  color={"var(--color-text-third)"}
                  marginBottom={1}
                >
                  {t("labelL2toL2FeeChoose")}
                </Typography>
                <FeeToggle
                  chargeFeeTokenList={chargeFeeTokenList}
                  handleToggleChange={handleToggleChange}
                  feeInfo={feeInfo}
                />
              </FeeTokenItemWrapper>
            )}
          </>
        )}
      </Grid>

      <Grid item xs={12}>
        <Typography color={"var(--color-text-third)"} variant={"body1"}>
          {t("labelMemo")}
        </Typography>
        <Typography color={"textPrimary"} marginTop={1} variant={"body1"}>
          {memo ?? EmptyValueTag}
        </Typography>
      </Grid>

      <Grid item marginTop={2} alignSelf={"stretch"} paddingBottom={0}>
        <Button
          fullWidth
          variant={"contained"}
          size={"medium"}
          color={"primary"}
          onClick={async () => {
            if (onTransferClick) {
              await onTransferClick({ ...tradeData, memo } as unknown as T);
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
