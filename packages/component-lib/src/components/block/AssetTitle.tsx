import { Box, Grid, IconButton, Typography } from "@mui/material";
import {
  getValuePrecisionThousand,
  HideIcon,
  ViewIcon,
} from "@loopring-web/common-resources";
import {
  useTranslation,
  withTranslation,
  WithTranslation,
} from "react-i18next";
import { AssetTitleMobileProps, AssetTitleProps } from "./Interface";
import styled from "@emotion/styled";
import { DropdownIconStyled, TradeBtnStatus } from "../tradePanel";
import { AnimationArrow, Button, ButtonListRightStyled } from "./../";
import React from "react";

const BoxStyled = styled(Box)`
  color: var(--color-text-secondary);

  .MuiButtonBase-root {
    color: var(--color-text-secondary);
  }
` as typeof Box;

export const AssetTitle = withTranslation("common")(
  ({
    t,
    assetInfo,
    accountId,
    onShowWithdraw,
    onShowTransfer,
    onShowDeposit,
    btnShowDepositStatus,
    btnShowTransferStatus,
    btnShowWithdrawStatus,
    hideL2Assets,
    setHideL2Assets,
    showPartner,
    legalEnable,
    legalShow,
  }: AssetTitleProps & WithTranslation) => {
    return (
      <Grid
        container
        spacing={2}
        justifyContent={"space-between"}
        alignItems={"flex-start"}
      >
        <Grid item xs={7} display={"flex"} flexDirection={"column"}>
          <BoxStyled
            component={"p"}
            display={"flex"}
            alignItems={"center"}
            justifyContent={"flex-start"}
            marginBottom={"16px"}
          >
            <Typography
              component={"span"}
              variant={"body1"}
              paddingRight={3}
              color={"textSecondary"}
            >
              {t("labelAssetTitle")}
              {` (UID: ${accountId})`}
              <IconButton
                size={"small"}
                // color={'secondary'}
                onClick={() => setHideL2Assets(!hideL2Assets)}
                aria-label={t("labelShowAccountInfo")}
              >
                {!hideL2Assets ? <ViewIcon /> : <HideIcon />}
              </IconButton>
            </Typography>
          </BoxStyled>

          <Typography
            component={"p"}
            display={"flex"}
            alignItems={"center"}
            justifyContent={"flex-start"}
            marginTop={1}
          >
            <Typography component={"span"} paddingRight={1} variant={"h1"}>
              {assetInfo.priceTag}{" "}
            </Typography>
            {!hideL2Assets ? (
              <Typography component={"span"} variant={"h1"}>
                {assetInfo.totalAsset
                  ? getValuePrecisionThousand(
                      assetInfo.totalAsset,
                      2,
                      2,
                      2,
                      true,
                      { floor: true }
                    )
                  : "0.00"}
              </Typography>
            ) : (
              <Typography component={"span"} variant={"h1"}>
                &#10033;&#10033;&#10033;&#10033;.&#10033;&#10033;
              </Typography>
            )}
          </Typography>
        </Grid>
        <ButtonListRightStyled
          item
          xs={5}
          display={"flex"}
          flexDirection={"row"}
          justifyContent={"flex-end"}
        >
          {legalEnable && legalShow && (
            <Button
              variant={"outlined"}
              size={"medium"}
              color={"primary"}
              style={{ minWidth: 120, textTransform: "none" }}
              onClick={showPartner}
            >
              {t("labelAssetsBtnRamp")}
            </Button>
          )}
          <Button
            variant={"outlined"}
            size={"medium"}
            color={"primary"}
            loading={
              btnShowTransferStatus === TradeBtnStatus.LOADING
                ? "true"
                : "false"
            }
            disabled={
              btnShowTransferStatus === TradeBtnStatus.DISABLED ? true : false
            }
            onClick={() => onShowTransfer()}
          >
            {t("labelBtnTransfer")}
          </Button>
          <Button
            variant={"outlined"}
            size={"medium"}
            color={"secondary"}
            loading={
              btnShowWithdrawStatus === TradeBtnStatus.LOADING
                ? "true"
                : "false"
            }
            disabled={
              btnShowWithdrawStatus === TradeBtnStatus.DISABLED ? true : false
            }
            onClick={() => onShowWithdraw()}
          >
            {t("labelBtnWithdraw")}
          </Button>
          <Button
            variant={"contained"}
            size={"small"}
            color={"primary"}
            loading={
              btnShowDepositStatus === TradeBtnStatus.LOADING ? "true" : "false"
            }
            disabled={
              btnShowDepositStatus === TradeBtnStatus.DISABLED ? true : false
            }
            onClick={() => onShowDeposit()}
          >
            {t("labelBtnDeposit")}
          </Button>
        </ButtonListRightStyled>
      </Grid>
    );
  }
);

export const AssetTitleMobile = ({
  assetInfo,
  accountId,
  onShowWithdraw,
  onShowTransfer,
  onShowDeposit,
  // btnShowDepositStatus,
  // btnShowTransferStatus,
  // btnShowWithdrawStatus,
  // btnShowNFTDepositStatus,
  // btnShowNFTMINTStatus,
  hideL2Assets,
  setHideL2Assets,
  showPartner,
  legalEnable,
  onShowNFTDeposit,
  onShowNFTMINT,
  legalShow,
}: AssetTitleMobileProps) => {
  const [dropdownStatus, setDropdownStatus] = React.useState<"up" | "down">(
    "up"
  );
  const { t } = useTranslation();
  return (
    <Box display={"flex"} flexDirection={"column"}>
      <Box
        display={"flex"}
        flexDirection={"row"}
        justifyContent={"space-between"}
      >
        <Typography
          component={"p"}
          variant={"body1"}
          display={"inline-flex"}
          alignItems={"center"}
          marginBottom={1}
        >
          {t("labelAssetMobileTitle")}
          {` (UID: ${accountId})`}
          <IconButton
            size={"small"}
            // color={'secondary'}
            onClick={() => setHideL2Assets(!hideL2Assets)}
            aria-label={t("labelShowAccountInfo")}
          >
            {!hideL2Assets ? (
              <ViewIcon fontSize={"large"} />
            ) : (
              <HideIcon fontSize={"large"} />
            )}
          </IconButton>
        </Typography>
        <Typography
          component={"p"}
          display={"flex"}
          alignItems={"center"}
          justifyContent={"flex-start"}
          marginTop={1}
        >
          <Typography component={"span"} paddingRight={1} variant={"h3"}>
            {assetInfo.priceTag}{" "}
          </Typography>
          {!hideL2Assets ? (
            <Typography component={"span"} variant={"h3"}>
              {assetInfo.totalAsset
                ? getValuePrecisionThousand(
                    assetInfo.totalAsset,
                    2,
                    2,
                    2,
                    true,
                    { floor: true }
                  )
                : "0.00"}
            </Typography>
          ) : (
            <Typography component={"span"} variant={"h3"}>
              &#10033;&#10033;&#10033;&#10033;.&#10033;&#10033;
            </Typography>
          )}
        </Typography>
      </Box>
      <Box
        component={"span"}
        display={"flex"}
        alignItems={"center"}
        style={{ cursor: "pointer" }}
        justifyContent={"center"}
        onClick={() =>
          setDropdownStatus((prev) => (prev === "up" ? "down" : "up"))
        }
        marginBottom={1}
      >
        {dropdownStatus === "up" ? (
          <DropdownIconStyled status={dropdownStatus} fontSize={"medium"} />
        ) : (
          <AnimationArrow
            className={"arrowCta"}
            // style={{
            // transform:
            //
            // ? "rotate(-135deg) scale(0.5)"
            // : "rotate(45deg) scale(0.5)",
            // }}
          />
        )}
      </Box>
      {dropdownStatus === "up" && (
        <Grid container spacing={2}>
          {legalEnable && legalShow && (
            <Grid item xs={4}>
              <Button
                fullWidth
                variant={"outlined"}
                size={"medium"}
                color={"primary"}
                style={{ minWidth: 120, textTransform: "none" }}
                onClick={showPartner}
              >
                {t("labelAssetsBtnRamp")}
              </Button>
            </Grid>
          )}
          <Grid item xs={4}>
            <Button
              fullWidth
              variant={"outlined"}
              size={"medium"}
              color={"primary"}
              onClick={() => onShowDeposit()}
            >
              {t("labelDeposit")}
            </Button>
          </Grid>
          <Grid item xs={4}>
            <Button
              fullWidth
              variant={"outlined"}
              size={"medium"}
              color={"primary"}
              onClick={() => onShowTransfer()}
            >
              {t("labelTransfer")}
            </Button>
          </Grid>
          <Grid item xs={4}>
            <Button
              fullWidth
              variant={"outlined"}
              size={"medium"}
              color={"primary"}
              onClick={() => onShowWithdraw()}
            >
              {t("labelWithdraw")}
            </Button>
          </Grid>
          <Grid item xs={4}>
            <Button
              fullWidth
              variant={"outlined"}
              size={"medium"}
              color={"primary"}
              onClick={() => onShowNFTDeposit()}
            >
              {t("labelNFTDeposit")}
            </Button>
          </Grid>
          <Grid item xs={4}>
            <Button
              fullWidth
              variant={"outlined"}
              size={"medium"}
              color={"primary"}
              onClick={() => onShowNFTMINT()}
            >
              {t("labelNFTMint")}
            </Button>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};
