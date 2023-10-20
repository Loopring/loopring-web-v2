import { Box, BoxProps, Divider, Tab, Tabs, Toolbar } from '@mui/material'
import { VaultRepayWrapProps } from '../components/VaultWrap'
import styled from '@emotion/styled'
import { boxLiner, toolBarPanel } from '../../styled'
import { useTranslation, WithTranslation } from 'react-i18next'
import { useSettings } from '../../../stores'
import { IBData, VaultBorrowData, VaultLoadType } from '@loopring-web/common-resources'
import { VaultBorrowPanel } from './VaultBorrowPanel'
import { VaultBorrowProps } from '../Interface'
import { VaultRepayPanel } from './VaultRepayPanel'
import { useSystem } from '@loopring-web/core'

export type VaultLoadProps<T, B, I> = {
  vaultLoadType: VaultLoadType
  handleTabChange: (index: VaultLoadType) => void
  vaultRepayProps: VaultRepayWrapProps<T, B, I>
  vaultBorrowProps: VaultBorrowProps<T, B, I>
}
const TabPanelBtn = ({ t, value, handleChange }: WithTranslation & any) => {
  return (
    <Tabs value={value} onChange={handleChange} aria-label='Amm Method Tab'>
      <Tab label={t('labelVaultBorrow')} value={VaultLoadType.Borrow} />
      <Tab label={t('labelVaultRepay')} value={VaultLoadType.Repay} />
    </Tabs>
  )
}

const WrapStyle = styled(Box)<
  BoxProps & {
    _height?: number | string
    _width?: number | string
    isMobile: boolean
  }
>`
  ${({ _width, isMobile }) =>
    isMobile
      ? `width:100%;height:auto;`
      : `       
      width: ${
        typeof _width === 'string'
          ? _width
          : typeof _width === 'number'
          ? _width + 'px'
          : `var(--swap-box-width)`
      };
      height: auto;`}
  ${({ theme }) => boxLiner({ theme })}
  ${({ theme }) => toolBarPanel({ theme })}
  border-radius: ${({ theme }) => theme.unit}px;

  .trade-panel .coinInput-wrap {
    background: var(--field-opacity);
  }

  .MuiToolbar-root {
    //padding-left:0;
    justify-content: space-between;
    padding: 0 ${({ theme }) => (theme.unit * 5) / 2}px;
  }
  .vaultRepay {
    .MuiListItem-root {
      width: auto;
      padding: ${({ theme }) => theme.unit}px ${({ theme }) => theme.unit / 2}px
        ${({ theme }) => theme.unit}px ${({ theme }) => 2 * theme.unit}px;
      margin: ${({ theme }) => theme.unit / 2}px ${({ theme }) => 2 * theme.unit}px;
      ${({ theme }) =>
        theme.border.defaultFrame({
          d_W: 1,
          c_key: 'var(--color-border)',
        })};
      &:hover {
        ${({ theme }) =>
          theme.border.defaultFrame({
            d_W: 1,
            c_key: 'var(--color-border-select)',
          })};
        .MuiSvgIcon-root {
          fill: var(--color-primary);
        }
      }
    }
  }
` as (
  props: BoxProps & {
    _height?: number | string
    _width?: number | string
    isMobile: boolean
  },
) => JSX.Element
export const VaultLoadPanel = <T extends IBData<I>, V extends VaultBorrowData<I>, I>({
  handleTabChange,
  vaultLoadType,
  vaultRepayProps,
  vaultBorrowProps,
}: VaultLoadProps<T, V, I>) => {
  const { t } = useTranslation()
  const { forexMap } = useSystem()
  const {
    // defaultNetwork,
    isMobile,
  } = useSettings()
  return (
    <WrapStyle
      _width={'var(--modal-width)'}
      display={'flex'}
      className={'trade-panel container valut-load'}
      isMobile={isMobile}
      paddingTop={'var(--toolbar-row-padding)'}
      paddingBottom={3}
      flexDirection={'column'}
      flexWrap={'nowrap'}
    >
      <Toolbar
        className={'large'}
        variant={'regular'}
        sx={{ minHeight: 'var(--header-submenu-item-height) !important' }}
      >
        <Box alignSelf={'center'} justifyContent={'flex-start'} display={'flex'} marginLeft={-2}>
          <TabPanelBtn
            {...{
              t,
              value: vaultLoadType,
              handleChange: (_e: any, value: any) => handleTabChange(value),
            }}
          />
        </Box>
      </Toolbar>
      <Divider style={{ marginTop: '-1px' }} />
      <Box flex={1} className={'trade-panel'} marginTop={1}>
        {vaultLoadType === VaultLoadType.Borrow && (
          <Box
            display={'flex'}
            justifyContent={'space-evenly'}
            alignItems={'stretch'}
            height={'100%'}
          >
            <VaultBorrowPanel
              {...{
                ...(vaultBorrowProps as any),
                t,
                _height: 'auto',
              }}
            />
          </Box>
        )}
        {vaultLoadType === VaultLoadType.Repay && (
          <Box
            display={'flex'}
            justifyContent={'space-evenly'}
            alignItems={'stretch'}
            height={'100%'}
          >
            <VaultRepayPanel
              forexMap={forexMap}
              {...{ ...(vaultRepayProps as any), t, _height: 'auto' }}
            />
          </Box>
        )}
      </Box>
    </WrapStyle>
  )
}
