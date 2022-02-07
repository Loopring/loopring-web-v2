import {
  CloseIcon,
  HelpIcon,
  TradeNFT,
  LoadingIcon,
  IPFS_META_URL,
} from "@loopring-web/common-resources";
import { TradeBtnStatus } from "../Interface";
import { Trans, useTranslation } from "react-i18next";
import { bindHover } from "material-ui-popup-state/es";
import { bindPopper, usePopupState } from "material-ui-popup-state/hooks";
import React from "react";
import { Box, Grid, Typography } from "@mui/material";
import {
  EmptyDefault,
  IconClearStyled,
  InputSize,
  PopoverPure,
  TextField,
  TGItemData,
  ToggleButtonGroup,
} from "../../";
import { Button } from "../../../index";
import { NFTDepositViewProps } from "./Interface";
import { NFTInput } from "./BasicANFTTrade";
import { LOOPRING_URLs, NFTType } from "@loopring-web/loopring-sdk";
import styled from "@emotion/styled";
const GridStyle = styled(Grid)`
  .coinInput-wrap {
    .input-wrap {
      //background: var(--field-opacity);
      border-radius: ${({ theme }) => theme.unit / 2}px;
      border: 1px solid var(--color-border);
    }
  }
  .MuiInputLabel-root {
    font-size: ${({ theme }) => theme.fontDefault.body2};
  }
` as typeof Grid;
const NFT_TYPE: TGItemData[] = [
  {
    value: NFTType.ERC1155,
    key: "ERC1155",
    label: "ERC1155",
    disabled: false,
  },
  {
    value: NFTType.ERC721,
    key: "ERC721",
    label: "ERC721", // after 18n
    disabled: false,
  },
];

export const DepositNFTWrap = <T extends TradeNFT<I>, I>({
  disabled,
  walletMap,
  tradeData,
  title,
  description,
  btnInfo,
  handleOnNFTDataChange,
  nftDepositBtnStatus,
  isNFTCheckLoading,
  onNFTDepositClick,
}: // wait = globalSetup.wait,
NFTDepositViewProps<T, I>) => {
  const { t } = useTranslation(["common"]);
  const popupState = usePopupState({
    variant: "popover",
    popupId: `popupId-nftDeposit`,
  });
  const inputBtnRef = React.useRef();

  const getDisabled = React.useMemo(() => {
    if (disabled || nftDepositBtnStatus === TradeBtnStatus.DISABLED) {
      return true;
    } else {
      return false;
    }
  }, [nftDepositBtnStatus, disabled]);

  React.useMemo(() => {
    if (disabled || nftDepositBtnStatus === TradeBtnStatus.DISABLED) {
      return true;
    } else {
      return false;
    }
  }, [nftDepositBtnStatus, disabled]);

  const _handleOnNFTDataChange = (_tradeData: T) => {
    if (handleOnNFTDataChange) {
      handleOnNFTDataChange({ ...tradeData, ..._tradeData });
    }
  };

  // @ts-ignore
  return (
    <GridStyle
      className={walletMap ? "" : "loading"}
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
          display={"flex"}
          alignItems={"center"}
          justifyContent={"space-between"}
          position={"relative"}
        >
          <TextField
            value={tradeData?.tokenAddress}
            label={t("labelNFTContractAddress")}
            placeholder={t("depositNFTAddressLabelPlaceholder")}
            onChange={(event) =>
              _handleOnNFTDataChange({ tokenAddress: event.target?.value } as T)
            }
            fullWidth={true}
          />
          {tradeData.tokenAddress && tradeData.tokenAddress !== "" ? (
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
          display={"flex"}
          alignItems={"center"}
          justifyContent={"space-between"}
          position={"relative"}
        >
          <TextField
            value={tradeData.nftIdView}
            label={t("labelNFTTId")}
            placeholder={t("depositNFTAddressLabelPlaceholder")}
            onChange={(event) =>
              _handleOnNFTDataChange({
                nftIdView: event.target?.value,
                nftId: "",
              } as T)
            }
            helperText={
              <Typography
                variant={"body2"}
                component={"span"}
                textAlign={"left"}
                display={"inherit"}
              >
                {tradeData.nftId}
              </Typography>
            }
            fullWidth={true}
          />
          {tradeData.nftIdView && tradeData.nftIdView !== "" ? (
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
                  _handleOnNFTDataChange({ nftIdView: "", nftId: "" } as T)
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
          display={"flex"}
          flexDirection={"row"}
          justifyContent={"space-between"}
          alignContent={"center"}
        >
          <Box>
            <Box>
              <Typography
                color={"textSecondary"}
                marginBottom={1}
                variant={"body2"}
              >
                {t("labelNFTType")}
              </Typography>
              <ToggleButtonGroup
                exclusive
                fullWidth
                {...{
                  data: NFT_TYPE,
                  value: tradeData?.nftType ?? 0,
                }}
                onChange={(_e, value) => {
                  _handleOnNFTDataChange({ nftType: value } as T);
                }}
                size={"medium"}
              />
            </Box>
            <Box
              marginTop={2}
              display={"flex"}
              alignItems={"center"}
              justifyContent={"center"}
            >
              {isNFTCheckLoading ? (
                <LoadingIcon fontSize={"large"} />
              ) : (
                <NFTInput
                  {...({ t } as any)}
                  isThumb={false}
                  inputNFTDefaultProps={{
                    size: InputSize.small,
                    label: t("labelNFTDepositInputTitle"),
                  }}
                  disabled={
                    tradeData.nftId &&
                    tradeData.tokenAddress &&
                    tradeData.balance !== undefined
                      ? true
                      : false
                  }
                  type={"NFT"}
                  inputNFTRef={inputBtnRef}
                  onChangeEvent={(_index, data) =>
                    _handleOnNFTDataChange({
                      tradeValue: data.tradeData?.tradeValue ?? "0",
                    } as T)
                  }
                  tradeData={
                    {
                      ...tradeData,
                      belong: tradeData?.tokenAddress ?? undefined,
                    } as any
                  }
                  walletMap={walletMap}
                />
              )}
            </Box>
          </Box>
          <Box
            flex={1}
            display={"flex"}
            justifyContent={"center"}
            alignItems={"center"}
          >
            {tradeData.image ? (
              <img
                alt={"NFT"}
                width={"100%"}
                height={"100%"}
                src={tradeData?.image?.replace(
                  IPFS_META_URL,
                  LOOPRING_URLs.IPFS_META_URL
                )}
              />
            ) : isNFTCheckLoading ? (
              <LoadingIcon fontSize={"large"} />
            ) : (
              <EmptyDefault
                height={"100%"}
                message={() => (
                  <Box
                    flex={1}
                    display={"flex"}
                    alignItems={"center"}
                    justifyContent={"center"}
                  >
                    {t("labelNoContent")}
                  </Box>
                )}
              />
            )}
          </Box>
        </Box>
      </Grid>

      <Grid item marginTop={2} alignSelf={"stretch"}></Grid>

      <Grid item marginTop={3} alignSelf={"stretch"}>
        <Button
          fullWidth
          variant={"contained"}
          size={"medium"}
          color={"primary"}
          onClick={() => {
            onNFTDepositClick(tradeData);
          }}
          loading={
            !getDisabled && nftDepositBtnStatus === TradeBtnStatus.LOADING
              ? "true"
              : "false"
          }
          disabled={
            getDisabled || nftDepositBtnStatus === TradeBtnStatus.LOADING
          }
        >
          {btnInfo ? t(btnInfo.label, btnInfo.params) : t(`labelNFTDepositBtn`)}
        </Button>
      </Grid>
    </GridStyle>
  );
};
