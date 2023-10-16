import {
  Box,
  Checkbox,
  FormControlLabel as MuiFormControlLabel,
  FormLabel,
  Grid,
  Tooltip,
  Typography,
} from '@mui/material'
import {
  DropdownIconStyled,
  ImageUploadWrapper,
  IpfsFile,
  IPFSSourceUpload,
  MediaTYPES,
  MintNFTBlock,
  NFTMetaBlockProps,
  NFTMetaProps,
  NFTMintProps,
  TextareaAutosizeStyled,
  TransErrorHelp,
  TYPES,
} from '@loopring-web/component-lib'
import { Trans, useTranslation } from 'react-i18next'
import React from 'react'
import {
  CheckBoxIcon,
  CheckedIcon,
  CollectionMeta,
  FeeInfo,
  Info2Icon,
  MintTradeNFT,
  NFTMETA,
} from '@loopring-web/common-resources'
import { getIPFSString, LoopringAPI, NFT_MINT_VALUE, useSystem } from '@loopring-web/core'
import * as sdk from '@loopring-web/loopring-sdk'

const MaxSize = 10485760
const MaxMediaSize = 10485760 * 5

export const MetaNFTPanel = <
  Me extends NFTMETA,
  Mi extends MintTradeNFT<I>,
  Co extends CollectionMeta,
  I,
  C extends FeeInfo,
>({
  nftMetaProps,
  nftMintProps,
  keys,
  onFilesLoad,
  onDelete,
  nftMintValue,
  errorOnMeta,
}: Partial<NFTMetaBlockProps<Me, Co, Mi, C>> & {
  feeInfo: C
  errorOnMeta: undefined | sdk.RESULT_INFO
  nftMintValue: NFT_MINT_VALUE<I>
  nftMintProps: NFTMintProps<Me, Mi, C>
  nftMetaProps: NFTMetaProps<Me, Co, C>
  onFilesLoad: (key: string, value: IpfsFile) => void
  onDelete: (keys: string[]) => void
  keys: { [key: string]: undefined | IpfsFile }
}) => {
  const { t } = useTranslation('common')
  const { baseURL } = useSystem()
  const domain: string = LoopringAPI.delegate?.getCollectionDomain() ?? ''
  const [dropdownErrorStatus, setDropdownErrorStatus] = React.useState<'up' | 'down'>('down')

  return (
    <ImageUploadWrapper flex={1} display={'flex'} flexDirection={'column'} marginBottom={2}>
      <Grid container spacing={5 / 2} paddingX={5 / 2} paddingTop={5 / 2} flex={1}>
        <Grid item xs={12} md={5} position={'relative'}>
          <Box display={'flex'} flexDirection={'column'} marginBottom={2}>
            <FormLabel>
              <Tooltip title={t('labelIPFSUploadTooltips').toString()} placement={'top'}>
                <Typography
                  variant={'body2'}
                  marginBottom={1}
                  display={'inline-flex'}
                  alignItems={'center'}
                >
                  <Trans i18nKey={'labelIPFSUploadTitle'}>
                    Cover Image
                    <Typography component={'span'} variant={'inherit'} color={'error'}>
                      {'\uFE61'}
                    </Typography>
                    <Info2Icon fontSize={'small'} color={'inherit'} sx={{ marginX: 1 / 2 }} />
                  </Trans>
                </Typography>
              </Tooltip>
            </FormLabel>
            <Box maxWidth={240} maxHeight={240}>
              <IPFSSourceUpload
                fullSize={true}
                value={keys?.image}
                maxSize={MaxSize}
                types={TYPES}
                getIPFSString={getIPFSString}
                baseURL={baseURL}
                onChange={(value) => {
                  onFilesLoad('image', value)
                }}
                onDelete={() => onDelete(['image'])}
              />
            </Box>
          </Box>
          <Box display={'flex'} flexDirection={'column'} marginBottom={2}>
            <FormLabel>
              <Tooltip title={t('labelIPFSUploadMediaTooltips').toString()} placement={'top'}>
                <Typography
                  variant={'body2'}
                  marginBottom={1}
                  display={'inline-flex'}
                  alignItems={'center'}
                >
                  <Trans i18nKey={'labelIPFSUploadMediaTitle'}>
                    Multimedia Content (image, audio, video and 3D)
                    <Info2Icon fontSize={'small'} color={'inherit'} sx={{ marginX: 1 / 2 }} />
                  </Trans>
                </Typography>
              </Tooltip>
            </FormLabel>
            <Box maxWidth={320}>
              <IPFSSourceUpload
                height={'40%'}
                fullSize={true}
                value={keys.animationUrl}
                maxSize={MaxMediaSize}
                types={[]}
                messageTypes={MediaTYPES}
                getIPFSString={getIPFSString}
                baseURL={baseURL}
                onChange={(value) => {
                  onFilesLoad('animationUrl', value)
                }}
                onDelete={() => onDelete(['animationUrl'])}
              />
            </Box>
          </Box>

          <Box marginTop={1}>
            <MuiFormControlLabel
              control={
                <Checkbox
                  checked={nftMetaProps.userAgree}
                  onChange={(_event: any, state: boolean) => {
                    nftMetaProps.handleUserAgree(state)
                  }}
                  checkedIcon={<CheckedIcon />}
                  icon={<CheckBoxIcon />}
                  color='default'
                />
              }
              label={t('labelUseIpfsMintAgree')}
            />
          </Box>
        </Grid>
        <Grid item xs={12} md={7} flex={1} display={'flex'}>
          <MintNFTBlock
            {...nftMetaProps}
            baseURL={baseURL}
            domain={domain}
            handleMintDataChange={nftMintProps.handleMintDataChange}
            disabled={keys['image']?.isProcessing || keys['animationUrl']?.isProcessing}
            nftMeta={nftMintValue.nftMETA as Me}
            mintData={nftMintValue.mintData as Mi}
            feeInfo={nftMintProps.feeInfo}
            handleFeeChange={nftMintProps.handleFeeChange}
          />
        </Grid>
        {errorOnMeta && (
          <Grid item xs={12} md={7} flex={1} display={'flex'}>
            <Typography
              marginX={3}
              whiteSpace={'pre-line'}
              variant={'body2'}
              color={'var(--color-text-third)'}
              component={'div'}
              marginBottom={2}
              alignSelf={'flex-center'}
              paddingX={1}
              marginY={1}
              textAlign={'center'}
            >
              <Typography
                variant={'inherit'}
                display={'inline-flex'}
                onClick={() => setDropdownErrorStatus((prev) => (prev === 'up' ? 'down' : 'up'))}
              >
                {`${t('labelErrorTitle')}`}
                <TransErrorHelp error={errorOnMeta} />
                <DropdownIconStyled status={dropdownErrorStatus} fontSize={'medium'} />
              </Typography>

              {dropdownErrorStatus === 'up' && (
                <TextareaAutosizeStyled
                  aria-label='NFT Description'
                  minRows={4}
                  disabled={true}
                  value={`${JSON.stringify(errorOnMeta)}}`}
                />
              )}

              {/*{\`Error Description:\\n {code: ${error?.code}, message:${error?.message}}\`}*/}
            </Typography>
          </Grid>
        )}
      </Grid>
    </ImageUploadWrapper>
  )
}
