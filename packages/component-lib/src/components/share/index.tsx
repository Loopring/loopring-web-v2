import styled from '@emotion/styled'
import { ShareProps } from './Interface'
import { Box, IconButton, Modal, Typography } from '@mui/material'
import {
  DownloadIcon,
  ExchangeIO,
  shareDownload,
  shareOnFacebook,
  shareOnTwitter,
  shareViaEmail,
  SOCIAL_NAME_KEYS,
  SoursURL,
} from '@loopring-web/common-resources'
import { SocialButton } from './components/SocialButton'
import { WithTranslation, withTranslation } from 'react-i18next'
import { ModalCloseButton } from '../basic-lib'
import { Carousel, CarouselItem } from '../carousel'
import React from 'react'

const StyleBox = styled(Box)`
  .shareContainer {
  }

  .shareLoader {
  }

  .shareLabel {
  }

  .shareButtons {
  }

  .shareSocialButton {
    background-color: initial;
    cursor: pointer;
  }

  .shareSocialIcon {
  }
`

export const Share = ({ social, loading, size, direction = 'row' }: ShareProps) => {
  return (
    <StyleBox display={'flex'}>
      {loading ? (
        <Box
          flex={1}
          height={'100%'}
          display={'flex'}
          alignItems={'center'}
          justifyContent={'center'}
        >
          <img
            alt={'loading'}
            className='loading-gif'
            width='36'
            src={`${SoursURL}images/loading-line.gif`}
          />
        </Box>
      ) : (
        <Box className={'shareContainer'}>
          <Box className={'shareButtons'} display={'flex'} flexDirection={direction}>
            {Object.keys(social).map(
              (socialNetwork, index) =>
                social[socialNetwork] && (
                  <SocialButton
                    key={index}
                    socialEnum={social[socialNetwork].socialEnum}
                    size={size}
                    sendShareEvent={social[socialNetwork].sendShareEvent}
                  />
                ),
            )}
          </Box>
        </Box>
      )}
    </StyleBox>
  )
}
const BoxStyle = styled(Box)`
  background: var(--color-global-bg);

  & {
    background: var(--color-box);
    border-radius: ${({ theme }) => theme.unit}px;
    //border: 1px solid var(--color-box);
    //cursor: pointer;
  }

  .btn-close {
    svg {
      height: var(--btn-icon-size);
      width: var(--btn-icon-size);
    }

    margin-top: 0;
    //transform: translateY(-50%) translateX(-50%);
    //left: 50%;
    top: ${({ theme }) => 2 * theme.unit}px;
    right: ${({ theme }) => 1 * theme.unit}px;
  }

  .shareSocialButton {
    margin: 0 ${({ theme }) => (1 / 2) * theme.unit}px;
  }

  .btn {
    margin: 0 ${({ theme }) => (1 / 2) * theme.unit}px;
    background: var(--color-primary);

    &:hover {
      background: var(--color-primary);
    }
  }
`
export const ShareModal = withTranslation('common')(
  ({
    t,
    open,
    onClose,
    loading,
    imageList,
    className = '',
    onClick,
    message = '',
    ipfsProvides,
    link = ExchangeIO,
    ...rest
  }: WithTranslation & {
    open: boolean
    onClose: (event: any) => void
    onClick: (event: any) => void
    className?: string
    loading: boolean
    imageList: CarouselItem[]
    message: string
    ipfsProvides: any
    link
  }) => {
    const [selected, setSelected] = React.useState<number>(0)
    const sendShareEvent = (SOCIAL_NAME: SOCIAL_NAME_KEYS | 'download') => {
      if (imageList[selected]) {
        switch (SOCIAL_NAME) {
          case SOCIAL_NAME_KEYS.Facebook:
            shareOnFacebook(message, imageList[selected].imageUrl, ipfsProvides.ipfs, link)
            break
          case SOCIAL_NAME_KEYS.Twitter:
            shareOnTwitter(message, imageList[selected].imageUrl, ipfsProvides.ipfs, link)
            break
          case SOCIAL_NAME_KEYS.Email:
            shareViaEmail(
              message,
              imageList[selected].imageUrl,
              ipfsProvides.ipfs,
              imageList[selected].width,
              imageList[selected].height,
            )
            break
          case 'download':
            shareDownload(
              imageList[selected].name ?? 'LoopringReferral.png',
              imageList[selected].imageUrl,
            )
            break
        }
      }
    }
    return (
      <Modal
        open={open}
        onClose={onClose}
        aria-labelledby='modal-modal-title'
        aria-describedby='modal-modal-description'
      >
        <BoxStyle
          className={'MuiPaper-elevation2'}
          // width={'var(--modal-width)'}
          // height={'80vh'}
          minHeight={'var(--modal-height)'}
          // height={`calc(100vh - ${HEADER_HEIGHT}px)`}
          position={'absolute'}
          display={'flex'}
          flexDirection={'column'}
          top='50%'
          left='50%'
          sx={{
            transform: 'translateY(-50%) translateX(-50%)',
          }}
        >
          <ModalCloseButton className='btn-close' onClose={onClose} {...{ ...rest, t }} />
          <Typography
            textAlign={'center'}
            paddingTop={3}
            component={'h5'}
            variant={'h4'}
            color={'textPrimary'}
          >
            {t('labelShareReferralCode')}
          </Typography>
          <Box
            alignItems={'stretch'}
            display={'flex'}
            paddingX={4}
            flex={1}
            width={'100%'}
            flexDirection={'column'}
            paddingY={3}
            overflow={'scroll'}
          >
            <Carousel
              selected={selected}
              loading={loading}
              imageList={imageList}
              handleSelected={setSelected}
            />
            <Box
              display={'flex'}
              flexDirection={'row'}
              justifyContent={'center'}
              alignItems={'center'}
            >
              <Share
                imageUrl={imageList[selected]?.imageUrl ?? ''}
                loading={loading}
                size={36}
                social={
                  {
                    [SOCIAL_NAME_KEYS.Facebook]: {
                      socialEnum: SOCIAL_NAME_KEYS.Facebook,
                      sendShareEvent,
                    },
                    [SOCIAL_NAME_KEYS.Twitter]: {
                      socialEnum: SOCIAL_NAME_KEYS.Twitter,
                      sendShareEvent,
                    },
                    [SOCIAL_NAME_KEYS.WhatsApp]: {
                      socialEnum: SOCIAL_NAME_KEYS.Email,
                      sendShareEvent,
                    },
                  } as any
                }
              />
              <IconButton
                className={'btn'}
                size={'large'}
                onClick={() => {
                  sendShareEvent('download')
                }}
              >
                <DownloadIcon htmlColor={'var(--color-text-button)'} />
              </IconButton>
            </Box>
          </Box>
        </BoxStyle>
      </Modal>
    )
  },
)
