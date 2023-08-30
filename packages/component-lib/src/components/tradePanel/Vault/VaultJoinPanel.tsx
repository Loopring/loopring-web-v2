import { IBData, SoursURL, TRADE_TYPE, VaultJoinData } from '@loopring-web/common-resources'
import {
  ModalBackButton,
  SwitchPanel,
  SwitchPanelProps,
  VaultJoinProps,
} from '@loopring-web/component-lib'
import { WithTranslation } from 'react-i18next'
import React from 'react'
import { Box } from '@mui/material'
import { TradeMenuList, useBasicTrade } from '../components'
import { VaultJoinWrap } from '../components/VaultWrap/VaultJoin'
import { VaultJoinConfirm } from '../components/VaultWrap'

export const VaultJoinPanel = <T extends IBData<I>, I, V = VaultJoinData>({
  onSubmitClick,
  btnStatus,
  walletMap = {},
  coinMap = {},
  onBack, // onBack,
  t,
  ...rest
}: VaultJoinProps<T, I>) => {
  // const { defaultNetwork } = useSettings()
  // const network = MapChainId[defaultNetwork] ?? MapChainId[1]
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
  // const hanleConfirm = () => {};
  React.useEffect(() => {
    setPanelIndex(index + 1)
  }, [index])

  // const getFilteredWalletMap = React.useCallback(() => {
  //   if (walletMap) {
  //     const clonedWalletMap = cloneDeep(walletMap)
  //     Object.values(clonedWalletMap).forEach((o: any) => {
  //       if (o.belong && o.count && Number(o.count) === 0) {
  //         delete clonedWalletMap[o.belong]
  //       }
  //     })
  //     return clonedWalletMap
  //   }
  //   return {}
  // }, [walletMap])

  // const getFilteredCoinMap: any = React.useCallback(() => {
  //   if (coinMap && getFilteredWalletMap()) {
  //     const clonedCoinMap = cloneDeep(coinMap)
  //     const remainList = {}
  //     Object.keys(getFilteredWalletMap()).forEach((token) => {
  //       if (clonedCoinMap[token]) {
  //         remainList[token] = clonedCoinMap[token]
  //       }
  //     })
  //     return remainList
  //   }
  //   return {}
  // }, [coinMap, getFilteredWalletMap])

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
                t,
                tradeData: switchData.tradeData,
                onChangeEvent,
                disabled: !!rest.disabled,
                handleConfirm,
                onSubmitClick,
                btnStatus,
                walletMap,
                coinMap,
                // allowTrade,
                // accountReady,
              }}
            />
          ),
          [
            rest,
            switchData.tradeData,
            onChangeEvent,
            // onDepositClick,
            btnStatus,
            walletMap,
            coinMap,
          ],
        ),
        toolBarItem: React.useMemo(
          () => (
            <>
              {onBack ? (
                <ModalBackButton
                  marginTop={0}
                  marginLeft={-2}
                  onBack={() => {
                    onBack()
                  }}
                  {...rest}
                />
              ) : (
                <></>
              )}
            </>
          ),
          [onBack],
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
        // toolBarItem: toolBarItemBack
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
    <SwitchPanel {...{ ...rest, t, ...props }} />
  )
}
