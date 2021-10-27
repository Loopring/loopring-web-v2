import { DepositProps } from '../../tradePanel/Interface';
import { withTranslation, WithTranslation } from 'react-i18next';
import { IBData } from '@loopring-web/common-resources';
import { SwitchPanel, SwitchPanelProps } from '../../basic-lib';
import { DepositWrap, TradeMenuList, useBasicTrade } from '../../tradePanel/components';
import React from 'react';

export const DepositPanel = withTranslation('common', {withRef: true})(<T extends IBData<I>, I>(
    {
        type='TOKEN',
        onDepositClick,
        depositBtnStatus,
        ...rest
    }: DepositProps<T, I> & WithTranslation) => {

    const {
        // toolBarItemBack,
        onChangeEvent,
        index,
        switchData

    } = useBasicTrade({ ...rest });

    const props: SwitchPanelProps<'tradeMenuList' | 'trade'> = {
        index: index, // show default show
        panelList: [{
            key: "trade",
            element:React.useMemo(() => <DepositWrap<T, I> key={"transfer"}
                                                           {...{
                                                  ...rest, type,
                                                  tradeData: switchData.tradeData,
                                                  onChangeEvent,
                                                  disabled: !!rest.disabled,
                                                  onDepositClick,
                                                  depositBtnStatus,
                                              }} />,[onChangeEvent,onDepositClick,rest,switchData,depositBtnStatus,rest]),
            toolBarItem: undefined
        },
            {
                key: "tradeMenuList",
                element: React.useMemo( () => <TradeMenuList {...{
                    nonZero: false,
                    sorted: true,
                    ...rest,
                    onChangeEvent,
                    //rest.walletMap,
                    selected: switchData.tradeData.belong,
                    tradeData: switchData.tradeData,
                    //oinMap
                }}/>,[switchData,rest,onChangeEvent]),
                toolBarItem: undefined
                // toolBarItem: toolBarItemBack
            },]
    }
    return <SwitchPanel {...{...rest, ...props}} />
}) as <T, I>(props: DepositProps<T, I> & React.RefAttributes<any>) => JSX.Element;

// export const TransferModal = withTranslation()