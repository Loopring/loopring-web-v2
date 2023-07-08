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
  .btn-close {
    svg {
      height: var(--btn-icon-size);
      width: var(--btn-icon-size);
    }

    //transform: translateY(-50%) translateX(-50%);
    //left: 50%;
    top: ${({ theme }) => 3.5 * theme.unit}px;
    right: ${({ theme }) => 16 * theme.unit}px;
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
          width={'var(--modal-width)'}
          // height={`calc(100vh - ${HEADER_HEIGHT}px)`}
          position={'absolute'}
          overflow={'scroll'}
          display={'flex'}
          top='50%'
          left='50%'
          sx={{
            transform: 'translateY(-50%) translateX(-50%)',
          }}
        >
          <Box display={'flex'} width={'100%'} flexDirection={'column'}>
            <ModalCloseButton className='btn-close' onClose={onClose} {...{ ...rest, t }} />
            <Box>
              <Carousel loading={loading} imageList={imageList} />
              <Button onClick={onClick}>xxxxxx</Button>
            </Box>
          </Box>
        </BoxStyle>
      </Modal>
    )
  },
)
