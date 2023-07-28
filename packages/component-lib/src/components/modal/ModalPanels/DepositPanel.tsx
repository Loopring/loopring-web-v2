import { DepositProps } from '../../tradePanel/Interface'
import { withTranslation, WithTranslation } from 'react-i18next'
import {
  CoinInfo,
  CoinMap,
  IBData,
  L1L2_NAME_DEFINED,
  MapChainId,
  TRADE_TYPE,
} from '@loopring-web/common-resources'
import { ModalBackButton, SwitchPanel, SwitchPanelProps } from '../../basic-lib'
import { DepositWrap, TradeMenuList, useBasicTrade } from '../../tradePanel/components'
import React from 'react'
import { cloneDeep } from 'lodash'
import { DepositConfirm } from '../../tradePanel/components/DepositConfirm'
import { useSettings } from '../../../stores'

export const DepositPanel = withTranslation('common', { withRef: true })(
  <
    T extends {
      toAddress?: string
      addressError?: { error: boolean; message: string }
    } & IBData<I>,
    I,
  >({
    type = TRADE_TYPE.TOKEN,
    onDepositClick,
    depositBtnStatus,
    walletMap = {},
    coinMap = {},
    accountReady,
    addressDefault,
    allowTrade,
    onBack,
    t,
    ...rest
  }: DepositProps<T, I> & WithTranslation) => {
    const { defaultNetwork } = useSettings()
    const network = MapChainId[defaultNetwork] ?? MapChainId[1]
    const { onChangeEvent, index, switchData } = useBasicTrade({
      ...rest,
      type,
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

    const getFilteredWalletMap = React.useCallback(() => {
      if (walletMap) {
        const clonedWalletMap = cloneDeep(walletMap)
        Object.values(clonedWalletMap).forEach((o: any) => {
          if (o.belong && o.count && Number(o.count) === 0) {
            delete clonedWalletMap[o.belong]
          }
        })
        return clonedWalletMap
      }
      return {}
    }, [walletMap])

    const getFilteredCoinMap: any = React.useCallback(() => {
      if (coinMap && getFilteredWalletMap()) {
        const clonedCoinMap = cloneDeep(coinMap)
        const remainList = {}
        Object.keys(getFilteredWalletMap()).forEach((token) => {
          if (clonedCoinMap[token]) {
            remainList[token] = clonedCoinMap[token]
          }
        })
        return remainList
      }
      return {}
    }, [coinMap, getFilteredWalletMap])

    const props: SwitchPanelProps<'tradeMenuList' | 'trade' | 'confirm'> = {
      index: panelIndex, // show default show
      panelList: [
        {
          key: 'confirm',
          element: React.useMemo(
            () => (
              // @ts-ignore
              <DepositConfirm
                {...{
                  ...rest,
                  t,
                  realToAddress: rest.isAllowInputToAddress
                    ? rest.realToAddress
                    : t('labelToMyL2', {
                        loopringL2: L1L2_NAME_DEFINED[network].loopringL2,
                        l2Symbol: L1L2_NAME_DEFINED[network].l2Symbol,
                        l1Symbol: L1L2_NAME_DEFINED[network].l1Symbol,
                        ethereumL1: L1L2_NAME_DEFINED[network].ethereumL1,
                      }),
                  tradeData: switchData.tradeData,
                  onDepositClick,
                  handleConfirm,
                }}
              />
            ),
            [rest, handleConfirm, onDepositClick, type, switchData.tradeData],
          ),
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
              // @ts-ignore
              <DepositWrap<T, I>
                key={'trade'}
                {...{
                  ...rest,
                  t,
                  type,
                  tradeData: switchData.tradeData,
                  onChangeEvent,
                  disabled: !!rest.disabled,
                  handleConfirm,
                  onDepositClick,
                  depositBtnStatus,
                  walletMap,
                  coinMap,
                  addressDefault,
                  allowTrade,
                  accountReady,
                }}
              />
            ),
            [
              rest,
              switchData.tradeData,
              onChangeEvent,
              // onDepositClick,
              depositBtnStatus,
              walletMap,
              coinMap,
              addressDefault,
              allowTrade,
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
                  walletMap: getFilteredWalletMap(),
                  coinMap: getFilteredCoinMap() as CoinMap<I, CoinInfo<I>>,
                  //oinMap
                }}
              />
            ),
            [rest, onChangeEvent, switchData.tradeData, getFilteredWalletMap, getFilteredCoinMap],
          ),
          toolBarItem: undefined,
          // toolBarItem: toolBarItemBack
        },
      ],
    }
    return <SwitchPanel {...{ ...rest, t, ...props }} />
  },
) as <T, I>(props: DepositProps<T, I> & React.RefAttributes<any>) => JSX.Element

// export const TransferModal = withTranslation()
