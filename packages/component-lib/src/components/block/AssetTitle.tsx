import { Box, Grid, IconButton, Typography } from "@mui/material";
import {
  getValuePrecisionThousand,
  HeaderMenuItemInterface,
  HideIcon,
  subMenuLayer2,
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
import { useRouteMatch } from "react-router-dom";
import { useSettings } from "../../stores";

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
            component={"span"}
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
            component={"span"}
            display={"flex"}
            alignItems={"center"}
            justifyContent={"flex-start"}
            marginTop={1}
          >
            <Typography component={"span"} paddingRight={1} variant={"h1"}>
              {assetInfo.priceTag}
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
  const { hideL2Action, setHideL2Action } = useSettings();
  // const [dropdownStatus, setDropdownStatus] =
  //   React.useState<"up" | "down">(hideL2Action?"up":"down");
  const { t } = useTranslation(["common", "layout"]);
  let match: any = useRouteMatch("/layer2/:item");
  const label = Reflect.ownKeys(subMenuLayer2)
    .reduce(
      (pre, item) => [...pre, ...subMenuLayer2[item]],
      [] as HeaderMenuItemInterface[]
    )
    .find((item) => RegExp(item?.router?.path ?? "").test(match.url))
    ?.label?.i18nKey;
  return (
    <Box display={"flex"} flexDirection={"column"} marginBottom={2}>
      <Box
        display={"flex"}
        flexDirection={"column"}
        justifyContent={"space-between"}
        position={"relative"}
        alignItems={"flex-end"}
      >
        <Typography
          component={"span"}
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
          component={"span"}
          display={"flex"}
          alignItems={"center"}
          justifyContent={"flex-start"}
          marginTop={1}
        >
          <Typography component={"span"} paddingRight={1} variant={"h3"}>
            {assetInfo.priceTag}
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
        <Typography
          component={"h3"}
          variant={"h4"}
          position={"absolute"}
          left={2}
          top={2}
        >
          {t(label ?? "", { ns: "layout" })}
        </Typography>
      </Box>
      <Box
        component={"span"}
        display={"flex"}
        alignItems={"center"}
        style={{ cursor: "pointer" }}
        justifyContent={"center"}
        onClick={() => setHideL2Action(!hideL2Action)}
        marginBottom={1}
      >
        {!hideL2Action ? (
          <DropdownIconStyled
            status={hideL2Action ? "down" : "up"}
            fontSize={"medium"}
          />
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
      {!hideL2Action && (
        <Grid container spacing={2}>
          {legalEnable && legalShow && (
            <Grid item xs={4}>
              <Button
                fullWidth
                variant={"outlined"}
                size={"medium"}
                color={"primary"}
                style={{
                  textTransform: "none",
                  paddingLeft: 0,
                  paddingRight: 0,
                }}
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
