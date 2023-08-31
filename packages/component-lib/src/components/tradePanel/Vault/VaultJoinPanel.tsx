import { IBData, SoursURL, TRADE_TYPE, VaultJoinData } from '@loopring-web/common-resources'
import {
  ModalBackButton,
  SwitchPanel,
  SwitchPanelProps,
  VaultJoinProps,
} from '@loopring-web/component-lib'
import React from 'react'
import { Box } from '@mui/material'
import { TradeMenuList, useBasicTrade } from '../components'
import { VaultJoinWrap } from '../components/VaultWrap'
import { VaultJoinConfirm } from '../components/VaultWrap'
import { useTranslation } from 'react-i18next'

export const VaultJoinPanel = <T extends IBData<I>, V extends VaultJoinData<I>, I>({
  onSubmitClick,
  btnStatus,
  walletMap = {},
  coinMap = {},
  _width,
  ...rest
}: VaultJoinProps<T, I, V>) => {
  const { t, i18n } = useTranslation()
  const { onChangeEvent, index, switchData } = useBasicTrade({
    ...rest,
    type: TRADE_TYPE.TOKEN,
    walletMap,
    coinMap,
  } as any)
  const [panelIndex, setPanelIndex] = React.useState(index + 1)
  const handleConfirm = (index: number) => {
    setPanelIndex(index)
  }
  React.useEffect(() => {
    setPanelIndex(index + 1)
  }, [index])

  const props: SwitchPanelProps<'tradeMenuList' | 'trade' | 'confirm'> = {
    index: panelIndex, // show default show
    panelList: [
      {
        key: 'confirm',
        element: React.useMemo(() => <VaultJoinConfirm key={'confirm'} />, []),
        toolBarItem: (
          <ModalBackButton
            marginTop={0}
            marginLeft={-2}
            onBack={() => {
              setPanelIndex(1)
            }}
            {...rest}
          />
        ),
      },
      {
        key: 'trade',
        // onBack,
        element: React.useMemo(
          () => (
            <VaultJoinWrap
              key={'trade'}
              {...{
                ...rest,
                tradeData: switchData.tradeData,
                onChangeEvent,
                disabled: !!rest.disabled,
                handleConfirm,
                onSubmitClick,
                btnStatus,
                walletMap,
                coinMap,
              }}
            />
          ),
          [
            rest,
            switchData.tradeData,
            onChangeEvent,
            onSubmitClick,
            // onDepositClick,
            btnStatus,
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
