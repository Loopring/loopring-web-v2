import { ResetProps } from '../Interface';
import { withTranslation, WithTranslation } from 'react-i18next';
import { IBData } from '@loopring-web/common-resources';
import { SwitchPanel, SwitchPanelProps } from '../../basic-lib';
import { ResetWrap, TradeMenuList, useBasicTrade } from '../components';
import React from 'react';

export const ResetPanel = withTranslation('common', {withRef: true})(<T extends IBData<I>, I>(
    {
        // tradeData,
        // disabled,
        // coinMap,
        // walletMap,
        // handleError,

        // walletMap,
        // coinMap,
        onResetClick,
        resetBtnStatus,
        fee,
        ...rest
    }: ResetProps<T, I> & WithTranslation) => {
    const {
        //toolbar UI
        // toolBarItemBack,
        //Data, panel and function
        onChangeEvent,
        index,
        switchData

    } = useBasicTrade({...rest});

    const props: SwitchPanelProps<'tradeMenuList' | 'trade'> = {
        index: index, // show default show
        panelList: [{
            key: "trade",
            element: React.useMemo(  () => <ResetWrap<T, I> key={"transfer"}
                                            {...{
                                                ...rest,
                                                tradeData: switchData.tradeData,
                                                onChangeEvent,
                                                disabled: rest.disabled ? true : false,
                                                fee,
                                                resetBtnStatus,
                                                onResetClick,
                                            }} />,[onChangeEvent,onResetClick,rest,switchData,resetBtnStatus,rest]),
            toolBarItem: undefined
        },
            {
                key: "tradeMenuList",
                element: () => <TradeMenuList {...{
                    ...rest,
                    onChangeEvent,
                    //rest.walletMap,
                    selected: switchData.tradeData.belong,
                    tradeData: switchData.tradeData,
                    //oinMap
                }}/>,
                toolBarItem: undefined
                // toolBarItem: toolBarItemBack
            },]
    }
    return <SwitchPanel {...{...rest, ...props}} />
}) as <T, I>(props: ResetProps<T, I> & React.RefAttributes<any>) => JSX.Element;

// export const TransferModal = withTranslation()