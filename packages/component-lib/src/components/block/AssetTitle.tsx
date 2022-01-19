import { Box, Grid, IconButton, Typography } from "@mui/material";
import {
  getValuePrecisionThousand,
  HideIcon,
  ViewIcon,
} from "@loopring-web/common-resources";
import { withTranslation, WithTranslation } from "react-i18next";
import { AssetTitleProps } from "./Interface";
import styled from "@emotion/styled";
import { TradeBtnStatus } from "../tradePanel";
import { Button, ButtonListRightStyled } from "./../";

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
              {" "}
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
