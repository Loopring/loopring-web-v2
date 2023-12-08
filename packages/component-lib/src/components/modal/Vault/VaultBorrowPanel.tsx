import {
  IBData,
  SoursURL,
  TokenType,
  TRADE_TYPE,
  VaultBorrowData,
} from '@loopring-web/common-resources'
import { SwitchPanel, SwitchPanelProps, VaultBorrowProps } from '@loopring-web/component-lib'
import React from 'react'
import { Box } from '@mui/material'
import { TradeMenuList, useBasicTrade, VaultBorrowWrap } from '../../tradePanel/components'
import { useTranslation } from 'react-i18next'

export const VaultBorrowPanel = <T extends IBData<I>, V extends VaultBorrowData<T>, I>({
  // onVaultBorrowClick,
  walletMap = {},
  coinMap = {},
  _width,
  type = TRADE_TYPE.TOKEN,
  ...rest
}: VaultBorrowProps<T, I, V>) => {
  const { t, i18n } = useTranslation()
  const { onChangeEvent, index, switchData } = useBasicTrade({
    ...rest,
    type,
    walletMap,
    coinMap,
  } as any)
  const [panelIndex, setPanelIndex] = React.useState(index)
  React.useEffect(() => {
    setPanelIndex(index)
  }, [index])

  const props: SwitchPanelProps<'tradeMenuList' | 'trade' | 'confirm'> = {
    index: panelIndex, // show default show
    panelList: [
      {
        key: 'trade',
        element: React.useMemo(
          () => (
            <VaultBorrowWrap
              key={'trade'}
              {...{
                ...rest,
                type,
                tradeData: switchData.tradeData,
                onChangeEvent,
                disabled: !!rest.disabled,
                walletMap,
                coinMap,
              }}
            />
          ),
          [rest, switchData.tradeData, onChangeEvent, walletMap, coinMap],
        ),
        toolBarItem: React.useMemo(() => <></>, []),
      },
      {
        key: 'tradeMenuList',
        element: React.useMemo(
          () => (
            // @ts-ignore
            <TradeMenuList
              {...{
                nonZero: false,
                sorted: true,
                t,
                ...rest,
                onChangeEvent,
                //rest.walletMap,
                selected: switchData.tradeData.belong,
                tradeData: switchData.tradeData,
                walletMap,
                coinMap,
                tokenType: TokenType.vault,
                //oinMap
              }}
            />
          ),
          [rest, onChangeEvent, switchData.tradeData, walletMap, coinMap],
        ),
        toolBarItem: undefined,
      },
    ],
  }
  return !switchData.tradeData?.belong ? (
    <Box
      height={'var(--min-height)'}
      display={'flex'}
      justifyContent={'center'}
      flexDirection={'column'}
      alignItems={'center'}
    >
      <img
        className='loading-gif'
        alt={'loading'}
        width='60'
        src={`${SoursURL}images/loading-line.gif`}
      />
    </Box>
  ) : (
    <SwitchPanel
      className={'vaultBorrow'}
      _width={'var(--modal-width)'}
      {...{ ...rest, i18n, t, tReady: true, ...props }}
    />
  )
}
