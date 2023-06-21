import { Trans, WithTranslation } from "react-i18next";
import React from "react";
import { Box, Grid, Link, Typography } from "@mui/material";
import {
  EmptyValueTag,
  FeeInfo,
  TradeBtnStatus,
} from "@loopring-web/common-resources";
import { Button } from "../../basic-lib";
import { ResetViewProps } from "./Interface";
import { DropdownIconStyled, FeeTokenItemWrapper } from "./Styled";
import { FeeToggle } from "./tool/FeeList";
import { useSettings } from "../../../stores";

export const ResetWrap = <T extends FeeInfo>({
  t,
  resetBtnStatus,
  onResetClick,
  isNewAccount = false,
  isFeeNotEnough,
  feeInfo,
  disabled = false,
  chargeFeeTokenList = [],
  goToDeposit,
  walletMap,
  handleFeeChange,
}: ResetViewProps<T> & WithTranslation) => {
  const [dropdownStatus, setDropdownStatus] =
    React.useState<"up" | "down">("down");
  const { isMobile } = useSettings();
  const getDisabled = React.useMemo(() => {
    return disabled || resetBtnStatus === TradeBtnStatus.DISABLED;
  }, [disabled, resetBtnStatus]);

  const handleToggleChange = (value: T) => {
    if (handleFeeChange) {
      handleFeeChange(value);
    }
  };

  return (
    <Grid
      container
      direction={"column"}
      justifyContent={"space-between"}
      alignItems={"center"}
      flex={1}
      paddingLeft={5 / 2}
      paddingRight={5 / 2}
      height={"100%"}
      minWidth={320}
    >
      <Grid item marginBottom={2}>
        <Typography
          component={"h4"}
          textAlign={"center"}
          variant={isMobile ? "h4" : "h3"}
          whiteSpace={"pre"}
          marginBottom={2}
        >
          {isNewAccount
            ? t("labelActiveAccountTitle", { loopringL2: "Loopring L2" })
            : t("resetTitle", { layer2: "Layer 2" })}
        </Typography>
        <Typography
          component={"p"}
          variant="body1"
          color={"var(--color-text-secondary)"}
        >
          {isNewAccount
            ? t("labelActiveAccountDescription", { layer2: "Layer 2" })
            : t("resetDescription", { layer2: "Layer 2" })}
        </Typography>
      </Grid>

      <Grid item alignSelf={"stretch"} position={"relative"} marginTop={1}>
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
                      {isNewAccount && goToDeposit ? (
                        <Trans i18nKey={"labelActiveAccountFeeNotEnough"}>
                          Insufficient balance
                          <Link
                            onClick={() => {
                              goToDeposit();
                            }}
                            variant={"body2"}
                          >
                            Add assets
                          </Link>
                        </Trans>
                      ) : (
                        t("labelL2toL2FeeNotEnough")
                      )}
                    </Typography>
                  )
                )}
              </Box>
            </Typography>
            {isNewAccount && feeInfo?.fee?.toString() == "0" ? (
              <Typography
                color={"var(--color-success)"}
                marginLeft={1}
                component={"span"}
              >
                {t("labelFriendsPayActivation", {
                  loopringL2: "Loopring L2",
                  l2Symbol: "L2",
                  l1Symbol: "L1",
                  ethereumL1: "Ethereum L1",
                })}
              </Typography>
            ) : (
              ""
            )}
            {isNewAccount && (
              <Typography
                component={"span"}
                display={"flex"}
                alignItems={"center"}
                variant={"body1"}
                color={"var(--color-text-secondary)"}
                marginTop={1}
                marginBottom={1}
              >
                {t("labelYourBalance", {
                  layer2: "Layer 2",
                  loopringL2: "Loopring L2",
                  l2Symbol: "L2",
                  l1Symbol: "L1",
                  ethereumL1: "Ethereum L1",
                  loopringLayer2: "Loopring Layer 2",
                  balance:
                    walletMap &&
                    feeInfo &&
                    feeInfo.belong &&
                    walletMap[feeInfo.belong]
                      ? walletMap[feeInfo.belong]?.count + " " + feeInfo.belong
                      : EmptyValueTag + " " + (feeInfo && feeInfo?.belong),
                })}
              </Typography>
            )}
            {dropdownStatus === "up" && (
              <FeeTokenItemWrapper padding={2}>
                <Typography
                  variant={"body2"}
                  color={"var(--color-text-third)"}
                  marginBottom={1}
                >
                  {isNewAccount
                    ? t("labelActiveEnterToken")
                    : t("labelL2toL2FeeChoose")}
                </Typography>
                <FeeToggle
                  disableNoToken={true}
                  chargeFeeTokenList={chargeFeeTokenList}
                  handleToggleChange={handleToggleChange}
                  feeInfo={feeInfo}
                />
              </FeeTokenItemWrapper>
            )}
          </>
        )}
      </Grid>
      <Grid item marginTop={4} alignSelf={"stretch"}>
        <Button
          fullWidth
          variant={"contained"}
          size={"medium"}
          color={"primary"}
          onClick={() => {
            if (onResetClick) {
              onResetClick({});
            }
          }}
          loading={
            !getDisabled && resetBtnStatus === TradeBtnStatus.LOADING
              ? "true"
              : "false"
          }
          disabled={
            getDisabled ||
            resetBtnStatus === TradeBtnStatus.DISABLED ||
            resetBtnStatus === TradeBtnStatus.LOADING
          }
        >
          {isNewAccount ? t(`labelActiveAccountBtn`) : t(`resetLabelBtn`)}
        </Button>
      </Grid>
    </Grid>
  );
};
