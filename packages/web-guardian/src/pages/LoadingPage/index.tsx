import { useTranslation } from 'react-i18next'
import { Box } from '@mui/material'
import styled from '@emotion/styled'
// import { ErrorObject } from '@loopring-web/common-resources';
// import { getContactInfo } from '../../utils/dt_tools';
import { boxLiner } from '@loopring-web/component-lib'
import { SoursURL } from '@loopring-web/common-resources'
import React from 'react'
// ${({theme}) => boxLiner({theme})}
const StyleBox = styled(Box)`
  //background: var(--color-mask);
  ${({ theme }) => boxLiner({ theme })}

  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  width: 0;
  z-index: 500;
  height: 100%;
  width: 100%;

  svg path,
  svg rect {
    fill: var(--color-primary);
  }
` as typeof Box
const StyleBlock = styled(Box)`
  background: var(--color-global-bg);

  svg path,
  svg rect {
    fill: var(--color-primary);
  }
` as typeof Box

export const LoadingPage = () => {
  const { t } = useTranslation('layout')
  return (
    <>
      {/*<Container>*/}
      {/*style={{height: '100%' }}*/}
      <StyleBox
        flex={1}
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
      </StyleBox>
    </>
  )
}
export const LoadingBlock = () => {
  const { t } = useTranslation('layout')
  return (
    <>
      {/*<Container>*/}
      {/*style={{height: '100%' }}*/}
      <StyleBlock
        flex={1}
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
    </>
  )
}
