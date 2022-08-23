import { Box, FormLabel, Grid, TextField, Typography } from "@mui/material";
import React from "react";
import {
  BtnInfo,
  Button,
  ImageUploadWrapper,
  IpfsFile,
  IPFSSourceUpload,
  TextareaAutosizeStyled,
} from "../../basic-lib";
import { Trans, useTranslation } from "react-i18next";
import { CollectionMeta } from "@loopring-web/common-resources";
import { useSettings } from "../../../stores";
import { TradeBtnStatus } from "../Interface";
export type CreateCollectionViewProps<Co> = {
  keys: { [key: string]: undefined | IpfsFile };
  onFilesLoad: (key: string, value: IpfsFile) => void;
  onDelete: (key: string) => void;
  btnStatus: TradeBtnStatus;
  btnInfo?: BtnInfo;
  disabled?: boolean;
  onSubmitClick: () => Promise<void>;
  handleOnDataChange: (key: string, value: any) => void;
  collectionValue: Co;
};

export const CreateCollectionWrap = <T extends Partial<CollectionMeta>>({
  keys,
  onFilesLoad,
  onDelete,
  btnStatus,
  btnInfo,
  disabled,
  handleOnDataChange,
  collectionValue,
  onSubmitClick,
}: CreateCollectionViewProps<T>) => {
  const { t } = useTranslation("common");
  const getDisabled = React.useMemo(() => {
    return disabled || btnStatus === TradeBtnStatus.DISABLED;
  }, [disabled, btnStatus]);

  const { isMobile } = useSettings();
  return (
    <ImageUploadWrapper
      flex={1}
      alignItems={"stretch"}
      display={"flex"}
      justifyContent={"flex-start"}
      flexDirection={"column"}
      marginBottom={2}
      padding={5 / 2}
    >
      <Typography
        component={"h4"}
        variant={"body1"}
        textAlign={"left"}
        marginBottom={1}
        color={"var(--color-text-third)"}
      >
        {t("labelBanner")}
      </Typography>

      <Grid container flex={1} marginBottom={2}>
        <Grid item xs={12} position={"relative"}>
          <IPFSSourceUpload
            height={"30vw"}
            typographyProps={{}}
            buttonProps={{}}
            // maxSize={MaxSize}
            // title={"Banner  (1500 x 500) size "}
            buttonText={""}
            value={keys?.banner ?? undefined}
            onDelete={() => {
              onDelete("banner");
            }}
            onChange={(value) => {
              onFilesLoad("banner", value);
            }}
          />
        </Grid>
      </Grid>
      <Grid container flex={1} spacing={2}>
        <Grid
          item
          xs={12}
          md={2}
          lg={2}
          position={"relative"}
          display={"flex"}
          flexDirection={isMobile ? "column" : "row"}
          justifyContent={"space-between"}
        >
          <Box marginBottom={isMobile ? "2" : "0"}>
            <Typography
              component={"h4"}
              variant={"body1"}
              textAlign={"left"}
              marginBottom={1}
              color={"var(--color-text-third)"}
            >
              {t("labelAvatar")}
            </Typography>
            <IPFSSourceUpload
              typographyProps={{}}
              buttonProps={{}}
              width={120}
              height={120}
              // maxSize={MaxSize}
              title={"labelAvatarDes"}
              buttonText={""}
              value={keys?.avatar ?? undefined}
              onDelete={() => {
                onDelete("avatar");
              }}
              onChange={(value) => {
                onFilesLoad("avatar", value);
              }}
            />
          </Box>
        </Grid>
        <Grid
          item
          xs={12}
          md={4}
          lg={3}
          position={"relative"}
          display={"flex"}
          flexDirection={isMobile ? "column" : "row"}
          justifyContent={"space-between"}
        >
          <Box width={"100%"}>
            <Typography
              component={"span"}
              variant={"body1"}
              color={"var(--color-text-third)"}
              marginBottom={1}
            >
              <Trans i18nKey={"labelTileUri"}>
                Tile (320px * 320px)
                <Typography
                  component={"span"}
                  variant={"inherit"}
                  color={"error"}
                >
                  {"\uFE61"}
                </Typography>
              </Trans>
            </Typography>
            <IPFSSourceUpload
              typographyProps={{}}
              buttonProps={{}}
              width={"100%"}
              // title={t("labelTileUri")}
              buttonText={""}
              value={keys?.tileUri ?? undefined}
              onDelete={() => {
                onDelete("tileUri");
              }}
              onChange={(value) => {
                onFilesLoad("tileUri", value);
              }}
            />
          </Box>
        </Grid>

        <Grid
          item
          xs={12}
          md={6}
          lg={7}
          display={"flex"}
          flexDirection={"column"}
          position={"relative"}
        >
          <Box
            display={"flex"}
            flexDirection={"column"}
            alignItems={"center"}
            marginBottom={2}
          >
            <TextField
              value={collectionValue?.name ?? ""}
              inputProps={{ maxLength: 28 }}
              fullWidth
              label={
                <Typography
                  component={"span"}
                  variant={"body1"}
                  color={"var(--color-text-third)"}
                >
                  <Trans i18nKey={"labelCollectionName"}>
                    Collection Name
                    <Typography
                      component={"span"}
                      variant={"inherit"}
                      color={"error"}
                    >
                      {"\uFE61"}
                    </Typography>
                  </Trans>
                </Typography>
              }
              type={"text"}
              onChange={(e: React.ChangeEvent<{ value: string }>) =>
                handleOnDataChange("name", e.target.value)
              }
            />
          </Box>
          <FormLabel>
            <Typography
              component={"h4"}
              variant={"body1"}
              textAlign={"left"}
              marginBottom={1}
              color={"var(--color-text-third)"}
            >
              <Trans i18nKey={"labelCollectionDescription"}>Description</Trans>
            </Typography>
          </FormLabel>
          <Box flex={1}>
            <TextareaAutosizeStyled
              aria-label="Description"
              minRows={2}
              style={{
                overflowX: "hidden",
                resize: "vertical",
                height: "100%",
                margin: 0,
              }}
              maxLength={1000}
              onChange={(event) =>
                handleOnDataChange("description", event.target.value)
              }
              draggable={true}
            />
          </Box>
        </Grid>

        <Grid item xs={12}>
          <Button
            variant={"contained"}
            size={"medium"}
            color={"primary"}
            fullWidth
            loading={
              !getDisabled && btnStatus === TradeBtnStatus.LOADING
                ? "true"
                : "false"
            }
            disabled={getDisabled || btnStatus === TradeBtnStatus.LOADING}
            // disabled={isLoading ||}
            onClick={() => {
              onSubmitClick();
            }}
          >
            {btnInfo
              ? t(btnInfo.label, btnInfo.params)
              : t(`labelCollectionCreateBtn`)}
          </Button>
        </Grid>
      </Grid>
    </ImageUploadWrapper>
  );
};
