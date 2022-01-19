import { TradeBtnStatus } from "../Interface";
import { Trans, WithTranslation } from "react-i18next";
import React from "react";
import { Grid, Typography, Box } from "@mui/material";
import { EmptyValueTag, FeeInfo } from "@loopring-web/common-resources";
import { Button } from "../../basic-lib";
import { ResetViewProps } from "./Interface";
import {
  DropdownIconStyled,
  FeeTokenItemWrapper,
  TypographyStrong,
} from "../../../index";
import { FeeToggle } from "./tool/FeeList";

export const ResetWrap = <T extends FeeInfo>({
  t,
  resetBtnStatus,
  onResetClick,
  feeInfo,
  isFeeNotEnough,
  chargeFeeTokenList,
  handleFeeChange,
}: ResetViewProps<T> & WithTranslation) => {
  const [dropdownStatus, setDropdownStatus] = React.useState<"up" | "down">(
    "down"
  );

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
      <Grid item marginBottom={2}>
        <Typography
          component={"h4"}
          textAlign={"center"}
          variant={"h3"}
          marginBottom={2}
        >
          {t("resetTitle")}
        </Typography>
        <Typography
          component={"p"}
          variant="body1"
          color={"var(--color-text-secondary)"}
        >
          <Trans i18nKey="resetDescription">
            Create a new signing key for layer2 authentication (no backup
            needed). This will
            <TypographyStrong component={"span"}>
              cancel all your pending orders
            </TypographyStrong>
            .
          </Trans>
        </Typography>
      </Grid>

      <Grid item alignSelf={"stretch"} position={"relative"}>
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
            {feeInfo.belong && feeInfo.fee ? feeInfo.fee : EmptyValueTag}
            {" " + feeInfo.belong}
            <DropdownIconStyled status={dropdownStatus} fontSize={"medium"} />
            <Typography
              marginLeft={1}
              component={"span"}
              color={"var(--color-error)"}
            >
              {isFeeNotEnough && t("transferLabelFeeNotEnough")}
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
              {t("transferLabelFeeChoose")}
            </Typography>
            <FeeToggle
              chargeFeeTokenList={chargeFeeTokenList}
              handleToggleChange={handleToggleChange}
              feeInfo={feeInfo}
            />
          </FeeTokenItemWrapper>
        )}
      </Grid>

      <Grid item marginTop={2} alignSelf={"stretch"}>
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
            !getDisabled() && resetBtnStatus === TradeBtnStatus.LOADING
              ? "true"
              : "false"
          }
          disabled={
            getDisabled() ||
            resetBtnStatus === TradeBtnStatus.DISABLED ||
            resetBtnStatus === TradeBtnStatus.LOADING
              ? true
              : false
          }
        >
          {t(`resetLabelBtn`)}
        </Button>
      </Grid>
    </Grid>
  );
};
