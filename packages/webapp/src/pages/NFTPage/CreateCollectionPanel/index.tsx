import styled from "@emotion/styled";
import { Box, Button, FormLabel, Grid, TextField, Tooltip, Typography } from "@mui/material";
import { Trans, useTranslation } from "react-i18next";
import React from "react";
import { ImageUploadWrapper, IPFSSourceUpload, TextareaAutosizeStyled, useSettings } from "@loopring-web/component-lib";
import { useHistory } from 'react-router-dom';
import { useModalData } from '@loopring-web/core';
import { useCollectionPanel } from './hook';
import { BackIcon, Info2Icon } from '@loopring-web/common-resources';

const StyledPaper = styled(Box)`
  background: var(--color-box);
  border-radius: ${({theme}) => theme.unit}px;
`;

export const CreateCollectionPanel = () => {
  const {t} = useTranslation("common");
  const {collectionValue} = useModalData();
  // const [banner,setBanner] = React.useState('');
  // const [banner,setBanner] = React.useState('')
  const {ipfsProvides, handleOnDataChange, keys} = useCollectionPanel({isEdit: false});
  const history = useHistory();
  const {isMobile} = useSettings();
  return (
    <>
      <Box
        display={"flex"}
        justifyContent={"space-between"}
        alignItems={"center"}
        marginBottom={2}
      >
        <Button
          startIcon={<BackIcon fontSize={"small"}/>}
          variant={"text"}
          size={"medium"}
          sx={{color: "var(--color-text-secondary)"}}
          color={"inherit"}
          onClick={history.goBack}
        >
          {t("labelCollectionCreateERC1155")}
          {/*<Typography color={"textPrimary"}></Typography>*/}
        </Button>
      </Box>
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
          component={'h4'} variant={'body1'} textAlign={'left'} marginBottom={1} color={"var(--color-text-third)"}>
          {t('Banner (1500px * 500px)')}
        </Typography>

        <Grid
          container
          flex={1}
          marginBottom={2}
        >
          <Grid item xs={12} position={"relative"}>
            <IPFSSourceUpload
              height={"30vw"}
              typographyProps={{}}
              buttonProps={{}}
              maxSize={10000000}
              title={"Banner  (1500 x 500) size "}
              buttonText={''}
              value={keys?.banner ?? undefined}
              onDelete={() => {
                handleOnDataChange('banner', {banner: ''})
              }}
              onChange={(value) => {
                // handleOnDataChange('banner',{banner:_e.})
                handleOnDataChange('banner', {banner: value})
              }}
            />
          </Grid>
        </Grid>


        <Grid
          container
          flex={1}
          spacing={2}
        >


          <Grid item xs={12} md={6} position={"relative"} display={'flex'}
                flexDirection={isMobile ? 'column' : 'row'} justifyContent={'space-between'}
          >
            <Box marginBottom={isMobile ? '2' : '0'}>
              <Typography
                component={'h4'} variant={'body1'} textAlign={'left'} marginBottom={1}
                color={"var(--color-text-third)"}>
                {t('avatar (120px * 120px)')}
              </Typography>
              <IPFSSourceUpload
                typographyProps={{}}
                buttonProps={{}}
                width={120}
                height={120}
                maxSize={10000000}
                title={"avatar (120px * 120px)"}
                buttonText={''}
                value={keys?.avatar ?? undefined}
                onDelete={() => {
                  handleOnDataChange('avatar', {avatar: ''})
                }}
                onChange={(value) => {
                  // handleOnDataChange('banner',{banner:_e.})
                  handleOnDataChange('avatar', {avatar: value})
                }}
              />
            </Box>
            <Box>
              <Typography
                component={'h4'} variant={'body1'} textAlign={'left'} marginBottom={1}
                color={"var(--color-text-third)"}>
                {t('Tile (320px * 320px)')}
              </Typography>

              <IPFSSourceUpload
                typographyProps={{}}
                buttonProps={{}}
                maxSize={10000000}
                width={320}
                height={320}
                title={"Tile (320px * 320px)"}
                buttonText={''}
                value={keys?.tileUri ?? undefined}
                onDelete={() => {
                  handleOnDataChange('tileUri', {tileUri: ''})
                }}
                onChange={(value) => {
                  // handleOnDataChange('banner',{banner:_e.})
                  handleOnDataChange('tileUri', {tileUri: value})
                }}
              />
            </Box>
          </Grid>

          <Grid item display={'flex'} flexDirection={'column'} xs={12} md={6} position={"relative"}>
            <Box display={'flex'} flexDirection={'column'} alignItems={'center'} marginBottom={2}>

              <TextField
                value={collectionValue?.name ?? ''}
                inputProps={{maxLength: 28}}
                fullWidth
                label={<Trans i18nKey={"labelCollectionName"}>Collection Name</Trans>}
                type={"text"}
                onChange={(e: React.ChangeEvent<{ value: string }>) => handleOnDataChange('name', e.target.value)}
              />
            </Box>

            <Box display={'flex'} flexDirection={'column'} alignItems={'center'} marginBottom={2}>
              {/*<Typography component={'h4'} variant={'body1'} textAlign={'left'} marginBottom={1} color={"var(--color-text-third)"}>*/}
              {/*  {t('labelCollectionTitle')}*/}
              {/*</Typography>*/}
              <TextField
                value={collectionValue?.collectionTitle ?? ''}
                inputProps={{maxLength: 28}}
                fullWidth
                label={<Trans i18nKey={"labelCollectionName"}>Collection Title</Trans>}
                type={"text"}
                onChange={(e: React.ChangeEvent<{ value: string }>) => handleOnDataChange('collectionTitle', e.target.value)}
              />
            </Box>
            <FormLabel>
              {/*<Tooltip*/}
              {/*  title={t("labelMintDescriptionTooltips").toString()}*/}
              {/*  placement={"top"}*/}
              {/*>*/}
              <Typography
                component={'h4'} variant={'body1'} textAlign={'left'} marginBottom={1}
                color={"var(--color-text-third)"}>
                <Trans i18nKey={"labelCollectionDescription"}>
                  Description
                </Trans>
              </Typography>
              {/*</Tooltip>*/}
            </FormLabel>
            <Box flex={1}>
              <TextareaAutosizeStyled
                aria-label="Description"
                minRows={2}
                style={{
                  overflowX: "hidden",
                  resize: "vertical",
                  height: "100%",
                  margin: 0
                }}
                maxLength={1000}
                onChange={(event) =>
                  handleOnDataChange('description', {
                    description: event.target.value,
                  })
                }
                draggable={true}
              />
            </Box>


            {/*<IPFSSourceUpload*/}
            {/*    typographyProps={{}}*/}
            {/*    buttonProps={{}}*/}
            {/*    maxSize={10000000}*/}
            {/*    title={"Tile (500px * 700px)"}*/}
            {/*    buttonText={''}*/}
            {/*    value={keys?.avatar ?? undefined}*/}
            {/*    onDelete={() => {*/}
            {/*      handleOnDataChange('avatar', {avatar: ''})*/}
            {/*    }}*/}
            {/*    onChange={(value) => {*/}
            {/*      // handleOnDataChange('banner',{banner:_e.})*/}
            {/*      handleOnDataChange('avatar', {avatar: value})*/}
            {/*    }}*/}
            {/*  />*/}
          </Grid>

          <Grid item xs={12}>
            <Button
              variant={"contained"}
              size={"medium"}
              color={"primary"}
              fullWidth
              onClick={() => {
              }}
            >
              {t("labelCollectionCreateBtn")}
            </Button>
          </Grid>
        </Grid>


      </ImageUploadWrapper>
      {/*<StyledPaper*/}
      {/*  flex={1}*/}
      {/*  className={"MuiPaper-elevation2"}*/}
      {/*  marginTop={0}*/}
      {/*  marginBottom={2}*/}
      {/*  display={"flex"}*/}
      {/*  flexDirection={"column"}*/}
      {/*>*/}
      {/*  <Box*/}
      {/*    display={"flex"}*/}
      {/*    justifyContent={"space-between"}*/}
      {/*    alignItems={"center"}*/}
      {/*    paddingX={5 / 2}*/}
      {/*    paddingTop={5 / 2}*/}
      {/*  >*/}
      {/*    <Typography component={"h3"} variant={"h4"}>*/}
      {/*      {t("labelCreateCollectionTitle")}*/}
      {/*    </Typography>*/}
      {/*  </Box>*/}
      {/*  <Box flex={1} display={"flex"}>*/}
      {/*    <Box marginLeft={1}>*/}
      {/*      <Button onClick={() => {}} variant={"outlined"} color={"primary"}>*/}
      {/*        {t("labelAdvanceCreateCollection")}*/}
      {/*      </Button>*/}
      {/*    </Box>*/}
      {/*  </Box>*/}
      {/*</StyledPaper>*/}
    </>
  );
};
