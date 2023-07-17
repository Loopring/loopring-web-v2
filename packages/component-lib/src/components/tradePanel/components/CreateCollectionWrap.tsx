import { Box, FormLabel, Grid, Tooltip, Typography } from '@mui/material'
import React from 'react'
import {
  BtnInfo,
  Button,
  ImageUploadWrapper,
  IpfsFile,
  IPFSSourceUpload,
  TextareaAutosizeStyled,
  TextField,
} from '../../basic-lib'
import { Trans, useTranslation } from 'react-i18next'
import {
  CollectionMeta,
  GET_IPFS_STRING,
  htmlDecode,
  Info2Icon,
  TradeBtnStatus,
} from '@loopring-web/common-resources'
import { useSettings } from '../../../stores'

export type CreateCollectionViewProps<Co> = {
  keys: { [key: string]: undefined | IpfsFile }
  onFilesLoad: (key: string, value: IpfsFile) => void
  onDelete: (key: string) => void
  btnStatus: TradeBtnStatus
  resetEdit?: () => void
  btnInfo?: BtnInfo
  isEdit?: boolean
  disabled?: boolean
  onSubmitClick: () => Promise<void>
  handleOnDataChange: (key: string, value: any) => void
  collectionValue: Co
  getIPFSString: GET_IPFS_STRING
  baseURL: string
}

export const CreateCollectionWrap = <T extends Partial<CollectionMeta>>({
  keys,
  onFilesLoad,
  onDelete,
  btnStatus,
  btnInfo,
  isEdit,
  resetEdit,
  disabled,
  handleOnDataChange,
  collectionValue,
  onSubmitClick,
  getIPFSString,
  baseURL,
}: CreateCollectionViewProps<T>) => {
  const { t } = useTranslation('common')
  const getDisabled = React.useMemo(() => {
    return disabled || btnStatus === TradeBtnStatus.DISABLED
  }, [disabled, btnStatus])

  const { isMobile } = useSettings()
  return (
    <ImageUploadWrapper
      flex={1}
      alignItems={'stretch'}
      display={'flex'}
      justifyContent={'center'}
      flexDirection={'column'}
      marginBottom={2}
      padding={5 / 2}
      maxWidth={680}
    >
      <Grid container flex={1} spacing={2}>
        <Grid
          item
          xs={12}
          position={'relative'}
          display={'flex'}
          flexDirection={isMobile ? 'column' : 'row'}
          justifyContent={'space-between'}
        >
          <Box>
            <Typography
              component={'span'}
              variant={'body1'}
              display={'inline-flex'}
              color={'var(--color-text-secondary)'}
              marginBottom={1}
            >
              <Trans i18nKey={'labelTileUri'}>
                Tile (Dimensions: 5:7)
                <Typography component={'span'} variant={'inherit'} color={'error'}>
                  {'\uFE61'}
                </Typography>
              </Trans>
            </Typography>
            <Box width={isMobile ? '100%' : 180}>
              <IPFSSourceUpload
                typographyProps={{}}
                buttonProps={{}}
                height={'calc( 100% * 7 / 5)'}
                getIPFSString={getIPFSString}
                baseURL={baseURL}
                buttonText={''}
                value={keys?.tileUri ?? undefined}
                onDelete={() => {
                  onDelete('tileUri')
                }}
                onChange={(value) => {
                  onFilesLoad('tileUri', value)
                }}
              />
            </Box>
          </Box>
        </Grid>

        <Grid
          item
          xs={12}
          position={'relative'}
          display={'flex'}
          flexDirection={isMobile ? 'column' : 'row'}
          justifyContent={'space-between'}
        >
          <Box marginBottom={isMobile ? '2' : '0'}>
            <Typography
              component={'h4'}
              variant={'body1'}
              textAlign={'left'}
              marginBottom={1}
              color={'var(--color-text-secondary)'}
            >
              {t('labelAvatar')}
            </Typography>
            <Box width={isMobile ? '100%' : 100}>
              <IPFSSourceUpload
                typographyProps={{}}
                buttonProps={{}}
                height={'100%'}
                getIPFSString={getIPFSString}
                baseURL={baseURL}
                title={'labelAvatarDes'}
                buttonText={''}
                value={keys?.avatar ?? undefined}
                onDelete={() => {
                  onDelete('avatar')
                }}
                onChange={(value) => {
                  onFilesLoad('avatar', value)
                }}
              />
            </Box>
          </Box>
        </Grid>

        <Grid item xs={12} position={'relative'}>
          <Typography
            component={'h4'}
            variant={'body1'}
            textAlign={'left'}
            marginBottom={1}
            color={'var(--color-text-secondary)'}
          >
            {t('labelBanner')}
          </Typography>
          <Box maxWidth={400}>
            <IPFSSourceUpload
              height={'calc( 100%/ 3)'}
              typographyProps={{}}
              buttonProps={{}}
              getIPFSString={getIPFSString}
              baseURL={baseURL}
              buttonText={''}
              value={keys?.banner ?? undefined}
              onDelete={() => {
                onDelete('banner')
              }}
              onChange={(value) => {
                onFilesLoad('banner', value)
              }}
            />
          </Box>
        </Grid>
        <Grid item xs={12} display={'flex'} flexDirection={'column'} position={'relative'}>
          <Box display={'flex'} flexDirection={'column'} alignItems={'center'} marginBottom={2}>
            <TextField
              value={collectionValue?.name ? htmlDecode(collectionValue.name ?? '').toString() : ''}
              inputProps={{ maxLength: 28 }}
              fullWidth
              label={
                <Typography
                  component={'span'}
                  variant={'body1'}
                  color={'var(--color-text-secondary)'}
                  marginBottom={1}
                >
                  <Trans i18nKey={'labelCollectionName'}>
                    Collection Name
                    <Typography component={'span'} variant={'inherit'} color={'error'}>
                      {'\uFE61'}
                    </Typography>
                  </Trans>
                </Typography>
              }
              type={'text'}
              onChange={(e: React.ChangeEvent<{ value: string }>) =>
                handleOnDataChange('name', e.target.value)
              }
            />
          </Box>
        </Grid>
        <Grid item xs={12} display={'flex'} flexDirection={'column'} position={'relative'}>
          <FormLabel>
            <Tooltip
              placement={'left-start'}
              title={t('labelCollectionDescriptionTooltips').toString()}
            >
              <Typography
                component={'h4'}
                variant={'body1'}
                textAlign={'left'}
                marginBottom={1}
                alignItems={'center'}
                display={'inline-flex'}
                color={'var(--color-text-secondary)'}
              >
                <Trans i18nKey={'labelCollectionDescription'}>
                  Description
                  <Info2Icon fontSize={'small'} color={'inherit'} sx={{ marginX: 1 / 2 }} />
                </Trans>
              </Typography>
            </Tooltip>
          </FormLabel>

          <Box flex={1}>
            <TextareaAutosizeStyled
              aria-label='Description'
              minRows={5}
              value={
                collectionValue?.description
                  ? htmlDecode(collectionValue.description ?? '').toString()
                  : ''
              }
              style={{
                overflowX: 'hidden',
                resize: 'vertical',
                height: '100%',
                margin: 0,
              }}
              maxLength={1000}
              onChange={(event) => handleOnDataChange('description', event.target.value)}
              draggable={true}
            />
          </Box>
        </Grid>

        <Grid item xs={12} display={'flex'} flexDirection={'row'} justifyContent={'space-between'}>
          {isEdit && resetEdit && (
            <Box width={'50%'} marginRight={1}>
              <Button
                variant={'outlined'}
                size={'large'}
                fullWidth
                onClick={resetEdit}
                // sx={{ marginRight: 1 }}
                className={'MuiContained-sizeMedium'}
              >
                {t('labelEditRestCollectionBtn')}
              </Button>
            </Box>
          )}
          <Button
            variant={'contained'}
            size={'medium'}
            color={'primary'}
            fullWidth
            loading={!getDisabled && btnStatus === TradeBtnStatus.LOADING ? 'true' : 'false'}
            disabled={getDisabled || btnStatus === TradeBtnStatus.LOADING}
            // disabled={isLoading ||}
            onClick={() => {
              onSubmitClick()
            }}
          >
            {btnInfo
              ? t(btnInfo.label, btnInfo.params)
              : isEdit
              ? t(`labelEditCollectionBtn`)
              : t(`labelCollectionCreateBtn`)}
          </Button>
        </Grid>
      </Grid>
    </ImageUploadWrapper>
  )
}
