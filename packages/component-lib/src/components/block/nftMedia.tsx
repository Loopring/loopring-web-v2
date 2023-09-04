import {
  GET_IPFS_STRING,
  ImageIcon,
  NFTWholeINFO,
  RefreshIcon,
  SoursURL,
  SyncIcon,
} from '@loopring-web/common-resources'
import { Theme, useTheme } from '@emotion/react'
import React from 'react'
import { Box, BoxProps, Modal, Tooltip, Typography } from '@mui/material'
import {
  cssBackground,
  EmptyDefault,
  MediaLabelStyled,
  MediaSVGToggle,
  ModalCloseButton,
  NftImage,
  NFTMedaProps,
  useImage,
  useOpenModals,
  useSettings,
  SwitchPanelStyled,
  Button,
} from '../../index'
import { NFT_IMAGE_SIZES } from '@loopring-web/loopring-sdk'
import styled from '@emotion/styled'
import { useTranslation, WithTranslation, withTranslation } from 'react-i18next'
import { useHistory } from 'react-router-dom'
// import "@google/model-viewer";

const BoxStyle = styled(Box)<BoxProps & { theme: Theme }>`
  ${(props) => cssBackground(props)};
  width: 100%;
  position: relative;
  overflow: hidden;
  background-color: var(--color-box-secondary);
  .redPacketNFT & {
    background-image: none;
    background-color: initial;
  }
` as (prosp: BoxProps & { theme: Theme }) => JSX.Element

export const NFTMedia = React.memo(
  React.forwardRef(
    (
      {
        item,
        shouldPlay = true,
        onNFTError,
        index,
        isOrigin = false,
        getIPFSString,
        baseURL,
      }: NFTMedaProps,
      ref: React.ForwardedRef<any>,
    ) => {
      const theme = useTheme()
      const { t } = useTranslation()
      const {
        modals: {
          isShowNFTDetail: { isShow },
        },
      } = useOpenModals()
      const [play, setPlay] = React.useState(false)
      const [previewSrc, setPreviewSrc] = React.useState(
        (isOrigin
          ? item?.metadata?.imageSize[NFT_IMAGE_SIZES.original]
          : item?.metadata?.imageSize[NFT_IMAGE_SIZES.small]) ??
          getIPFSString(item?.image, baseURL),
        // item?.image?.startsWith(IPFS_HEAD_URL) ?
        // baseURL + `/api/v3/delegator/ipfs?path=${item?.image?.replace(IPFS_HEAD_URL_REG, '')}`: item?.image
        // item?.image?.replace(IPFS_HEAD_URL, IPFS_LOOPRING_SITE)
      )
      const { hasLoaded: previewSrcHasLoaded, hasError: previewSrcHasError } = useImage(
        previewSrc ?? '',
      )
      const fullSrc = isOrigin
        ? getIPFSString(item?.image, baseURL)
        : item?.metadata?.imageSize[NFT_IMAGE_SIZES.original] ?? getIPFSString(item?.image, baseURL)
      const { hasLoaded: fullSrcHasLoaded } = useImage(fullSrc ?? '')

      return (
        <BoxStyle
          ref={ref}
          theme={theme}
          flex={1}
          display={'flex'}
          alignItems={'center'}
          justifyContent={'center'}
        >
          {!previewSrcHasLoaded ? (
            <Box
              flex={1}
              height={'100%'}
              display={'flex'}
              alignItems={'center'}
              justifyContent={'center'}
            >
              <img className='loading-gif' width='36' src={`${SoursURL}images/loading-line.gif`} />
            </Box>
          ) : (
            <>
              {item && previewSrcHasError ? (
                <Box
                  flex={1}
                  display={'flex'}
                  alignItems={'center'}
                  justifyContent={'center'}
                  onClick={async (event) => {
                    event.stopPropagation()
                    setPreviewSrc(
                      item?.metadata?.imageSize['160-160'] ?? getIPFSString(item?.image, baseURL),
                    )
                  }}
                >
                  <RefreshIcon style={{ height: 36, width: 36 }} />
                </Box>
              ) : (
                <>
                  {item.__mediaType__ && item.animationUrl && (
                    <MediaSVGToggle
                      url={item.animationUrl}
                      play={play}
                      shouldPlay={shouldPlay}
                      setPlay={setPlay}
                      mediaTyp={item.__mediaType__}
                      getIPFSString={getIPFSString}
                      baseURL={baseURL}
                      isShow={isShow}
                    />
                  )}
                  <Box
                    alignSelf={'stretch'}
                    position={'relative'}
                    flex={1}
                    margin={'1'}
                    display={'flex'}
                  >
                    {play && shouldPlay ? (
                      <></>
                    ) : !!fullSrc && fullSrcHasLoaded ? (
                      <NftImage
                        alt={item?.image}
                        {...item}
                        onError={() => undefined}
                        src={fullSrc}
                      />
                    ) : !!previewSrc ? (
                      <NftImage
                        alt={item?.image}
                        {...item}
                        onError={() => onNFTError(item, index)}
                        src={previewSrc}
                      />
                    ) : (
                      <EmptyDefault
                        style={{ flex: 1 }}
                        height={'100%'}
                        emptyPic={
                          <ImageIcon
                            htmlColor={'var(--color-text-third)'}
                            style={{ width: 80, height: 80 }}
                          />
                        }
                        message={() => (
                          <></>
                          // <Box
                          //   flex={1}
                          //   display={"flex"}
                          //   alignItems={"center"}
                          //   justifyContent={"center"}
                          // >
                          //   {t("labelNoCollectionCover")}
                          // </Box>
                        )}
                      />
                    )}
                  </Box>
                </>
              )}
            </>
          )}

          {item?.pendingOnSync ? (
            <Tooltip title={t('labelMintInSyncTooltips').toString()} placement={'top'}>
              <MediaLabelStyled
                position={'absolute'}
                left={0}
                top={0}
                display={'flex'}
                justifyContent={'center'}
                alignItems={'center'}
              >
                <SyncIcon color={'inherit'} />
                <Typography color={'inherit'} component={'span'} paddingLeft={1}>
                  {t('labelSync')}
                </Typography>
              </MediaLabelStyled>
            </Tooltip>
          ) : (
            ''
          )}
        </BoxStyle>
      )
    },
  ),
)
const ModalFullStyled = styled(Box)`
  & > div {
    background: var(--color-global-bg-opacity);
    position: absolute;
    top: 56px;
    left: 0;
    right: 0;
    bottom: 0;
  }

  .close-button {
    margin-top: 0;
  }
` as typeof Box

export const ZoomMedia = withTranslation('common')(
  ({
    t,
    open,
    onClose,
    getIPFSString,
    baseURL,
    nftItem,
    className = '',
    ...rest
  }: WithTranslation & {
    open: boolean
    nftItem: Partial<NFTWholeINFO>
    onClose: (event: any) => void
    className?: string
    getIPFSString: GET_IPFS_STRING
    baseURL: string
  }) => {
    const ref = React.useRef()
    // const { language } = useSettings();
    return (
      <Modal
        open={open}
        onClose={onClose}
        aria-labelledby='modal-modal-title'
        aria-describedby='modal-modal-description'
      >
        <ModalFullStyled
          display={'flex'}
          alignItems={'center'}
          justifyContent={'center'}
          className={className ?? ''}
        >
          <Box
            className={'content'}
            paddingTop={3}
            paddingBottom={3}
            display={'flex'}
            flexDirection={'column'}
          >
            <ModalCloseButton className='full-btn-close' onClose={onClose} {...{ ...rest, t }} />
            <Box
              position={'absolute'}
              top={0}
              right={0}
              bottom={0}
              left={0}
              display={'flex'}
              alignItems={'center'}
              justifyContent={'center'}
              zIndex={88}
            >
              <NFTMedia
                ref={ref}
                item={nftItem as Partial<NFTWholeINFO>}
                shouldPlay={true}
                onNFTError={() => 'undefined'}
                isOrigin={true}
                getIPFSString={getIPFSString}
                baseURL={baseURL}
              />
            </Box>
          </Box>
        </ModalFullStyled>
      </Modal>
    )
  },
)

export const CollectionHadUnknown = withTranslation('common')(
  ({
    t,
    open,
    onClose,
    ...rest
  }: WithTranslation & {
    open: boolean
    onClose: () => void
  }) => {
    const { mode } = useTheme()
    const { isMobile } = useSettings()
    const history = useHistory()
    return (
      <Modal
        open={open}
        onClose={onClose}
        aria-labelledby='modal-modal-title'
        aria-describedby='modal-modal-description'
      >
        <SwitchPanelStyled
          display={'flex'}
          alignItems={'center'}
          justifyContent={'center'}
          width={isMobile ? '90%' : 'var(--lage-modal-width)'}
          sx={{ background: 'var(--color-pop-bg)' }}
          // className={className ?? ''}
        >
          <ModalCloseButton className='full-btn-close' onClose={onClose} {...{ ...rest, t }} />
          <Box
            alignItems={'flex-start'}
            justifyContent={'stretch'}
            zIndex={88}
            paddingX={3}
            flexDirection={'column'}
          >
            <Typography component={'h4'} variant={isMobile ? 'h5' : 'h4'} textAlign={'center'}>
              {t('labelHadUnknownCollectionTitle')}
            </Typography>
            <Typography
              component={'p'}
              variant={'body1'}
              color={'textSecondary'}
              textAlign={'left'}
              marginY={2}
            >
              {t('labelHadUnknownCollectionDes')}
            </Typography>
            <Box display={'flex'} alignItems={'center'} justifyContent={'center'}>
              <img
                alt={'collection demo'}
                width='80%'
                // style={{
                //   minHeight: '60px',
                // }}
                src={`${SoursURL}images/collection_unknown_${mode}.webp`}
              />
            </Box>
            <Box display={'flex'} marginY={4} marginX={2} justifyContent={'center'}>
              <Button
                fullWidth
                variant={'contained'}
                size={'large'}
                color={'primary'}
                onClick={() => {
                  history.replace('/nft/importLegacyCollection')
                  onClose()
                }}
              >
                {t('labelGo')}
              </Button>
            </Box>
          </Box>
        </SwitchPanelStyled>
      </Modal>
    )
  },
)
