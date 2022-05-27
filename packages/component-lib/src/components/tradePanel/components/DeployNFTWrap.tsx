import {
  EmptyValueTag,
  FeeInfo,
  HelpIcon,
  TradeNFT,
} from "@loopring-web/common-resources";
import { NFTDeployViewProps } from "./Interface";
import { Trans, useTranslation } from "react-i18next";
import React from "react";
import { bindPopper, usePopupState } from "material-ui-popup-state/hooks";
import { Box, Grid, Link, Toolbar, Typography } from "@mui/material";
import { bindHover } from "material-ui-popup-state/es";
import { Button, ModalBackButton, PopoverPure } from "../../basic-lib";
import { DropdownIconStyled, FeeTokenItemWrapper } from "./Styled";
import { TradeBtnStatus } from "../Interface";
import { FeeToggle } from "./tool/FeeList";

export const DeployNFTWrap = <
  T extends TradeNFT<I> & { broker: string },
  I,
  C extends FeeInfo
>({
  tradeData,
  title,
  description,
  btnInfo,
  nftDeployBtnStatus,
  onNFTDeployClick,
  chargeFeeTokenList = [],
  feeInfo,
  disabled,
  isFeeNotEnough,
  handleFeeChange,
  onBack,
  assetsData = [],
}: NFTDeployViewProps<T, I, C>) => {
  const { t } = useTranslation(["common"]);
  const [dropdownStatus, setDropdownStatus] =
    React.useState<"up" | "down">("down");
  const popupState = usePopupState({
    variant: "popover",
    popupId: `popupId-nftDeposit`,
  });

  const getDisabled = React.useMemo(() => {
    if (disabled || nftDeployBtnStatus === TradeBtnStatus.DISABLED) {
      return true;
    } else {
      return false;
    }
  }, [nftDeployBtnStatus, disabled]);

  const handleToggleChange = (value: C) => {
    if (handleFeeChange) {
      handleFeeChange(value);
    }
  };
  // @ts-ignore
  return (
    <Box flex={1}>
      {!!onBack && (
        <Toolbar variant={"dense"}>
          <ModalBackButton
            marginTop={0}
            marginLeft={-2}
            onBack={onBack}
            t={t}
          />
        </Toolbar>
      )}
      <Box flex={1}>
        <Grid
          className={assetsData ? "" : "loading"}
          paddingBottom={3}
          container
          paddingLeft={5 / 2}
          paddingRight={5 / 2}
          direction={"column"}
          justifyContent={"space-between"}
          alignItems={"center"}
          flex={1}
          height={"100%"}
        >
          <Grid item>
            <Box
              display={"flex"}
              flexDirection={"row"}
              justifyContent={"center"}
              alignItems={"center"}
              /* textAlign={'center'} */ marginBottom={2}
            >
              <Typography component={"h4"} variant={"h3"} marginRight={1}>
                {title ? title : t("nftDeployTitle")}
              </Typography>
              <HelpIcon
                {...bindHover(popupState)}
                fontSize={"large"}
                htmlColor={"var(--color-text-third)"}
              />
            </Box>
            <PopoverPure
              className={"arrow-center"}
              {...bindPopper(popupState)}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "center",
              }}
              transformOrigin={{
                vertical: "top",
                horizontal: "center",
              }}
            >
              <Typography
                padding={2}
                component={"p"}
                variant={"body2"}
                whiteSpace={"pre-line"}
              >
                <Trans
                  i18nKey={description ? description : "nftDeployDescription"}
                >
                  Once your nftDeploy is confirmed on Ethereum, it will be added
                  to your balance within 2 minutes.
                </Trans>
              </Typography>
            </PopoverPure>
          </Grid>

          <Grid item marginTop={2} alignSelf={"stretch"}>
            <Box
              display={"flex"}
              alignItems={"flex-start"}
              justifyContent={"space-between"}
              position={"relative"}
              flexDirection={"column"}
            >
              <Typography
                component={"h6"}
                color={"text.primary"}
                variant={"h4"}
              >
                {t("labelNFTDetail")}
              </Typography>
              <Typography
                display={"inline-flex"}
                variant={"body1"}
                marginTop={2}
              >
                <Typography color={"var(--color-text-third)"} width={160}>
                  {t("labelNFTName")}
                </Typography>
                <Typography
                  color={"var(--color-text-third)"}
                  title={tradeData?.name}
                >
                  {tradeData?.name}
                </Typography>
              </Typography>

              <Typography
                display={"inline-flex"}
                variant={"body1"}
                marginTop={2}
              >
                <Typography color={"var(--color-text-third)"} width={160}>
                  {t("labelNFTID")}
                </Typography>
                <Typography
                  color={"var(--color-text-third)"}
                  maxWidth={300}
                  title={tradeData?.nftId}
                >
                  {tradeData?.nftIdView ?? ""}
                </Typography>
              </Typography>
              <Typography
                display={"inline-flex"}
                variant={"body1"}
                marginTop={2}
              >
                <Typography color={"var(--color-text-third)"} width={160}>
                  {t("labelNFTTYPE")}
                </Typography>
                <Typography
                  color={"var(--color-text-third)"}
                  title={tradeData?.nftType}
                >
                  {tradeData.nftType}
                </Typography>
              </Typography>
              <Typography
                display={"inline-flex"}
                variant={"body1"}
                marginTop={2}
              >
                <Typography color={"var(--color-text-third)"} width={160}>
                  {t("labelNFTContractAddress")}
                </Typography>
                <Link
                  fontSize={"inherit"}
                  whiteSpace={"break-spaces"}
                  style={{ wordBreak: "break-all" }}
                >
                  {tradeData.tokenAddress}
                </Link>
              </Typography>
              <Typography
                display={"inline-flex"}
                variant={"body1"}
                marginTop={2}
              >
                <Typography color={"var(--color-text-third)"} width={160}>
                  {t("labelNFTDeployBroker")}
                </Typography>
                <Link
                  fontSize={"inherit"}
                  whiteSpace={"break-spaces"}
                  style={{ wordBreak: "break-all" }}
                >
                  {tradeData.broker}
                </Link>
              </Typography>
            </Box>
          </Grid>
          <Grid item alignSelf={"stretch"} position={"relative"}>
            {!chargeFeeTokenList?.length ? (
              <Typography>{t("labelFeeCalculating")}</Typography>
            ) : (
              <>
                <Typography
                  component={"span"}
                  display={"flex"}
                  alignItems={"center"}
                  variant={"body1"}
                  color={"var(--color-text-secondary)"}
                  marginBottom={1}
                >
                  {t("labelL2toL2Fee")}：
                  <Box
                    component={"span"}
                    display={"flex"}
                    alignItems={"center"}
                    style={{ cursor: "pointer" }}
                    onClick={() =>
                      setDropdownStatus((prev) =>
                        prev === "up" ? "down" : "up"
                      )
                    }
                  >
                    {feeInfo && feeInfo.belong && feeInfo.fee
                      ? feeInfo.fee + " " + feeInfo.belong
                      : EmptyValueTag + " " + feeInfo?.belong}
                    <DropdownIconStyled
                      status={dropdownStatus}
                      fontSize={"medium"}
                    />
                    <Typography
                      marginLeft={1}
                      component={"span"}
                      color={"var(--color-error)"}
                    >
                      {isFeeNotEnough && (
                        <Trans i18nKey={"labelL2toL2FeeNotEnough"}>
                          Insufficient balance
                        </Trans>
                      )}
                    </Typography>
                  </Box>
                </Typography>
                {dropdownStatus === "up" && (
                  <FeeTokenItemWrapper padding={2}>
                    <Typography
                      variant={"body2"}
                      color={"var(--color-text-third)"}
                      marginBottom={1}
                    >
                      {t("labelActiveEnterToken")}
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
          <Grid item marginTop={3} alignSelf={"stretch"}>
            <Button
              fullWidth
              variant={"contained"}
              size={"medium"}
              color={"primary"}
              onClick={() => {
                onNFTDeployClick(tradeData);
              }}
              loading={
                !getDisabled && nftDeployBtnStatus === TradeBtnStatus.LOADING
                  ? "true"
                  : "false"
              }
              disabled={
                getDisabled || nftDeployBtnStatus === TradeBtnStatus.LOADING
              }
            >
              {btnInfo
                ? t(btnInfo.label, btnInfo.params)
                : t(`labelNFTDeployBtn`)}
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};
