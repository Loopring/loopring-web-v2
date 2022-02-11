import { NFTMintViewProps } from "./Interface";
import { Trans, useTranslation } from "react-i18next";
import { bindPopper, usePopupState } from "material-ui-popup-state/hooks";
import React from "react";
import { Box, Grid, Typography } from "@mui/material";
import {
  CloseIcon,
  EmptyValueTag,
  FeeInfo,
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
  TGItemData,
  ToggleButtonGroup,
} from "../../basic-lib";
import {
  DropdownIconStyled,
  FeeTokenItemWrapper,
  IconClearStyled,
} from "./Styled";
import { NFTInput } from "./BasicANFTTrade";
import { LOOPRING_URLs, NFTType } from "@loopring-web/loopring-sdk";
import { TradeBtnStatus } from "../Interface";
import styled from "@emotion/styled";
import { FeeToggle } from "./tool/FeeList";

const GridStyle = styled(Grid)`
  .coinInput-wrap {
    border: 1px solid var(--color-border);
    // .input-wrap {
    //   //background: var(--field-opacity);
    //   border-radius: ${({ theme }) => theme.unit / 2}px;
    //
    // }
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
    disabled: true,
  },
];
export const MintNFTWrap = <T extends TradeNFT<I>, I, C extends FeeInfo>({
  disabled,
  walletMap,
  tradeData,
  title,
  description,
  btnInfo,
  handleOnNFTDataChange,
  nftMintBtnStatus,
  isFeeNotEnough,
  handleFeeChange,
  chargeFeeTokenList,
  feeInfo,
  isAvaiableId,
  isNFTCheckLoading,
  onNFTMintClick,
}: NFTMintViewProps<T, I, C>) => {
  const { t } = useTranslation(["common"]);
  const popupState = usePopupState({
    variant: "popover",
    popupId: `popupId-nftMint`,
  });
  const inputBtnRef = React.useRef();
  const [dropdownStatus, setDropdownStatus] = React.useState<"up" | "down">(
    "down"
  );
  const getDisabled = React.useMemo(() => {
    return !!(disabled || nftMintBtnStatus === TradeBtnStatus.DISABLED);
  }, [disabled, nftMintBtnStatus]);

  const handleToggleChange = (value: C) => {
    if (handleFeeChange) {
      handleFeeChange(value);
    }
  };
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
            <IconClearStyled
              color={"inherit"}
              size={"small"}
              style={{ top: "30px" }}
              aria-label="Clear"
              onClick={() => _handleOnNFTDataChange({ tokenAddress: "" } as T)}
            >
              <CloseIcon />
            </IconClearStyled>
          ) : (
            ""
          )}
        </Box>
      </Grid>
      <Grid item marginTop={2} alignSelf={"stretch"}>
        <Box
          display={"flex"}
          alignItems={"center"}
          flexDirection={"column"}
          justifyContent={"space-between"}
          position={"relative"}
        >
          <TextField
            value={tradeData.nftIdView}
            label={t("labelNFTTId")}
            placeholder={t("mintNFTAddressLabelPlaceholder")}
            onChange={(event) =>
              _handleOnNFTDataChange({
                nftIdView: event.target?.value,
                nftId: "",
              } as T)
            }
            // helperText={
            //   <Typography
            //     variant={"body2"}
            //     component={"span"}
            //     textAlign={"left"}
            //     display={"inherit"}
            //   >
            //     {tradeData.nftId}
            //   </Typography>
            // }
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
          {!isAvaiableId ? (
            <Typography
              color={"var(--color-error)"}
              fontSize={14}
              alignSelf={"stretch"}
              position={"relative"}
            >
              {t("labelInvalidCID")}
            </Typography>
          ) : (
            <>
              {tradeData.nftId &&
                tradeData.tokenAddress &&
                tradeData.nftIdView !== "" && (
                  <Typography
                    color={"var(--color-text-primary)"}
                    variant={"body2"}
                    whiteSpace={"break-spaces"}
                    marginTop={1 / 4}
                    component={"span"}
                    style={{ wordBreak: "break-all" }}
                  >
                    {tradeData.nftId}
                  </Typography>
                )}
            </>
          )}
        </Box>
      </Grid>
      <Grid item /* marginTop={2} */ alignSelf={"stretch"} marginTop={2}>
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
                {t("transferLabelFee")}：
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
          </>
        )}
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
              <NFTInput
                {...({ t } as any)}
                isThumb={false}
                isBalanceLimit={false}
                inputNFTDefaultProps={{
                  subLabel: "",
                  size: InputSize.small,
                  label: t("labelNFTMintInputTitle"),
                }}
                // disabled={!(tradeData.nftId && tradeData.tokenAddress)}
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
            </Box>
          </Box>
          <Box
            flex={1}
            display={"flex"}
            justifyContent={"center"}
            alignItems={"center"}
          >
            {tradeData.nftId && tradeData.image ? (
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
            !getDisabled && nftMintBtnStatus === TradeBtnStatus.LOADING
              ? "true"
              : "false"
          }
          disabled={getDisabled || nftMintBtnStatus === TradeBtnStatus.LOADING}
        >
          {btnInfo ? t(btnInfo.label, btnInfo.params) : t(`labelNFTMintBtn`)}
        </Button>
      </Grid>
    </GridStyle>
  );
};
