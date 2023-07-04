import styled from '@emotion/styled'
import { ShareProps } from './Interface'
import { Box } from '@mui/material'
import { SoursURL } from '@loopring-web/common-resources'
import { SocialButton } from './components/SocialButton'

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
          <img className='loading-gif' width='36' src={`${SoursURL}images/loading-line.gif`} />
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
