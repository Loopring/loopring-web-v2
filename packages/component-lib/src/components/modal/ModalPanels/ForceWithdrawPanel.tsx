import { WithTranslation, withTranslation } from 'react-i18next'
import { ModalBackButton, SwitchPanel, SwitchPanelProps } from '../../basic-lib'
import { ForceWithdrawProps } from '../../tradePanel'
import { IBData, TRADE_TYPE } from '@loopring-web/common-resources'
import { TradeMenuList, useBasicTrade } from '../../tradePanel/components'
import React from 'react'
import { ForceWithdrawWrap } from '../../tradePanel/components/ForceWithdrawWrap'

export const ForceWithdrawPanel = withTranslation(['common', 'error'], {
  withRef: true,
})(
  <T extends IBData<I>, I>({
    type = TRADE_TYPE.TOKEN,
    chargeFeeTokenList,
    onWithdrawClick,
    withdrawBtnStatus,
    assetsData,
    walletMap = {},
    coinMap = {},
    onBack,
    ...rest
  }: ForceWithdrawProps<T, I> & WithTranslation & { assetsData: any[] }) => {
    const { onChangeEvent, index, switchData } = useBasicTrade({
      ...rest,
      coinMap,
      type,
      walletMap,
    })
    const [panelIndex, setPanelIndex] = React.useState(index + 1)
    React.useEffect(() => {
      setPanelIndex(index + 1)
    }, [index])

    // LP token should not exist in withdraw panel for now

    const props: SwitchPanelProps<string> = {
      index: panelIndex, // show default show
      panelList: [
        {
          key: 'confirm',
          element: React.useMemo(
            () => (
              // @ts-ignore
              // <ForceWithdrawConfirm
              //   {...{
              //     ...rest,
              //     onWithdrawClick,
              //     type,
              //     tradeData: switchData.tradeData,
              //     handleConfirm,
              //   }}
              // />
              <></>
            ),
            [onWithdrawClick, rest, switchData.tradeData, type],
          ),
          toolBarItem: (
            <>
              <ModalBackButton
                marginTop={0}
                marginLeft={-2}
                onBack={() => {
                  setPanelIndex(1)
                }}
                {...rest}
              />
            </>
          ),
        },
        {
          key: 'trade',
          element: React.useMemo(
            () => (
              // @ts-ignore
              <ForceWithdrawWrap
                key={'transfer'}
                {...{
                  ...rest,
                  type,
                  // handleConfirm,
                  chargeFeeTokenList: chargeFeeTokenList ? chargeFeeTokenList : [],
                  tradeData: { ...switchData.tradeData, ...rest.tradeData },
                  onChangeEvent,
                  coinMap,
                  disabled: !!rest.disabled,
                  onWithdrawClick,
                  withdrawBtnStatus,
                  assetsData,
                  walletMap,
                }}
              />
            ),
            [
              rest,
              type,
              chargeFeeTokenList,
              switchData.tradeData,
              onChangeEvent,
              coinMap,
              onWithdrawClick,
              withdrawBtnStatus,
              assetsData,
              walletMap,
            ],
          ),
          toolBarItem: undefined,
        },
      ].concat(
        type === 'TOKEN'
          ? ([
              {
                key: 'tradeMenuList',
                element: React.useMemo(
                  () => (
                    <TradeMenuList
                      {...{
                        nonZero: true,
                        sorted: true,
                        ...rest,
                        onChangeEvent,
                        coinMap,
                        selected: switchData.tradeData.belong,
                        tradeData: switchData.tradeData,
                        walletMap,
                        //oinMap
                      }}
                    />
                  ),
                  [walletMap, switchData, rest, onChangeEvent],
                ),
                toolBarItem: undefined,
              },
            ] as any)
          : [],
      ),
    }
    return <SwitchPanel {...{ ...rest, ...props }} />
  },
) as <T, I>(props: ForceWithdrawProps<T, I> & React.RefAttributes<any>) => JSX.Element
