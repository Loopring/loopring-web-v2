import { Trans, WithTranslation } from "react-i18next";
import React from "react";
import { bindHover } from "material-ui-popup-state/es";
import { bindPopper, usePopupState } from "material-ui-popup-state/hooks";
import {
  Box,
  Grid,
  List,
  ListItem,
  ListItemText,
  Typography,
} from "@mui/material";
import {
  AssetsRawDataItem,
  CloseIcon,
  DropDownIcon,
  EmptyValueTag,
  FeeInfo,
  globalSetup,
  IBData,
  Info2Icon,
  L1L2_NAME_DEFINED,
  LoadingIcon,
  MapChainId,
  TRADE_TYPE,
  TradeBtnStatus,
} from "@loopring-web/common-resources";
import {
  DropdownIconStyled,
  FeeTokenItemWrapper,
  ForceWithdrawViewProps,
  InputButtonDefaultProps,
  PopoverPure,
} from "../..";
import {
  Button,
  IconClearStyled,
  TextField,
  useSettings,
} from "../../../index";
import { BasicACoinTrade } from "./BasicACoinTrade";
import { FeeToggle } from "./tool/FeeList";
import styled from "@emotion/styled";

export const ListStyle = styled(List)`
  li {
    height: auto;
    padding: 0;

    &:before {
      content: "•";
      padding-top: ${({ theme }) => theme.unit}px;
      color: var(--color-warning);
      display: inline-flex;
      padding-right: ${({ theme }) => theme.unit}px;
    }

    display: inline-flex;

    &:hover {
      background-color: initial;
    }
  }

  //list-style: disc outside;
  //list-style: ;
  .MuiListItemText-root span {
    color: var(--color-warning);
    line-height: 1.2em;
    padding-bottom: 0;
  }

  font-size: ${({ theme }) => theme.fontDefault.body1};
` as typeof List;
export const ForceWithdrawWrap = <T extends IBData<I>, I, C extends FeeInfo>({
  t,
  disabled,
  walletMap,
  tradeData,
  coinMap,
  withdrawI18nKey,
  addressDefault,
  isNotAvailableAddress,
  isActiveAccount,
  isLoopringAddress = false,
  chargeFeeTokenList = [],
  feeInfo,
  lastFailed,
  // handleConfirm,
  isFeeNotEnough,
  onWithdrawClick,
  withdrawBtnStatus,
  handleFeeChange,
  handleOnAddressChange,
  isAddressCheckLoading,
  addrStatus,
  realAddr,
  wait = globalSetup.wait,
  assetsData = [],
  ...rest
}: ForceWithdrawViewProps<T, I, C> &
  WithTranslation & {
    assetsData: AssetsRawDataItem[];
    // handleConfirm: (index: number) => void;
  }) => {
  const { isMobile, defaultNetwork } = useSettings();
  const network = MapChainId[defaultNetwork] ?? MapChainId[1];
  const [dropdownStatus, setDropdownStatus] =
    React.useState<"up" | "down">("down");
  const popupState = usePopupState({
    variant: "popover",
    popupId: `popupId-withdraw`,
  });

  const inputBtnRef = React.useRef();

  const getDisabled = React.useMemo(() => {
    return disabled || withdrawBtnStatus === TradeBtnStatus.DISABLED;
  }, [disabled, withdrawBtnStatus]);
  const inputButtonDefaultProps: InputButtonDefaultProps<T, I> = {
    label: t("labelForceWithdrawEnterToken"),
    disableInputValue: true,
    maxAllow: false,
    disabled: !Object.keys(walletMap ?? {}).length,
    subLabel: "",
  };

  const handleToggleChange = (value: C) => {
    if (handleFeeChange) {
      handleFeeChange(value);
    }
  };
  // @ts-ignore
  return (
    <Grid
      className={walletMap ? "" : "loading"}
      container
      paddingLeft={5 / 2}
      paddingRight={5 / 2}
      direction={"column"}
      justifyContent={"space-between"}
      alignItems={"center"}
      flex={1}
      minWidth={240}
      height={"100%"}
      flexWrap={"nowrap"}
      spacing={2}
    >
      <Grid item>
        <Box
          display={"flex"}
          flexDirection={"row"}
          justifyContent={"center"}
          alignItems={"center"} /* marginBottom={2} */
        >
          <Typography
            component={"h4"}
            variant={isMobile ? "h4" : "h3"}
            whiteSpace={"pre"}
            marginRight={1}
          >
            {t("labelForceWithdrawTitle")}
          </Typography>
          <Info2Icon
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
            maxWidth={490}
            variant={"body2"}
            whiteSpace={"pre-line"}
          >
            <Trans
              i18nKey="labelForceWithdrawDes"
              tOptions={{
                l1ChainName: L1L2_NAME_DEFINED[network].l1ChainName,
                loopringL2: L1L2_NAME_DEFINED[network].loopringL2,
                l2Symbol: L1L2_NAME_DEFINED[network].l2Symbol,
                l1Symbol: L1L2_NAME_DEFINED[network].l1Symbol,
                ethereumL1: L1L2_NAME_DEFINED[network].ethereumL1,
              }}
            >
              If the receipt account doesn't activate the Loopring L2 account,
              you will be able to withdraw the token from L2 to Ethereum L1.
              Usually only when you sent the token to the L2 account of a wrong
              Btrade address that doesn't support Loopring L2, you will need to
              do this so that you will be able to claim the token back.
            </Trans>
          </Typography>
        </PopoverPure>
      </Grid>
      <Grid item alignSelf={"stretch"} position={"relative"}>
        <Typography display={"inline-flex"}>
          {/*<Typography component={"span"} lineHeight={2}>*/}
          {/*  <Info2Icon color={"warning"} fontSize={"medium"} />*/}
          {/*</Typography>*/}
          <ListStyle>
            <ListItem>
              <ListItemText>{t("labelForceWithdrawConfirm")}</ListItemText>
            </ListItem>
            <ListItem>
              <ListItemText>
                {t("labelForceWithdrawConfirm1", { l1ChainName: "Ethereum" })}
              </ListItemText>
            </ListItem>
          </ListStyle>
        </Typography>
      </Grid>
      <Grid item alignSelf={"stretch"} position={"relative"}>
        <>
          <TextField
            className={"text-address"}
            value={addressDefault}
            error={
              realAddr !== "" &&
              isNotAvailableAddress &&
              (walletMap != {} || walletMap !== undefined)
            }
            placeholder={t("labelPleaseForceWithdrawAddress")}
            onChange={(event) => handleOnAddressChange(event?.target?.value)}
            label={t("labelForceWithdrawAddress")}
            SelectProps={{ IconComponent: DropDownIcon }}
            fullWidth={true}
          />

          {addressDefault !== "" ? (
            isAddressCheckLoading ? (
              <LoadingIcon
                width={24}
                style={{ top: 48, right: "8px", position: "absolute" }}
              />
            ) : (
              <IconClearStyled
                color={"inherit"}
                size={"small"}
                style={{ top: 46 }}
                aria-label="Clear"
                onClick={() => handleOnAddressChange("")}
              >
                <CloseIcon />
              </IconClearStyled>
            )
          ) : (
            ""
          )}
          {addressDefault !== "" &&
            !isAddressCheckLoading &&
            (walletMap === undefined || !Object.keys(walletMap).length) &&
            (isNotAvailableAddress && realAddr === "" ? (
              <Typography
                color={"var(--color-error)"}
                variant={"body2"}
                marginTop={1 / 4}
                alignSelf={"stretch"}
                position={"relative"}
              >
                {t("labelInvalidAddress")}
              </Typography>
            ) : isLoopringAddress && isActiveAccount ? (
              <Typography
                color={"var(--color-error)"}
                variant={"body2"}
                marginTop={1 / 4}
                alignSelf={"stretch"}
                position={"relative"}
              >
                {t("labelForceWithdrawNotAvailable", {
                  l1ChainName: L1L2_NAME_DEFINED[network].l1ChainName,
                  loopringL2: L1L2_NAME_DEFINED[network].loopringL2,
                  l2Symbol: L1L2_NAME_DEFINED[network].l2Symbol,
                  l1Symbol: L1L2_NAME_DEFINED[network].l1Symbol,
                  ethereumL1: L1L2_NAME_DEFINED[network].ethereumL1,
                })}
              </Typography>
            ) : (
              <Typography
                color={"var(--color-error)"}
                variant={"body2"}
                marginTop={1 / 4}
                alignSelf={"stretch"}
                position={"relative"}
              >
                {t("labelForceWithdrawNoToken")}
              </Typography>
            ))}
        </>
      </Grid>

      {!isAddressCheckLoading &&
        !isNotAvailableAddress &&
        walletMap !== undefined &&
        !!Object.keys(walletMap).length && (
          <Grid item alignSelf={"stretch"} position={"relative"}>
            {
              // @ts-ignore
              <BasicACoinTrade
                {...{
                  ...rest,
                  type: TRADE_TYPE.TOKEN,
                  t,
                  walletMap,
                  tradeData: {
                    ...tradeData,
                    tradeValue: tradeData.balance,
                  },
                  coinMap,
                  inputButtonDefaultProps,
                  inputBtnRef: inputBtnRef,
                }}
              />
            }
          </Grid>
        )}

      <Grid item alignSelf={"stretch"} position={"relative"}>
        {!chargeFeeTokenList?.length ? (
          <Typography>{t("labelFeeCalculating")}</Typography>
        ) : (
          <>
            <Typography
              component={"span"}
              display={"flex"}
              flexWrap={"wrap"}
              alignItems={"center"}
              variant={"body1"}
              color={"var(--color-text-secondary)"}
              marginBottom={1}
            >
              <Typography component={"span"} color={"inherit"} minWidth={28}>
                {t("labelL2toL2Fee")}：
              </Typography>
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
                      {t("labelL2toL2FeeNotEnough")}
                    </Typography>
                  )
                )}
              </Box>
            </Typography>
            {dropdownStatus === "up" && (
              <FeeTokenItemWrapper padding={2}>
                <Typography
                  variant={"body2"}
                  color={"var(--color-text-third)"}
                  marginBottom={1}
                >
                  {t("labelL2toL2FeeChoose")}
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

      <Grid item alignSelf={"stretch"} paddingBottom={0}>
        {lastFailed && (
          <Typography
            paddingBottom={1}
            textAlign={"center"}
            color={"var(--color-warning)"}
          >
            {t("labelConfirmAgainByFailed", {
              loopringL2: L1L2_NAME_DEFINED[network].loopringL2,
              l2Symbol: L1L2_NAME_DEFINED[network].l2Symbol,
              l1Symbol: L1L2_NAME_DEFINED[network].l1Symbol,
              ethereumL1: L1L2_NAME_DEFINED[network].ethereumL1,
            })}
          </Typography>
        )}
        <Button
          fullWidth
          variant={"contained"}
          size={"medium"}
          color={"primary"}
          onClick={() => {
            // handleConfirm(0);
            onWithdrawClick({ ...tradeData } as unknown as T);
          }}
          loading={
            withdrawBtnStatus === TradeBtnStatus.LOADING && !getDisabled
              ? "true"
              : "false"
          }
          disabled={getDisabled || withdrawBtnStatus === TradeBtnStatus.LOADING}
        >
          {t(withdrawI18nKey ?? "labelForceWithdrawBtn")}
        </Button>
      </Grid>
    </Grid>
  );
};
