import { TradeBtnStatus } from "../Interface";
import { Trans, WithTranslation } from "react-i18next";
import React from "react";
import { Grid, Typography, Box, Link } from "@mui/material";
import { EmptyValueTag, FeeInfo } from "@loopring-web/common-resources";
import { Button } from "../../basic-lib";
import { ResetViewProps } from "./Interface";
import { DropdownIconStyled, FeeTokenItemWrapper } from "./Styled";
import { FeeToggle } from "./tool/FeeList";

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
  const [dropdownStatus, setDropdownStatus] = React.useState<"up" | "down">(
    "down"
  );

  const getDisabled = React.useMemo(() => {
    if (disabled || resetBtnStatus === TradeBtnStatus.DISABLED) {
      return true;
    } else {
      return false;
    }
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
    >
      <Grid item marginBottom={2}>
        <Typography
          component={"h4"}
          textAlign={"center"}
          variant={"h3"}
          marginBottom={2}
        >
          {isNewAccount ? t("labelActiveAccountTitle") : t("resetTitle")}
        </Typography>
        <Typography
          component={"p"}
          variant="body1"
          color={"var(--color-text-secondary)"}
        >
          {isNewAccount
            ? t("labelActiveAccountDescription")
            : t("resetDescription")}
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
              {t("transferLabelFee")}：
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
                <Typography
                  marginLeft={1}
                  component={"span"}
                  color={"var(--color-error)"}
                >
                  {isFeeNotEnough &&
                    (isNewAccount && goToDeposit ? (
                      <Trans i18nKey={"labelActiveAccountFeeNotEnough"}>
                        Insufficient balance
                        <Link
                          onClick={() => {
                            goToDeposit();
                          }}
                          variant={"body2"}
                        >
                          Go Deposit
                        </Link>
                      </Trans>
                    ) : (
                      t("transferLabelFeeNotEnough")
                    ))}
                </Typography>
              </Box>
            </Typography>
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
                    : t("transferLabelFeeChoose")}
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
      <Grid item marginTop={4} alignSelf={"stretch"}>
        <Button
          fullWidth
          variant={"contained"}
          size={"medium"}
          color={"primary"}
          onClick={() => {
            if (onResetClick) {
              onResetClick();
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
              ? true
              : false
          }
        >
          {isNewAccount ? t(`labelActiveAccountBtn`) : t(`resetLabelBtn`)}
        </Button>
      </Grid>
    </Grid>
  );
};
