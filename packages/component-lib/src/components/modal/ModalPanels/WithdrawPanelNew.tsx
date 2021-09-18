import { WithTranslation, withTranslation } from 'react-i18next';
import { SwitchPanel, SwitchPanelProps } from '../../basic-lib';
import { WithdrawProps } from '../../tradePanel/Interface';
import { IBData } from '@loopring-web/common-resources';
import { TradeMenuList, useBasicTrade, /* WithdrawWrap */ WithdrawWrapNew } from '../../tradePanel/components';
import React from 'react';

export const WithdrawPanelNew = withTranslation('common', {withRef: true})(<T extends IBData<I>, I>(
    {
        // tradeData,
        // disabled,
        // coinMap,
        // walletMap,
        // handleError,

        // walletMap,
        // coinMap,
        chargeFeeTokenList,
        onWithdrawClick,
        withdrawBtnStatus,
        assetsData,
        ...rest
    }: WithdrawProps<T, I> & WithTranslation & { assetsData: any[] }) => {

    // const [transferData, setTransferData] = React.useState<SwitchData<T>>({
    //     to: 'button',
    //     tradeData: tradeData
    // } as SwitchData<T>);
    // const [index, setIndex] = React.useState(0);
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
            element: React.useMemo( () => <WithdrawWrapNew<T, I> key={"transfer"}
                                               {...{
                                                   ...rest,
                                                   chargeFeeTokenList: chargeFeeTokenList ? chargeFeeTokenList : [],
                                                   tradeData: switchData.tradeData,
                                                   onChangeEvent,
                                                   disabled: !!rest.disabled,
                                                   onWithdrawClick,
                                                   withdrawBtnStatus,
                                                   assetsData,
                                               }} />,[onChangeEvent,chargeFeeTokenList,rest,switchData,onWithdrawClick,withdrawBtnStatus, assetsData]),
            toolBarItem: undefined
        },
            {
                key: "tradeMenuList",
                element: React.useMemo( () => <TradeMenuList {...{
                    nonZero: true,
                    sorted: true,
                    ...rest,
                    onChangeEvent,
                    //rest.walletMap,
                    selected: switchData.tradeData.belong,
                    tradeData: switchData.tradeData,
                    //oinMap
                }}/>,[switchData,rest,onChangeEvent]),
                toolBarItem: undefined
            },]
    }
    return <SwitchPanel {...{...rest, ...props}} />
}) as <T, I>(props: WithdrawProps<T, I> & React.RefAttributes<any>) => JSX.Element;