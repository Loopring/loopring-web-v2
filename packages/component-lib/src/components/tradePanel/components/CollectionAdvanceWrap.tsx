import { Trans, useTranslation } from "react-i18next";
import { bindPopper, usePopupState } from "material-ui-popup-state/hooks";
import React from "react";
import { Box, Grid, Typography } from "@mui/material";
import { Info2Icon, } from "@loopring-web/common-resources";
import { bindHover } from "material-ui-popup-state/es";
import { Button, PopoverPure, TextField, TGItemData, } from "../../basic-lib";
import { NFTType } from "@loopring-web/loopring-sdk";
import { CollectionAdvanceProps, TradeBtnStatus } from "../Interface";
import styled from "@emotion/styled";
import { useSettings } from "../../../stores";

const GridStyle = styled(Grid)`
  .coinInput-wrap {
    border: 1px solid var(--color-border);
  }

  .MuiInputLabel-root {
    font-size: ${({theme}) => theme.fontDefault.body2};
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
export const CollectionAdvanceWrap = <T extends any,
  >({
      handleDataChange,
      onSubmitClick,
      allowTrade,
      btnInfo,
      btnStatus,
      tradeData,
      // disabled,
      // walletMap,
      // tradeData,
      // title,
      // description,
      // btnInfo,
      // handleOnNFTDataChange,
      // nftMintBtnStatus,
      // isFeeNotEnough,
      // handleFeeChange,
      // chargeFeeTokenList,
      // feeInfo,
      // isAvaiableId,
      // isNFTCheckLoading,
      // onNFTMintClick,
    }: CollectionAdvanceProps<T>) => {
  const {t} = useTranslation(["common"]);
  const {isMobile} = useSettings();
  const styles = isMobile
    ? {flex: 1, width: "var(--swap-box-width)"}
    : {width: "var(--modal-width)"};
  const inputBtnRef = React.useRef();

  //
  const popupState = usePopupState({
    variant: "popover",
    popupId: `popupId-nftMint`,
  });
  // const [dropdownStatus, setDropdownStatus] =
  //   React.useState<"up" | "down">("down");
  // const getDisabled = React.useMemo(() => {
  //   return disabled || nftMintBtnStatus === TradeBtnStatus.DISABLED;
  // }, [disabled, nftMintBtnStatus]);

  // const handleToggleChange = (value: C) => {
  //   if (handleFeeChange) {
  //     handleFeeChange(value);
  //   }
  // };
  // const _handleOnNFTDataChange = (_tradeData: T) => {
  //   if (handleOnNFTDataChange) {
  //     handleOnNFTDataChange({ ...tradeData, ..._tradeData });
  //   }
  // };
  // myLog("mint tradeData", tradeData);

  // @ts-ignore
  return (
    <GridStyle
      // className={walletMap ? "" : "loading"}
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
            {t('labelCollectionMetaTitle')}
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
            component={"p"}
            variant={"body2"}
            whiteSpace={"pre-line"}
          >
            {/*<Trans i18nKey={description ? description : "nftMintDescription"}>*/}
            {/*  /!*Paste in the CID that you obtained from uploading the metadata*!/*/}
            {/*  /!*Information file (point 11 above) - if successful, the data from*!/*/}
            {/*  /!*the metadata Information you created contained within the folder*!/*/}
            {/*  /!*populates the Name and also the image displays.*!/*/}
            {/*</Trans>*/}
          </Typography>
        </PopoverPure>
      </Grid>
      <Typography
        component={"span"}
        display={"flex"}
        alignItems={"center"}
        alignSelf={"flex-start"}
        marginBottom={1}
        color={"textSecondary"}
        variant={"body2"}
      >
        <Trans i18nKey={"labelCollectionAdvanceCID"}>
          IPFS CID
        </Trans>
      </Typography>
      <TextField
        label={""}
        value={tradeData}
        // title={t("labelCollectionAdvanceCID")}
        error={
          !!(
            btnStatus !== TradeBtnStatus.AVAILABLE,
            tradeData.cid !== '',
            // tradeData.nftIdView !== "" &&
            // !isNFTCheckLoading &&
            // !isAvaiableId
          )
        }
        placeholder={t("mintNFTAddressLabelPlaceholder")}
        onChange={(event) =>
          handleDataChange({
            // nftIdView: event.target?.value,
            // nftId: "",
          } as T)
        }
        fullWidth={true}
      />
      <Grid item marginTop={3} alignSelf={"stretch"}>
        {btnInfo?.label === "labelNFTMintNoMetaBtn" && (
          <Typography
            color={"var(--color-warning)"}
            component={"p"}
            variant={"body1"}
            marginBottom={1}
            style={{wordBreak: "break-all"}}
          >
            <Trans i18nKey={"labelNFTMintNoMetaDetail"}>
              Your NFT metadata should identify
              <em style={{fontWeight: 600}}>
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
