import styled from '@emotion/styled'
import { Box, Card, CardProps, Typography } from '@mui/material'
import { FirstPlaceIcon, SecondPlaceIcon, ThirdPlaceIcon } from '@loopring-web/common-resources'

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

export const CardStyleItem = styled(Card)<
  CardProps & {
    contentheight?: number
    size?: 'large' | 'medium' | 'small' | undefined
  }
>`
  background: var(--color-global-bg);
  width: 100%;
  cursor: pointer;
  height: 0;
  padding: 0 0 calc(100% + ${({ contentheight }) => `${contentheight ? contentheight : 80}px`});
  position: relative;

  .boxLabel {
    overflow: hidden;
  }

  &.collection {
    padding: 0 0 calc(140%);

    .boxLabel {
      ${({ size, theme }) =>
        size === 'small'
          ? `
            padding: ${1 * theme.unit}px;
            margin:0;
          `
          : `
              .content{
                width:60%;
              }
              padding: ${2 * theme.unit}px;
              margin: ${2 * theme.unit}px;`}
    }
  }

  &.nft-item {
    .MuiRadio-root,
    .MuiCheckbox-root {
      &:hover {
        background-color: rgba(65, 105, 255, 0.05);
        color: var(--color-text-secondary);
      }

      &.Mui-checked {
        box-shadow: inset 0px 0px 60px var(--color-global-bg-opacity);
      }

      position: absolute;
      right: ${({ theme }) => theme.unit}px;
      top: ${({ theme }) => theme.unit}px;
      transform: scale(1.5);
    }
  }

  &.btnCard {
    background: var(--color-box);

    .MuiCardContent-root {
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: center;
      padding: 0;
    }

    &.column .MuiCardContent-root {
      flex-direction: column;
    }
    

    height: auto;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: ${({ theme }) => (3 / 2) * theme.unit}px;
    box-shadow: none;
    transition: none;
    ${({ theme }) =>
      theme.border.defaultFrame({
        c_key: 'var(--color-border)',
        d_R: 0.5,
      })};

    &.selected,
    &:hover {
      ${({ theme }) =>
        theme.border.defaultFrame({
          c_key: 'var(--color-border-select)',
          d_R: 0.5,
        })};
    }
  }

  img {
    object-fit: contain;
  }
` as (
  props: CardProps & {
    contentheight?: number
    size?: 'large' | 'medium' | 'small' | undefined
  },
) => JSX.Element

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
