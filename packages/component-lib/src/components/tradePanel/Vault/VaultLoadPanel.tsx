import { Box, BoxProps, Tab, Tabs, Toolbar } from '@mui/material'
import {
  // VaultBorrow,
  VaultBorrowWrapProps,
  // VaultRepay,
  VaultRepayWrapProps,
} from '../components/VaultWrap'
import styled from '@emotion/styled'
import { boxLiner, toolBarPanel } from '../../styled'
import { useTranslation, WithTranslation } from 'react-i18next'
import { useSettings } from '../../../stores'
import { VaultLoadType } from '@loopring-web/common-resources'

export type VaultLoadProps<T, I, B, C> = {
  handleTabChange: (index: VaultLoadType) => void

  vaultBorrowProps: VaultBorrowWrapProps<T, I, B, C>
  vaultLoadType: VaultLoadType
  vaultRepayProps: VaultRepayWrapProps<T, I, B, C>
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
` as (
  props: BoxProps & {
    _height?: number | string
    _width?: number | string
    isMobile: boolean
  },
) => JSX.Element
export const VaultLoadPanel = <T, I, B, C>({
  handleTabChange,
  vaultLoadType,
  vaultRepayProps,
  vaultBorrowProps,
}: VaultLoadProps<T, I, B, C>) => {
  const { t } = useTranslation()
  const {
    // defaultNetwork,
    isMobile,
  } = useSettings()
  // const network = MapChainId[defaultNetwork] ?? MapChainId[1]
  // const getDisabled = React.useMemo(() => {
  //   return disabled || btnStatus === TradeBtnStatus.DISABLED
  // }, [btnStatus, disabled])
  // const label = React.useMemo(() => {
  //   if (confirmLabel) {
  //     const key = confirmLabel.split('|')
  //     return t(
  //       key[0],
  //       key && key[1]
  //         ? {
  //             arg: key[1].toString(),
  //             l1ChainName: L1L2_NAME_DEFINED[network].l1ChainName,
  //             loopringL2: L1L2_NAME_DEFINED[network].loopringL2,
  //             l2Symbol: L1L2_NAME_DEFINED[network].l2Symbol,
  //             l1Symbol: L1L2_NAME_DEFINED[network].l1Symbol,
  //             ethereumL1: L1L2_NAME_DEFINED[network].ethereumL1,
  //           }
  //         : {
  //             l1ChainName: L1L2_NAME_DEFINED[network].l1ChainName,
  //             loopringL2: L1L2_NAME_DEFINED[network].loopringL2,
  //             l2Symbol: L1L2_NAME_DEFINED[network].l2Symbol,
  //             l1Symbol: L1L2_NAME_DEFINED[network].l1Symbol,
  //             ethereumL1: L1L2_NAME_DEFINED[network].ethereumL1,
  //           },
  //     )
  //   } else {
  //     return t(`labelVaultConfirm`, {
  //       l1ChainName: L1L2_NAME_DEFINED[network].l1ChainName,
  //       loopringL2: L1L2_NAME_DEFINED[network].loopringL2,
  //       l2Symbol: L1L2_NAME_DEFINED[network].l2Symbol,
  //       l1Symbol: L1L2_NAME_DEFINED[network].l1Symbol,
  //       ethereumL1: L1L2_NAME_DEFINED[network].ethereumL1,
  //     })
  //   }
  // }, [confirmLabel])
  return (
    <WrapStyle
      display={'flex'}
      className={'trade-panel container'}
      isMobile={isMobile}
      paddingTop={'var(--toolbar-row-padding)'}
      paddingBottom={3}
      flexDirection={'column'}
      flexWrap={'nowrap'}
    >
      <Toolbar className={'large'} variant={'regular'}>
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
      <Box flex={1} className={'trade-panel'}>
        {vaultLoadType === VaultLoadType.Borrow && (
          <Box
            display={'flex'}
            justifyContent={'space-evenly'}
            alignItems={'stretch'}
            height={'100%'}
            padding={5 / 2}
            // key={panelList[0].key}
          >
            {/*<VaultBorrow {...{ ...vaultBorrowProps, t }} />*/}
            {/**/}
          </Box>
        )}
        {vaultLoadType === VaultLoadType.Repay && (
          <Box
            display={'flex'}
            justifyContent={'space-evenly'}
            alignItems={'stretch'}
            height={'100%'}
            padding={5 / 2}
          >
            {/*<VaultRepay {...{ ...vaultRepayProps, t }} />*/}
          </Box>
        )}
      </Box>
    </WrapStyle>
  )
}
