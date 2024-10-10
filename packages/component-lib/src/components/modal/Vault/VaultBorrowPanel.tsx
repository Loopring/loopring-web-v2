import {
  IBData,
  SoursURL,
  TokenType,
  TRADE_TYPE,
  VaultBorrowData,
} from '@loopring-web/common-resources'
import {
  CountDownIcon,
  SwitchPanel,
  SwitchPanelProps,
  VaultBorrowProps,
} from '@loopring-web/component-lib'
import React from 'react'
import { Box, Typography } from '@mui/material'
import { TradeMenuList, useBasicTrade, VaultBorrowWrap } from '../../tradePanel/components'
import { useTranslation } from 'react-i18next'

export const VaultBorrowPanel = <T extends IBData<I>, V extends VaultBorrowData<T>, I>({
  // onVaultBorrowClick,
  walletMap = {},
  coinMap = {},
  _width,
  type = TRADE_TYPE.TOKEN,
  onRefreshData,
  ...rest
}: VaultBorrowProps<T, I, V>) => {
  const { t, i18n } = useTranslation()
  const [panelIndex, setPanelIndex] = React.useState(0)
  const onChangeEvent = (index, data) => {
    if (index !== panelIndex) {
      if (data.tradeData.belong !== rest.tradeData.belong) {
        rest.handlePanelEvent && rest.handlePanelEvent(data, "Tobutton")
      }
      setPanelIndex(index)
    } else {
      rest.handlePanelEvent && rest.handlePanelEvent(data, "Tobutton")
    }
  }

  const props: SwitchPanelProps<'tradeMenuList' | 'trade' | 'confirm'> = {
    index: panelIndex, // show default show
    panelList: [
      {
        key: 'trade',
        element: React.useMemo(
          () => (
            // @ts-ignore
            <VaultBorrowWrap
              key={'trade'}
              {...{
                ...rest,
                type,
                // tradeData: switchData.tradeData,
                onChangeEvent,
                disabled: !!rest.disabled,
                walletMap,
                coinMap,
              }}
            />
          ),
          [rest, onChangeEvent, walletMap, coinMap],
        ),
        toolBarItem: React.useMemo(
          () => (
            <>
              <Typography
                display={'inline-block'}
                marginLeft={2}
                component={'span'}
                visibility={'hidden'}
                height={0}
                width={0}
              >
                <CountDownIcon onRefreshData={onRefreshData} />
              </Typography>
            </>
          ),
          [],
        ),
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
                selected: rest.tradeData.belong,
                tradeData: rest.tradeData,
                walletMap,
                coinMap,
                tokenType: TokenType.vault,
                //oinMap
              }}
            />
          ),
          [rest, walletMap, coinMap],
        ),
        toolBarItem: undefined,
      },
    ],
  }
  return !rest.tradeData?.belong ? (
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
