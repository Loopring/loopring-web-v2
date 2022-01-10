import {
  CloseIcon,
  globalSetup,
  HelpIcon,
  TradeNFT,
  LoadingIcon,
} from "@loopring-web/common-resources";
import { TradeBtnStatus } from "../Interface";
import { Trans, useTranslation } from "react-i18next";
import { bindHover } from "material-ui-popup-state/es";
import { bindPopper, usePopupState } from "material-ui-popup-state/hooks";
import React from "react";
import { Box, Grid, Typography } from "@mui/material";
import {
  IconClearStyled,
  InputSize,
  PopoverPure,
  TextField,
  TGItemJSXInterface,
  ToggleButtonGroup,
} from "../../";
import { Button } from "../../../index";
import { NFTDepositViewProps } from "./Interface";
import * as _ from "lodash";
import { NFTInput } from "./BasicANFTTrade";
import { NFTType } from "@loopring-web/loopring-sdk";
const NFT_TYPE: TGItemJSXInterface[] = [
  {
    value: NFTType.ERC1155,
    JSX: <>ERC1155</>,
    tlabel: "ERC1155", // after 18n
    disabled: false,
  },
  {
    value: NFTType.ERC721,
    JSX: <>ERC721</>,
    tlabel: "ERC721", // after 18n
    disabled: false,
  },
];
export const DepositNFTWrap = <T extends TradeNFT<I>, I>({
  disabled,
  walletMap,
  tradeData,
  coinMap,
  title,
  description,
  btnInfo,
  handleOnNFTDataChange,
  nftDepositBtnStatus,
  isNFTCheckLoading,
  onNFTDepositClick,
  wait = globalSetup.wait,
}: NFTDepositViewProps<T, I>) => {
  const { t } = useTranslation(["common"]);
  const popupState = usePopupState({
    variant: "popover",
    popupId: `popupId-nftDeposit`,
  });
  // const [tradeData, setNFTData] = React.useState<T>(() => ({
  //   tokenAddress: undefined,
  //   nftId: undefined,
  //   ...inputTradeData,
  // }));
  const inputBtnRef = React.useRef();

  const getDisabled = () => {
    return (
      disabled ||
      tradeData === undefined ||
      walletMap === undefined ||
      coinMap === undefined
    );
  };

  const debounceNFTDataChange = _.debounce((_tradeData: T) => {
    if (handleOnNFTDataChange) {
      handleOnNFTDataChange({ tradeData, ..._tradeData });
    }
  }, wait);

  // const handleClear = React.useCallback(() => {
  //   // @ts-ignore
  //   setAddress("");
  // }, []);
  const _handleOnNFTDataChange = (tradeData: T) => {
    // const address = event.target.value;
    debounceNFTDataChange(tradeData);
  };

  // @ts-ignore
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
            {title ? title : t("nftDepositTitle")}
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
              i18nKey={description ? description : "nftDepositDescription"}
            >
              Once your nftDeposit is confirmed on Ethereum, it will be added to
              your balance within 2 minutes.
            </Trans>
          </Typography>
        </PopoverPure>
      </Grid>

      <Grid item marginTop={2} alignSelf={"stretch"}>
        <Box
          display={"inline-flex"}
          alignItems={"center"}
          justifyContent={"space-between"}
          position={"relative"}
        >
          <TextField
            value={tradeData?.tokenAddress}
            label={"nft contract address"}
            placeholder={t("depositNFTAddressLabelPlaceholder")}
            onChange={(event) =>
              _handleOnNFTDataChange({ tokenAddress: event.target?.value } as T)
            }
            fullWidth={true}
          />
          {tradeData.tokenAddress !== "" ? (
            isNFTCheckLoading ? (
              <LoadingIcon
                width={24}
                style={{ top: "32px", right: "8px", position: "absolute" }}
              />
            ) : (
              <IconClearStyled
                color={"inherit"}
                size={"small"}
                style={{ top: "30px" }}
                aria-label="Clear"
                onClick={() =>
                  _handleOnNFTDataChange({ tokenAddress: "" } as T)
                }
              >
                <CloseIcon />
              </IconClearStyled>
            )
          ) : (
            ""
          )}
        </Box>
      </Grid>
      <Grid item marginTop={2} alignSelf={"stretch"}>
        <Box
          display={"inline-flex"}
          alignItems={"center"}
          justifyContent={"space-between"}
          position={"relative"}
        >
          <TextField
            value={tradeData.nftIdView}
            label={"nft contract address"}
            placeholder={t("depositNFTAddressLabelPlaceholder")}
            onChange={(event) =>
              _handleOnNFTDataChange({ nftIdView: event.target?.value } as T)
            }
            helperText={tradeData.nftId}
            fullWidth={true}
          />
          {tradeData.tokenAddress !== "" ? (
            isNFTCheckLoading ? (
              <LoadingIcon
                width={24}
                style={{ top: "32px", right: "8px", position: "absolute" }}
              />
            ) : (
              <IconClearStyled
                color={"inherit"}
                size={"small"}
                style={{ top: "30px" }}
                aria-label="Clear"
                onClick={() => _handleOnNFTDataChange({ nftId: "" } as T)}
              >
                <CloseIcon />
              </IconClearStyled>
            )
          ) : (
            ""
          )}
        </Box>
      </Grid>
      <Grid item marginTop={2} alignSelf={"stretch"}>
        <ToggleButtonGroup
          exclusive
          {...{
            tgItemJSXs: NFT_TYPE,
            value: tradeData?.nftType ?? "0",
          }}
          onChange={(_e, value) =>
            _handleOnNFTDataChange({ nftType: value } as T)
          }
          size={"medium"}
        />
      </Grid>
      <Grid item marginTop={2} alignSelf={"stretch"}>
        <NFTInput
          {...({ t } as any)}
          isThumb={true}
          inputNFTDefaultProps={{
            size: InputSize.small,
            label: t("labelTokenAmount"),
          }}
          disabled={false}
          type={"NFT"}
          inputNFTRef={inputBtnRef}
          onChangeEvent={(_index, data) =>
            _handleOnNFTDataChange({
              tradeValue: data.tradeData?.tradeValue ?? "0",
            } as T)
          }
          tradeData={tradeData as any}
          walletMap={walletMap}
        />
      </Grid>
      <Grid item marginTop={2} alignSelf={"stretch"}>
        <Button
          fullWidth
          variant={"contained"}
          size={"medium"}
          color={"primary"}
          onClick={() => {
            onNFTDepositClick(tradeData);
          }}
          loading={
            !getDisabled() && nftDepositBtnStatus === TradeBtnStatus.LOADING
              ? "true"
              : "false"
          }
          disabled={
            getDisabled() ||
            nftDepositBtnStatus === TradeBtnStatus.DISABLED ||
            nftDepositBtnStatus === TradeBtnStatus.LOADING
          }
        >
          {btnInfo ? t(btnInfo.label, btnInfo.params) : t(`nftDepositLabelBtn`)}
        </Button>
      </Grid>
    </Grid>
  );
};
