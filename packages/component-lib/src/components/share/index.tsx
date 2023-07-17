import styled from '@emotion/styled'
import { ShareProps } from './Interface'
import { Box, Modal } from '@mui/material'
import { SoursURL } from '@loopring-web/common-resources'
import { SocialButton } from './components/SocialButton'
import { WithTranslation, withTranslation } from 'react-i18next'
import { Button, ModalCloseButton } from '../basic-lib'
import { Carousel, CarouselItem } from '../carousel'

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
  }

  .shareSocialIcon {
  }
`

export const Share = ({ social, title, loading, imageUrl, size, sendShareEvent }: ShareProps) => {
  return (
    <StyleBox>
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
          {/*<div className={'shareLabel'}>*/}
          {/*  <FormattedMessage id='store/store-components.share.label' />*/}
          {/*</div>*/}
          <Box className={'shareButtons'}>
            {Object.keys(social).map(
              (socialNetwork, index) =>
                social[socialNetwork] && (
                  <SocialButton
                    key={index}
                    imageUrl={imageUrl}
                    url={window.location && window.location.href}
                    message={title}
                    socialEnum={socialNetwork}
                    size={size}
                    sendShareEvent={sendShareEvent}
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
    ...rest
  }: WithTranslation & {
    open: boolean
    onClose: (event: any) => void
    onClick: (event: any) => void
    className?: string
    loading: boolean
    imageList: CarouselItem[]
  }) => {
    // const ref = React.useRef()
    // const { language } = useSettings();
    return (
      <Modal
        open={open}
        onClose={onClose}
        aria-labelledby='modal-modal-title'
        aria-describedby='modal-modal-description'
      >
        <BoxStyle
          className={'MuiPaper-elevation2'}
          width={'var(--modal-width)'}
          height={'80vh'}
          minHeight={'var(--modal-height)'}
          // height={`calc(100vh - ${HEADER_HEIGHT}px)`}
          position={'absolute'}
          display={'flex'}
          top='50%'
          left='50%'
          sx={{
            transform: 'translateY(-50%) translateX(-50%)',
          }}
        >
          <ModalCloseButton className='btn-close' onClose={onClose} {...{ ...rest, t }} />
          <Box
            alignItems={'center'}
            display={'flex'}
            flex={1}
            width={'100%'}
            flexDirection={'column'}
            paddingY={3}
            overflow={'scroll'}
          >
            {/*<Typography component={'h4'} variant={'h5'} color={'textSecondary'} marginBottom={2}>*/}
            {/*  {t('labelShare')}*/}
            {/*</Typography>*/}
            <Carousel loading={loading} imageList={imageList} />
            <Button onClick={onClick}>{t('labelDownload')}</Button>
          </Box>
        </BoxStyle>
      </Modal>
    )
  },
)
