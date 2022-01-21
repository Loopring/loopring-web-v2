import { TradeBtnStatus } from "../Interface";
import { Trans, WithTranslation } from "react-i18next";
import React from "react";
import { Grid, Typography, Box, Link } from "@mui/material";
import { EmptyValueTag, FeeInfo, myLog } from "@loopring-web/common-resources";
import { Button } from "../../basic-lib";
import { ActiveAccountViewProps } from "./Interface";
import { DropdownIconStyled, FeeTokenItemWrapper } from "./Styled";
import { FeeToggle } from "./tool/FeeList";

export const ActiveAccountWrap = <T extends FeeInfo>({
  t,
  activeAccountBtnStatus,
  onActiveAccountClick,
  chargeFeeTokenList = [],
  feeInfo,
  isFeeNotEnough,
  handleFeeChange,
  goToDeposit,
  walletMap,
}: ActiveAccountViewProps<T> & WithTranslation) => {
  const [dropdownStatus, setDropdownStatus] = React.useState<"up" | "down">(
    "down"
  );
  myLog("walletMap", walletMap);

  const getDisabled = React.useCallback(() => {
    if (isFeeNotEnough) {
      return true;
    } else {
      return false;
    }
  }, [isFeeNotEnough]);

  const handleToggleChange = (value: T) => {
    if (handleFeeChange) {
      handleFeeChange(value);
    }
  };
  return (
    <Grid
      className={""}
      paddingLeft={5 / 2}
      paddingRight={5 / 2}
      container
      direction={"column"}
      justifyContent={"space-between"}
      alignItems={"center"}
      flex={1}
      height={"100%"}
    >
      <Grid item>
        <Typography
          component={"h4"}
          textAlign={"center"}
          variant={"h3"}
          marginBottom={2}
        >
          {t("labelActiveAccountTitle")}
        </Typography>
        <Typography
          component={"p"}
          variant="body1"
          color={"var(--color-text-secondary)"}
        >
          {t("labelActiveAccountDescription")}
        </Typography>
      </Grid>

      <Grid item alignSelf={"stretch"} position={"relative"} marginTop={4}>
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
                  : EmptyValueTag + " " + feeInfo.belong}
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
                    <Trans i18nKey={"labelActiveAccountFeeNotEnough"}>
                      Insufficient balance
                      <Link
                        onClick={() => goToDeposit()}
                        variant={"body2"}
                        // style={{
                        //   textDecoration: "underline",
                        //   color: "var(--color-text-primary)",
                        // }}
                      >
                        Go Deposit
                      </Link>
                    </Trans>
                  )}
                </Typography>
              </Box>
            </Typography>
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
      <Grid item marginTop={4} alignSelf={"stretch"}>
        <Button
          fullWidth
          variant={"contained"}
          size={"medium"}
          color={"primary"}
          onClick={() => {
            if (onActiveAccountClick) {
              onActiveAccountClick();
            }
          }}
          loading={
            !getDisabled() && activeAccountBtnStatus === TradeBtnStatus.LOADING
              ? "true"
              : "false"
          }
          disabled={
            getDisabled() ||
            activeAccountBtnStatus === TradeBtnStatus.DISABLED ||
            activeAccountBtnStatus === TradeBtnStatus.LOADING
              ? true
              : false
          }
        >
          {t(`labelActiveAccountBtn`)}
        </Button>
      </Grid>
    </Grid>
  );
};
