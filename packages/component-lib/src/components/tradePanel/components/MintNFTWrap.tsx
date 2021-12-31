import { NFTMintViewProps } from "./Interface";
import { Trans, useTranslation } from "react-i18next";
import { bindPopper, usePopupState } from "material-ui-popup-state/hooks";
import React from "react";
import * as _ from "lodash";
import { Box, Grid, Typography } from "@mui/material";
import {
  CloseIcon,
  HelpIcon,
  IPFS_META_URL,
  LoadingIcon,
  TradeNFT,
} from "@loopring-web/common-resources";
import { bindHover } from "material-ui-popup-state/es";
import {
  Button,
  EmptyDefault,
  InputSize,
  PopoverPure,
  TextField,
} from "../../basic-lib";
import { IconClearStyled } from "./Styled";
import { NFTInput } from "./BasicANFTTrade";
import { LOOPRING_URLs } from "@loopring-web/loopring-sdk";
import { TradeBtnStatus } from "../Interface";
import { GridStyle } from "components";

export const MintNFTWrap = <T extends TradeNFT<I>, I>({
  disabled,
  walletMap,
  tradeData,
  coinMap,
  title,
  description,
  btnInfo,
  handleOnNFTDataChange,
  nftMintBtnStatus,
  isNFTCheckLoading,
  onNFTMintClick,
}: NFTMintViewProps<T, I>) => {
  const { t } = useTranslation(["common"]);
  const popupState = usePopupState({
    variant: "popover",
    popupId: `popupId-nftMint`,
  });
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
      handleOnNFTDataChange({ ...tradeData, ..._tradeData });
    }
  }, 0);

  const _handleOnNFTDataChange = (tradeData: T) => {
    debounceNFTDataChange(tradeData);
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
            {title ? title : t("nftMintTitle")}
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
            <Trans i18nKey={description ? description : "nftMintDescription"}>
              Once your nftMint is confirmed on Ethereum, it will be added to
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
              {"ERC1155"}
              {/*NFTType.ERC1155*/}
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
                    label: t("labelNFTMintInputTitle"),
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
            onNFTMintClick(tradeData);
          }}
          loading={
            !getDisabled() && nftMintBtnStatus === TradeBtnStatus.LOADING
              ? "true"
              : "false"
          }
          disabled={
            getDisabled() ||
            nftMintBtnStatus === TradeBtnStatus.DISABLED ||
            nftMintBtnStatus === TradeBtnStatus.LOADING
          }
        >
          {btnInfo ? t(btnInfo.label, btnInfo.params) : t(`labelNFTMintBtn`)}
        </Button>
      </Grid>
    </GridStyle>
  );
};
