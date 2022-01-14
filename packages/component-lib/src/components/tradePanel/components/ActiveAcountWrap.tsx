import { TradeBtnStatus } from "../Interface";
import { Trans, WithTranslation } from "react-i18next";
import React from "react";
import { Grid, Typography, Box, Link } from "@mui/material";
import {
  EmptyValueTag,
  getValuePrecisionThousand,
} from "@loopring-web/common-resources";
import { Button, ToggleButtonGroup } from "../../basic-lib";
import { ActiveAccountViewProps } from "./Interface";
import { useSettings } from "../../../stores";
import { DropdownIconStyled, FeeTokenItemWrapper } from "./Styled";

export const ActiveAccountWrap = <T extends object>({
  t,
  activeAccountBtnStatus,
  onActiveAccountClick,
  chargeFeeToken,
  chargeFeeTokenList = [],
  handleFeeChange,
  goToDeposit,
  assetsData = [],
  ...rest
}: ActiveAccountViewProps<T> & WithTranslation) => {
  const [dropdownStatus, setDropdownStatus] = React.useState<"up" | "down">(
    "down"
  );
  const [isFeeNotEnough, setIsFeeNotEnough] = React.useState(false);
  const [feeToken, setFeeToken] = React.useState(() => {
    return (
      chargeFeeTokenList.find(
        (o) =>
          assetsData.find((item) => item.name === o.belong)?.available > o.fee
      )?.belong || "ETH"
    );
  });
  const { feeChargeOrder } = useSettings();

  const toggleData: any[] =
    chargeFeeTokenList &&
    chargeFeeTokenList
      .sort(
        (a, b) =>
          feeChargeOrder.indexOf(a.belong) - feeChargeOrder.indexOf(b.belong)
      )
      .map(({ belong, fee, __raw__ }) => ({
        key: belong,
        value: belong,
        fee,
        __raw__,
      }));
  const isFeeEnough = () => {
    if (!!chargeFeeTokenList.length && assetsData && feeToken) {
      if (!checkFeeTokenEnough(feeToken, Number(getTokenFee(feeToken)))) {
        setIsFeeNotEnough(true);
      } else {
        setIsFeeNotEnough(false);
      }
      const feeItem = chargeFeeTokenList.find(
        (item) => item.belong === feeToken || item.token === feeToken
      );
      handleFeeChange({
        belong: feeToken,
        ...feeItem,
      } as any);
    }
  };

  const getTokenFee = React.useCallback(
    (token: string) => {
      const raw = toggleData.find((o) => o.key === token)?.fee;
      // myLog('......raw:', raw, typeof raw, getValuePrecisionThousand(raw))
      return getValuePrecisionThousand(
        raw,
        undefined,
        undefined,
        undefined,
        false,
        { isTrade: true, floor: false }
      );
    },
    [toggleData]
  );

  const checkFeeTokenEnough = React.useCallback(
    (token: string, fee: number) => {
      const tokenAssets = assetsData.find((o) => o.name === token)?.available;
      return tokenAssets && Number(tokenAssets) > fee;
    },
    [assetsData]
  );

  React.useEffect(() => {
    isFeeEnough();
  }, [feeToken]);

  const getDisabled = React.useCallback(() => {
    if (isFeeNotEnough) {
      return true;
    } else {
      return false;
    }
  }, [isFeeNotEnough]);

  const handleToggleChange = React.useCallback(
    (_e: React.MouseEvent<HTMLElement, MouseEvent>, value: string) => {
      if (value === null) return;
      const currFeeRaw =
        toggleData.find((o) => o.key === value)?.__raw__ || EmptyValueTag;
      setFeeToken(value);
      handleFeeChange({
        belong: value,
        fee: getTokenFee(value),
        __raw__: currFeeRaw,
      });
    },
    [handleFeeChange, getTokenFee, toggleData]
  );

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
            {getTokenFee(feeToken) || EmptyValueTag} {feeToken}
            <DropdownIconStyled status={dropdownStatus} fontSize={"medium"} />
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
        {dropdownStatus === "up" && (
          <FeeTokenItemWrapper padding={2}>
            <Typography
              variant={"body2"}
              color={"var(--color-text-third)"}
              marginBottom={1}
            >
              {t("labelActiveEnterToken")}
            </Typography>
            <ToggleButtonGroup
              exclusive
              size={"small"}
              {...{ data: toggleData, value: feeToken, t, ...rest }}
              onChange={handleToggleChange}
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
