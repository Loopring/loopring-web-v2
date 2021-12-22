import { CloseIcon, globalSetup, IBData } from "@loopring-web/common-resources";
import { TradeBtnStatus } from "../Interface";
import { Trans, WithTranslation } from "react-i18next";
import { bindHover } from "material-ui-popup-state/es";
import { bindPopper, usePopupState } from "material-ui-popup-state/hooks";
import React, { ChangeEvent } from "react";
import { Box, Grid, Typography } from "@mui/material";
import { PopoverPure } from "../../";
import { Button, IconClearStyled, TextField } from "../../../index";
import { DepositViewProps } from "./Interface";
import { BasicACoinTrade } from "./BasicACoinTrade";
import * as _ from "lodash";
import {
  HelpIcon,
  NFTWholeINFO,
  RampIcon
} from "@loopring-web/common-resources";
import { BasicANFTTrade } from "./BasicANFTTrade";
import { RampInstantSDK } from '@ramp-network/ramp-instant-sdk'

//SelectReceiveCoin
export const DepositWrap = <T extends IBData<I> & Partial<NFTWholeINFO>, I>({
  t,
  disabled,
  walletMap,
  tradeData,
  coinMap,
  title,
  description,
  type,
  btnInfo,
  depositBtnStatus,
  onDepositClick,
  isNewAccount,
  handleError,
  addressDefault,
  handleOnAddressChange,
  handleAddressError,
  wait = globalSetup.wait,
  allowTrade,
  ...rest
}: DepositViewProps<T, I> & WithTranslation) => {
  const { raw_data } = allowTrade
  const legalEnable = (raw_data as any)?.legal.enable
  const legalShow = (raw_data as any)?.legal.show

  const inputBtnRef = React.useRef();
  const popupState = usePopupState({
    variant: "popover",
    popupId: `popupId-deposit`,
  });
  const getDisabled = () => {
    if (
      disabled ||
      tradeData === undefined ||
      walletMap === undefined ||
      coinMap === undefined
    ) {
      return true;
    } else {
      return false;
    }
  };
  const [address, setAddress] = React.useState<string | undefined>(
    addressDefault || ""
  );
  const [addressError, setAddressError] = React.useState<
    | { error: boolean; message?: string | React.ElementType<HTMLElement> }
    | undefined
  >();
  // const [error, setError] = React.useState<{ error: boolean, message?: string | React.ElementType }>({
  //     error: false,
  //     message: ''
  // });
  const debounceAddress = React.useCallback(
    _.debounce(({ address }: any) => {
      if (handleOnAddressChange) {
        handleOnAddressChange(address);
      }
    }, wait),
    []
  );
  const handleClear = React.useCallback(() => {
    // @ts-ignore
    // addressInput?.current?.value = "";
    setAddress("");
  }, []);
  const _handleOnAddressChange = (event: ChangeEvent<HTMLInputElement>) => {
    const address = event.target.value;
    if (handleAddressError) {
      const error = handleAddressError(address);
      if (error?.error) {
        setAddressError(error);
      }
    }
    setAddress(address);
    debounceAddress({ address });
  };

  const showRamp = React.useCallback(() => {
    const widget = new RampInstantSDK({
        hostAppName: 'Loopring',
        hostLogoUrl: 'https://ramp.network/assets/images/Logo.svg',
        swapAsset: 'LOOPRING_*',
        userAddress: addressDefault,
        hostApiKey: 'syxdszpr5q6c9vcnuz8sanr77ammsph59umop68d',
    }).show();
    
    if (widget && widget.domNodes) {
        (widget as any).domNodes.shadowHost.style.position = 'absolute';
        (widget as any).domNodes.overlay.style.zIndex = 10000;
    }
  }, [addressDefault])

  const inputButtonDefaultProps = {
    label: t("depositLabelEnterToken"),
  };

  return (
    <Grid
      className={walletMap ? "" : "loading"}
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
        <Box
          display={"flex"}
          flexDirection={"row"}
          justifyContent={"center"}
          alignItems={"center"}
          /* textAlign={'center'} */ marginBottom={2}
        >
          <Typography component={"h4"} variant={"h3"} marginRight={1}>
            {title ? title : t("depositTitle")}
          </Typography>
          <HelpIcon
            {...bindHover(popupState)}
            fontSize={"large"}
            htmlColor={"var(--color-text-third)"}
          />
        </Box>
        {/* <Typography component={'p'} variant="body1">
                <Trans i18nKey={description ? description : 'depositDescription'}>
                    Once your deposit is <TypographyGood component={'span'}>confirmed on Ethereum</TypographyGood>, it
                    will be added to your balance within <TypographyGood component={'span'}>2 minutes</TypographyGood>.
                </Trans>
            </Typography> */}
            <PopoverPure
                className={'arrow-center'}
                {...bindPopper(popupState)}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'center',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'center',
                }}
            >
                <Typography padding={2} component={'p'} variant={'body2'} whiteSpace={'pre-line'}>
                    <Trans i18nKey={description ? description : 'depositDescription'}>
                        Once your deposit is confirmed on Ethereum, it
                        will be added to your balance within 2 minutes.
                    </Trans>
                </Typography>
            </PopoverPure>
        </Grid>
        {legalEnable && legalShow && (
          <Grid item alignSelf={"flex-end"} display={'flex'} alignItems={'center'}>
            <Button
                variant={'text'} 
                style={{ textTransform: 'none', paddingRight: 0 }}
                onClick={showRamp}
            >
                {t('labelDepositRamp')}
                <RampIcon fontSize={'large'} style={{ marginLeft: 4, marginRight: 4 }} />
                <Typography>Ramp</Typography>
            </Button>
        </Grid>
        )}
        <Grid item marginTop={2} alignSelf={"stretch"}>
            {type === 'NFT'? (<Box display={'inline-flex'} alignItems={'center'} justifyContent={'space-between'}>
                <BasicANFTTrade
                   {...{
                    ...rest,
                    type,
                    t,
                    disabled,
                    walletMap,
                    tradeData,
                    // coinMap,
                    inputNFTDefaultProps:  {label:''},
                    // inputButtonDefaultProps,
                    inputNFTRef: inputBtnRef,
                }}                />
            </Box>
            ) : (
          <BasicACoinTrade
            {...{
              ...rest,
              t,
              type,
              disabled,
              walletMap,
              tradeData,
              coinMap,
              inputButtonDefaultProps,
              inputBtnRef: inputBtnRef,
            }}
          />
        )}
      </Grid>
      {isNewAccount ? (
        <Grid item marginTop={2} alignSelf={"stretch"} position={"relative"}>
          <TextField
            value={address}
            error={addressError && addressError.error ? true : false}
            label={t("depositLabelRefer")}
            placeholder={t("depositLabelPlaceholder")}
            onChange={_handleOnAddressChange}
            // SelectProps={{IconComponent: DropDownIcon}}
            // required={true}
            // inputRef={addressInput}
            helperText={
              <Typography variant={"body2"} component={"span"}>
                {addressError && addressError.error ? addressError.message : ""}
              </Typography>
            }
            fullWidth={true}
          />
          {address !== "" ? (
            <IconClearStyled
              color={"inherit"}
              size={"small"}
              style={{ top: "28px" }}
              aria-label="Clear"
              onClick={handleClear}
            >
              <CloseIcon />
            </IconClearStyled>
          ) : (
            ""
          )}
        </Grid>
      ) : (
        <></>
      )}
      <Grid item marginTop={2} alignSelf={"stretch"}>
        <Button
          fullWidth
          variant={"contained"}
          size={"medium"}
          color={"primary"}
          onClick={() => {
            onDepositClick(tradeData);
          }}
          // style={{width: '200px'}}
          loading={
            !getDisabled() && depositBtnStatus === TradeBtnStatus.LOADING
              ? "true"
              : "false"
          }
          disabled={
            getDisabled() ||
            depositBtnStatus === TradeBtnStatus.DISABLED ||
            depositBtnStatus === TradeBtnStatus.LOADING
              ? true
              : false
          }
        >
          {btnInfo ? t(btnInfo.label, btnInfo.params) : t(`depositLabelBtn`)}
        </Button>
      </Grid>
    </Grid>
  );
};
