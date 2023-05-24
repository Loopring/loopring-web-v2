import { WithTranslation, withTranslation } from "react-i18next";

import {
  EmptyValueTag,
  FeeInfo,
  IBData,
  TOAST_TIME,
  TradeBtnStatus,
} from "@loopring-web/common-resources";
import React from "react";
import {
  ClaimProps,
  DropdownIconStyled,
  FeeToggle,
  FeeTokenItemWrapper,
} from "../../tradePanel";
import { Box, Grid, Typography } from "@mui/material";
import { Button } from "../../basic-lib";
import { useSettings } from "../../../stores";
import { Toast, ToastType } from "../../toast";
import { useTheme } from "@emotion/react";

export const ClaimWithdrawPanel = withTranslation(["common", "error"], {
  withRef: true,
})(
  <T extends IBData<I> & { tradeValueView: string }, I, Fee extends FeeInfo>({
    t,
    tradeData,
    feeInfo,
    btnInfo,
    btnStatus,
    isFeeNotEnough,
    handleFeeChange,
    chargeFeeTokenList,
    disabled,
    claimType,
    onClaimClick,
    isNFT,
    nftIMGURL,
  }: ClaimProps<T, I, Fee> & WithTranslation & { assetsData: any[] }) => {
    const { isMobile } = useSettings();
    const [open, setOpen] = React.useState(false);
    const [dropdownStatus, setDropdownStatus] =
      React.useState<"up" | "down">("down");
    const handleToggleChange = (value: Fee) => {
      if (handleFeeChange) {
        handleFeeChange(value);
      }
    };
    const getDisabled = React.useMemo(() => {
      return disabled || btnStatus === TradeBtnStatus.DISABLED;
    }, [disabled, btnStatus]);
    const theme = useTheme();
    return (
      <Grid
        className={"confirm"}
        container
        paddingLeft={isMobile ? 2 : 5 / 2}
        paddingRight={isMobile ? 2 : 5 / 2}
        direction={"column"}
        alignItems={"stretch"}
        flex={1}
        width={`calc(var(--modal-width) - ${(theme.unit * 5) / 2}px)`}
        // height={isMobile ? "auto" : 560}
        minWidth={"var(--swap-box-width)"}
        flexWrap={"nowrap"}
        spacing={2}
        paddingBottom={5 / 2}
      >
        <Grid item xs={12} marginTop={1}>
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
              {t("labelRedPacketClaimTitle")}
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={12}>
          {isNFT ? (
            <Box display={"flex"} flexDirection={"column"} alignItems="center">
              <img height={8 * theme.unit} src={nftIMGURL} />
              <Typography
                color={"textSecondary"}
                marginTop={1}
                variant={"body2"}
              >
                {tradeData?.tradeValueView + " NFTs"}
              </Typography>
            </Box>
          ) : (
            <Typography
              component={"h5"}
              marginTop={1}
              textAlign={"center"}
              color={"textPrimary"}
              variant={"h2"}
            >
              {tradeData?.tradeValueView + " " + tradeData?.belong}
            </Typography>
          )}
        </Grid>
        {/*<Grid item xs={12}>*/}
        {/*  <Typography color={"var(--color-text-third)"} variant={"body1"}>*/}
        {/*    {t("labelL2toL2TokenAmount")}*/}
        {/*  </Typography>*/}
        {/*</Grid>*/}

        <Grid item xs={12}>
          <Typography color={"var(--color-text-third)"} variant={"body1"}>
            {t("labelRedPacketFrom")}
          </Typography>
          <Typography
            component={"span"}
            variant={"body1"}
            color={"var(--color-text-primary)"}
          >
            {t(`labelClaim${claimType}`)}
          </Typography>
        </Grid>

        <Grid item xs={12}>
          <Typography color={"var(--color-text-third)"} variant={"body1"}>
            {t("labelRedPacketTo")}
          </Typography>
          <Typography
            component={"span"}
            variant={"body1"}
            color={"var(--color-text-primary)"}
          >
            {t("labelToMyL2")}
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
                    : EmptyValueTag + " " + feeInfo?.belong ?? EmptyValueTag}
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
                    handleToggleChange={handleToggleChange as any}
                    feeInfo={feeInfo}
                  />
                </FeeTokenItemWrapper>
              )}
            </>
          )}
        </Grid>

        <Grid item marginTop={2} alignSelf={"stretch"} paddingBottom={0}>
          <Button
            fullWidth
            variant={"contained"}
            size={"medium"}
            color={"primary"}
            onClick={async () => {
              if (onClaimClick) {
                onClaimClick(tradeData);
              } else {
                setOpen(true);
              }
            }}
            loading={
              !getDisabled && btnStatus === TradeBtnStatus.LOADING
                ? "true"
                : "false"
            }
            disabled={getDisabled || btnStatus === TradeBtnStatus.LOADING}
          >
            {t(btnInfo?.label ? btnInfo?.label : `labelConfirm`)}
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
  }
) as <T, I>(props: ClaimProps<T, I> & React.RefAttributes<any>) => JSX.Element;
