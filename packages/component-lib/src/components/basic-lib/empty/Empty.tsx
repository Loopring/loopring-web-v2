import { withTranslation, WithTranslation } from 'react-i18next'
import styled from '@emotion/styled'
import { EmptyIcon } from '@loopring-web/common-resources'
import { Box, BoxProps, Typography } from '@mui/material'

export type EmptyProps = {
  height?: number | string
  emptyPic?: string | JSX.Element //PATH or element
  message: () => JSX.Element
}
const EmptyIconStyle = styled(EmptyIcon)`
  && {
    height: var(--empty-size);
    width: var(--empty-size);
  }

  opacity: 0.3;
  font-size: ${({ theme }) => theme.fontDefault.h1};
  color: var(--color-text-disable);
` as typeof EmptyIcon
const WrapStyled = styled(Box)<{ height: number | undefined | string }>`
  display: flex;
  flex-direction: column;
  flex-flow: column wrap;
  justify-content: center;
  align-items: center;
  height: ${(props) =>
    props.height
      ? typeof props.height == 'number'
        ? props.height + 'px'
        : props.height
      : `${350 - 35}px`};
` as typeof Box
export const EmptyDefault = withTranslation(['layout', 'common'])(
  ({
    t,
    i18n,
    tReady,
    emptyPic = <EmptyIconStyle fontSize={'large'} />,
    height,
    message,
    ...rest
  }: EmptyProps & BoxProps & WithTranslation) => {
    const renderPic =
      !emptyPic || typeof emptyPic === 'string' ? (
        <img src={emptyPic as string} alt={t('Empty')} />
      ) : (
        emptyPic
      )
    return (
      <WrapStyled height={height} {...rest}>
        {renderPic}
        <Typography component={'span'} color={'textSecondary'} fontSize={'h6'} marginTop={1}>
          {message()}
        </Typography>
      </WrapStyled>
    )
  },
) as (props: EmptyProps & BoxProps) => JSX.Element

export const ComingSoonPanel = withTranslation(['common', 'layout'])(({ t }: WithTranslation) => {
  return (
    <Box
      flex={1}
      alignItems={'center'}
      justifyContent={'center'}
      textAlign={'center'}
      marginBottom={2}
      display={'flex'}
    >
      <Typography component={'h6'} variant={'h1'} padding={3}>
        {t('labelComingSoon')}
      </Typography>
    </Box>
  )
})
