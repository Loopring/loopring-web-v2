import { Trans, useTranslation } from "react-i18next";
import { bindPopper, usePopupState } from "material-ui-popup-state/hooks";
import React, { useState } from "react";
import { Box, Grid, Typography } from "@mui/material";
import {
  CollectionMeta,
  CollectionMetaJSON,
  copyToClipBoard,
  Info2Icon,
  TOAST_TIME,
  TradeBtnStatus,
} from "@loopring-web/common-resources";
import { bindHover } from "material-ui-popup-state/es";
import { Button, PopoverPure, TextareaAutosizeStyled } from "../../basic-lib";
import { CollectionAdvanceProps } from "../Interface";
import styled from "@emotion/styled";
import { useSettings } from "../../../stores";
import { Toast, ToastType } from "../../toast";

const GridStyle = styled(Grid)`
  .coinInput-wrap {
    border: 1px solid var(--color-border);
  }

  .MuiInputLabel-root {
    font-size: ${({ theme }) => theme.fontDefault.body2};
  }
` as typeof Grid;
export const CollectionAdvanceWrap = <T extends Partial<CollectionMeta>>({
  handleDataChange,
  btnInfo,
  btnStatus,
  disabled = false,
  allowTrade,
  metaData,
  onSubmitClick,
}: CollectionAdvanceProps<T>) => {
  const { t } = useTranslation(["common"]);
  const { isMobile } = useSettings();
  const styles = isMobile
    ? { flex: 1, width: "var(--swap-box-width)" }
    : { width: "var(--modal-width)" };
  const [copyToastOpen, setCopyToastOpen] = useState({
    isShow: false,
    type: "json",
  });
  const popupState = usePopupState({
    variant: "popover",
    popupId: `popupId-nftMint`,
  });
  const getDisabled = React.useMemo(() => {
    return (
      disabled ||
      allowTrade.collectionNFT === true ||
      btnStatus === TradeBtnStatus.DISABLED
    );
  }, [disabled, btnStatus]);
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
          marginBottom={2}
        >
          <Typography component={"h4"} variant={"h3"} marginRight={1}>
            {t("labelCollectionMetaTitle")}
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
            This is a quick way to import Collection metaData information,
            please make sure the metaData json include name & tileUri
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
        <Trans i18nKey={"labelCollectionAdvanceJSON"}>
          NFT Collection information follow this format
        </Trans>
        <Typography
          variant={"inherit"}
          color={"var(--color-primary)"}
          marginLeft={1}
          onClick={() => {
            const metaDemo: Partial<CollectionMetaJSON> = {
              banner_uri: "ipfs://`${cid  (storage image type media)}`",
              avatar_uri: "ipfs://`${cid  (storage image type media)}`",
              tile_uri: "ipfs://`${cid  (storage image type media)}`",
              name: "`${COLLECTION_NAME (string, required)}`",
              description: "`${COLLECTION_DESCRIPTION}`",
            };
            copyToClipBoard(JSON.stringify(metaDemo));
            setCopyToastOpen({ isShow: true, type: "json" });
          }}
        >
          {t("labelCopyDemo")}
        </Typography>
      </Typography>
      <TextareaAutosizeStyled
        minRows={15}
        maxRows={20}
        style={{
          overflowX: "hidden",
          resize: "vertical",
          width: "100%",
        }}
        placeholder={`Please input a validate JSON format collection metadata information, name and tileUri is required.`}
        onChange={(_event) => {
          const value = _event.target.value;
          handleDataChange(value ?? "");
        }}
        value={metaData}
      />
      <Grid item marginTop={3} alignSelf={"stretch"}>
        <Button
          fullWidth
          variant={"contained"}
          size={"medium"}
          color={"primary"}
          onClick={async () => {
            await onSubmitClick();
          }}
          loading={
            !getDisabled && btnStatus === TradeBtnStatus.LOADING
              ? "true"
              : "false"
          }
          disabled={getDisabled || btnStatus === TradeBtnStatus.LOADING}
        >
          {btnInfo
            ? t(btnInfo.label, { ns: ["error", "common"], ...btnInfo.params })
            : t(`labelCollectionCreatBtn`)}
        </Button>
      </Grid>
      <Toast
        alertText={
          copyToastOpen.type === "json"
            ? t("labelCopyMetaClip")
            : copyToastOpen.type === "url"
            ? t("labelCopyUrlClip")
            : t("labelCopyAddClip")
        }
        open={copyToastOpen.isShow}
        autoHideDuration={TOAST_TIME}
        onClose={() => {
          setCopyToastOpen({ isShow: false, type: "" });
        }}
        severity={ToastType.success}
      ></Toast>
    </GridStyle>
  );
};
