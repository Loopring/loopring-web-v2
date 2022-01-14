import {
  EmptyValueTag,
  getValuePrecisionThousand,
  HelpIcon,
  TradeNFT,
} from "@loopring-web/common-resources";
import { NFTDeployViewProps } from "./Interface";
import { Trans, useTranslation } from "react-i18next";
import React from "react";
import { bindPopper, usePopupState } from "material-ui-popup-state/hooks";
import { useSettings } from "../../../stores";
import { Box, Grid, Link, Typography } from "@mui/material";
import { bindHover } from "material-ui-popup-state/es";
import { Button, PopoverPure, ToggleButtonGroup } from "../../basic-lib";
import { DropdownIconStyled, FeeTokenItemWrapper } from "./Styled";
import { TradeBtnStatus } from "../Interface";

export const DeployNFTWrap = <T extends TradeNFT<I> & { broker: string }, I>({
  tradeData,
  title,
  description,
  btnInfo,
  nftDeployBtnStatus,
  onNFTDeployClick,
  chargeFeeTokenList = [],
  handleFeeChange,
  assetsData = [],
}: NFTDeployViewProps<T, I>) => {
  const { t, ...rest } = useTranslation(["common"]);
  const [dropdownStatus, setDropdownStatus] = React.useState<"up" | "down">(
    "down"
  );
  const popupState = usePopupState({
    variant: "popover",
    popupId: `popupId-nftDeposit`,
  });
  const { feeChargeOrder } = useSettings();
  const [isFeeNotEnough, setIsFeeNotEnough] = React.useState(false);
  const [feeToken, setFeeToken] = React.useState(() => {
    return (
      chargeFeeTokenList.find(
        (o) =>
          assetsData.find((item) => item.name === o.belong)?.available > o.fee
      )?.belong || "ETH"
    );
  });
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
  const checkFeeTokenEnough = React.useCallback(
    (token: string, fee: number) => {
      const tokenAssets = assetsData.find((o) => o.name === token)?.available;
      return tokenAssets && Number(tokenAssets) > fee;
    },
    [assetsData]
  );

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

  // @ts-ignore
  return (
    <Grid
      className={assetsData ? "" : "loading"}
      paddingLeft={5 / 2}
      paddingRight={5 / 2}
      paddingBottom={3}
      container
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
            <Trans i18nKey={description ? description : "nftDeployDescription"}>
              Once your nftDeploy is confirmed on Ethereum, it will be added to
              your balance within 2 minutes.
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
          <Typography component={"h6"} color={"text.primary"} variant={"h4"}>
            {t("labelNFTDetail")}
          </Typography>
          <Typography display={"inline-flex"} variant={"body1"} marginTop={2}>
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

          <Typography display={"inline-flex"} variant={"body1"} marginTop={2}>
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
          <Typography display={"inline-flex"} variant={"body1"} marginTop={2}>
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
          <Typography display={"inline-flex"} variant={"body1"} marginTop={2}>
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
          <Typography display={"inline-flex"} variant={"body1"} marginTop={2}>
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
                <Trans i18nKey={"transferLabelFeeNotEnough"}>
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
            <ToggleButtonGroup
              exclusive
              size={"small"}
              {...{ data: toggleData, value: feeToken, t, ...rest }}
              onChange={handleToggleChange}
            />
          </FeeTokenItemWrapper>
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
            !getDisabled() && nftDeployBtnStatus === TradeBtnStatus.LOADING
              ? "true"
              : "false"
          }
          disabled={
            getDisabled() ||
            nftDeployBtnStatus === TradeBtnStatus.DISABLED ||
            nftDeployBtnStatus === TradeBtnStatus.LOADING
          }
        >
          {btnInfo ? t(btnInfo.label, btnInfo.params) : t(`labelNFTDeployBtn`)}
        </Button>
      </Grid>
    </Grid>
  );
};
