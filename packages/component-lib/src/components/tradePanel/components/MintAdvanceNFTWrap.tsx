import { NFTMintAdvanceViewProps } from "./Interface";
import { Trans, useTranslation } from "react-i18next";
import { bindPopper, usePopupState } from "material-ui-popup-state/hooks";
import React from "react";
import { Box, Grid, Typography, Link } from "@mui/material";
import {
  CloseIcon,
  EmptyValueTag,
  FeeInfo,
  HelpIcon,
  IPFS_LOOPRING_SITE,
  IPFS_META_URL,
  LoadingIcon,
  myLog,
  // MINT_LIMIT,
  TradeNFT,
} from "@loopring-web/common-resources";
import { bindHover } from "material-ui-popup-state/es";
import {
  Button,
  EmptyDefault,
  InputSize,
  NftImage,
  PopoverPure,
  TextField,
  TGItemData,
  // ToggleButtonGroup,
} from "../../basic-lib";
import {
  DropdownIconStyled,
  FeeTokenItemWrapper,
  IconClearStyled,
} from "./Styled";
import { NFTInput } from "./BasicANFTTrade";
import { NFTType } from "@loopring-web/loopring-sdk";
import { TradeBtnStatus } from "../Interface";
import styled from "@emotion/styled";
import { FeeToggle } from "./tool/FeeList";
import { useSettings } from "../../../stores";

const GridStyle = styled(Grid)`
  .coinInput-wrap {
    border: 1px solid var(--color-border);
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
];
export const MintAdvanceNFTWrap = <
  T extends TradeNFT<I>,
  I,
  C extends FeeInfo
>({
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
}: NFTMintAdvanceViewProps<T, I, C>) => {
  const { t } = useTranslation(["common"]);
  const { isMobile } = useSettings();
  const styles = isMobile
    ? { flex: 1, width: "var(--swap-box-width)" }
    : { width: "var(--modal-width)" };

  const popupState = usePopupState({
    variant: "popover",
    popupId: `popupId-nftMint`,
  });
  const inputBtnRef = React.useRef();
  const [dropdownStatus, setDropdownStatus] =
    React.useState<"up" | "down">("down");
  const getDisabled = React.useMemo(() => {
    return disabled || nftMintBtnStatus === TradeBtnStatus.DISABLED;
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
  myLog("mint tradeData", tradeData);

  // @ts-ignore
  return (
    <GridStyle
      className={walletMap ? "" : "loading"}
      style={styles}
      paddingBottom={3}
      container
      paddingLeft={5 / 2}
      paddingRight={5 / 2}
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
              Paste in the CID that you obtained from uploading the metadata
              Information file (point 11 above) - if successful, the data from
              the metadata Information you created contained within the folder
              populates the Name and also the image displays.
            </Trans>
          </Typography>
        </PopoverPure>
      </Grid>
      <Grid item marginTop={2} alignSelf={"stretch"}>
        <Box
          display={"flex"}
          alignItems={"center"}
          flexDirection={"column"}
          justifyContent={"space-between"}
          position={"relative"}
        >
          <Typography
            component={"span"}
            display={"flex"}
            alignItems={"center"}
            alignSelf={"flex-start"}
            marginBottom={1}
            color={"textSecondary"}
            variant={"body2"}
          >
            <Trans i18nKey={"labelNFTCid"}>
              IPFS CID :(Store Metadata Information),
              <Link
                target="_blank"
                rel="noopener noreferrer"
                href={"./#/document/mint_nft.md"}
                paddingLeft={1}
              >
                Follow this Guide
                <HelpIcon
                  style={{ cursor: "pointer", marginLeft: "4px" }}
                  fontSize={"medium"}
                  htmlColor={"var(--color-text-third)"}
                />
              </Link>
            </Trans>
          </Typography>
          <TextField
            value={tradeData?.nftIdView}
            label={""}
            title={t("labelNFTCid")}
            placeholder={t("mintNFTAddressLabelPlaceholder")}
            onChange={(event) =>
              _handleOnNFTDataChange({
                nftIdView: event.target?.value,
                nftId: "",
              } as T)
            }
            fullWidth={true}
          />
          {tradeData?.nftIdView && tradeData.nftIdView !== "" ? (
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
          {!isAvaiableId &&
          tradeData?.nftIdView &&
          tradeData?.nftIdView !== "" ? (
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
              {tradeData?.nftId &&
                tradeData.tokenAddress &&
                tradeData?.nftIdView !== "" && (
                  <Typography
                    color={"var(--color-text-primary)"}
                    variant={"body2"}
                    whiteSpace={"break-spaces"}
                    marginTop={1 / 4}
                    component={"span"}
                    style={{ wordBreak: "break-all" }}
                  >
                    {tradeData?.nftId}
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
                marginBottom={2}
                variant={"body1"}
                display={"flex"}
                flexDirection={"column"}
                whiteSpace={"pre-line"}
                maxWidth={240}
              >
                {t("labelNFTName") +
                  " " +
                  (tradeData?.nftId
                    ? tradeData.name ?? t("labelUnknown").toUpperCase()
                    : EmptyValueTag)}
              </Typography>
              <Typography
                color={"textSecondary"}
                marginBottom={2}
                variant={"body1"}
              >
                {t("labelNFTType") + " "} {NFT_TYPE[0].label}
              </Typography>
            </Box>
            <Box
              display={"flex"}
              alignItems={"center"}
              justifyContent={"flex-start"}
            >
              <NFTInput
                {...({ t } as any)}
                isThumb={false}
                isBalanceLimit={true}
                inputNFTDefaultProps={{
                  subLabel: t("tokenNFTMaxMINT"),
                  size: InputSize.small,
                  label: (
                    <Trans i18nKey={"labelNFTMintInputTitle"}>
                      Amount
                      <Typography
                        component={"span"}
                        variant={"inherit"}
                        color={"error"}
                      >
                        {"\uFE61"}
                      </Typography>
                    </Trans>
                  ),
                }}
                // disabled={!(tradeData?.nftId && tradeData.tokenAddress)}
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
                    belong: tradeData?.tokenAddress ?? "NFT",
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
            width={160}
            height={160}
          >
            {tradeData?.nftId && tradeData.image ? (
              <NftImage
                alt={"NFT"}
                src={tradeData?.image?.replace(
                  IPFS_META_URL,
                  IPFS_LOOPRING_SITE
                )}
                onError={() => undefined}
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
        {btnInfo?.label === "labelNFTMintNoMetaBtn" && (
          <Typography
            color={"var(--color-warning)"}
            component={"p"}
            variant={"body1"}
            marginBottom={1}
            style={{ wordBreak: "break-all" }}
          >
            <Trans i18nKey={"labelNFTMintNoMetaDetail"}>
              Your NFT metadata should identify
              <em style={{ fontWeight: 600 }}>
                name, image & royalty_percentage(number from 0 to 10)
              </em>
              .
            </Trans>
          </Typography>
        )}
        <Button
          fullWidth
          variant={"contained"}
          size={"medium"}
          color={"primary"}
          onClick={async () => {
            await onNFTMintClick(tradeData);
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
