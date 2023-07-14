import { SoursURL } from '@loopring-web/common-resources'
import styled from '@emotion/styled'
import { Box } from '@mui/material'

const StyleBlock = styled(Box)`
  background: var(--color-global-bg);

  svg path,
  svg rect {
    fill: var(--color-primary);
  }
` as typeof Box

export const LoadingBlock = () => {
  return (
    <StyleBlock
      flex={1}
      className={'loading-block'}
      display={'flex'}
      alignItems={'center'}
      justifyContent={'center'}
      flexDirection={'column'}
      height={'100%'}
      width={'100%'}
    >
      <div className='loader loader--style3' title='2'>
        <img
          className='loading-gif'
          alt={'loading'}
          width='36'
          src={`${SoursURL}images/loading-line.gif`}
        />
      </div>
    </StyleBlock>
  )
}
