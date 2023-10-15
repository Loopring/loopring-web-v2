import { IBData, SoursURL, TRADE_TYPE, VaultBorrowData } from '@loopring-web/common-resources'
import { SwitchPanel, SwitchPanelProps, VaultBorrowProps } from '@loopring-web/component-lib'
import React from 'react'
import { Box } from '@mui/material'
import { TradeMenuList, useBasicTrade } from '../components'
import { VaultBorrowWrap } from '../components'
// import { VaultBorrowConfirm } from '../components/VaultWrap'
import { useTranslation } from 'react-i18next'

export const VaultBorrowPanel = <T extends IBData<I>, V extends VaultBorrowData<I>, I>({
  onVaultBorrowClick,
  vaultBorrowBtnStatus,
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
        // onBack,
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
                onSubmitClick: onVaultBorrowClick,
                btnStatus: vaultBorrowBtnStatus,
                walletMap,
                coinMap,
              }}
            />
          ),
          [
            rest,
            switchData.tradeData,
            onChangeEvent,
            onVaultBorrowClick,
            // onDepositClick,
            vaultBorrowBtnStatus,
            walletMap,
            coinMap,
          ],
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
      width={'var(--modal-width)'}
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
    <SwitchPanel {...{ ...rest, i18n, t, tReady: true, ...props }} />
  )
}
