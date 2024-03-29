import styled from '@emotion/styled'
import { Box, Card, Typography, BoxProps, Container, IconButton } from '@mui/material'
import { FirstPlaceIcon, SecondPlaceIcon, ThirdPlaceIcon } from '@loopring-web/common-resources'
import React from 'react'

export * from './SwitchPanel'
export * from './SubMenu'
export * from './Interface'
export * from './IPFSSourceUpload'

export const CardNFTStyled = styled(Card)`
  display: flex;
  padding: 0;
  flex-direction: column;
  justify-content: space-between;
  position: relative;
  width: var(--nft-card);
`
export const LoadingStyled = styled(IconButton)`
  position: absolute;
  z-index: 21;
  top: 40%;
  left: 50%;
  transform: translate(-50%, -50%);
`

export const ImageUploadWrapper = styled(Box)`
  position: relative;
  width: 100%;
  background: var(--color-box-third);
  border-radius: ${({ theme }) => theme.unit}px;

  .MuiFormControlLabel-root {
    align-items: flex-start;

    .MuiFormControlLabel-label {
      color: var(--color-text-secondary);
    }
  }
` as typeof Box

export const PlaceComponent = ({ rank }: { rank: number }) => {
  return (
    <Typography component={'span'} display={'inline-flex'} position={'relative'}>
      <>
        {rank.toString() === '1' ? (
          <FirstPlaceIcon sx={{ position: 'absolute', top: -6 }} fontSize={'large'} />
        ) : rank.toString() === '2' ? (
          <SecondPlaceIcon sx={{ position: 'absolute', top: -4, left: -1 }} fontSize={'large'} />
        ) : rank.toString() === '3' ? (
          <ThirdPlaceIcon sx={{ position: 'absolute', top: -4, left: -1 }} fontSize={'large'} />
        ) : (
          ''
        )}
        <Typography
          display={'inline-flex'}
          component={'span'}
          zIndex={99}
          width={24}
          justifyContent={'center'}
          alignItems={'center'}
          color={Number(rank) <= 3 ? '#B07D00' : 'inherit'}
        >
          {rank}
        </Typography>
      </>
    </Typography>
  )
}

export const MaxWidthContainer = ({
  containerProps = {},
  ...props
}: {
  children: React.ReactNode
  background?: string
  containerProps?: BoxProps
} & BoxProps) => {
  const { children, background, sx, ...otherProps } = props
  const { sx: containerPropsSX, ..._containerProps } = containerProps
  return (
    <Box
      display={'flex'}
      justifyContent={'center'}
      sx={{ background, ...(containerPropsSX ?? {}) }}
      {..._containerProps}
    >
      <Container
        sx={{
          display: 'flex',
          flex: 1,
          flexDirection: 'column',
        }}
        // justifyContent={'stretch'}
        maxWidth={'lg'}
        className={'inner-box'}
      >
        <Box
          flex={1}
          display={'flex'}
          flexDirection={'column'}
          width={'100%'}
          sx={{
            ...sx,
          }}
          {...otherProps}
        >
          {children}
        </Box>
      </Container>
    </Box>
  )
}
