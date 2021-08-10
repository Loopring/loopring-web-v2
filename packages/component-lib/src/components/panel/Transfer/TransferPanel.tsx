import { WithTranslation, withTranslation } from 'react-i18next';
import { SwitchPanel, SwitchPanelProps } from '../../basic-lib';
import { TransferProps } from '../Interface';
import { IBData } from '@loopring-web/common-resources';
import { TradeMenuList, TransferWrap, useBasicTrade } from '../components';
import React from 'react';

export const TransferPanel = withTranslation('common', {withRef: true})(<T extends IBData<I>, I>(
    {
        // tradeData,
        // disabled,
        // coinMap,
        // walletMap,
        // handleError,

        // walletMap,
        // coinMap,
        chargeFeeTokenList,
        onTransferClick,
        transferBtnStatus,
        ...rest
    }: TransferProps<T, I> & WithTranslation) => {

    // const [transferData, setTransferData] = React.useState<SwitchData<T>>({
    //     to: 'button',
    //     tradeData: tradeData
    // } as SwitchData<T>);
    // const [index, setIndex] = React.useState(0);
    const {
        //toolbar UI
        toolBarItemBack,
        //Data, panel and function
        onChangeEvent,
        index,
        switchData

    } = useBasicTrade({...rest});

    const props: SwitchPanelProps<'tradeMenuList' | 'trade'> = {
        index: index, // show default show
        panelList: [{
            key: "trade",
            element: React.useMemo(() => <TransferWrap<T, I> key={"transfer"}
                                                             {...{
                                                                 ...rest,
                                                                 chargeFeeTokenList: chargeFeeTokenList ? chargeFeeTokenList : [],
                                                                 tradeData: switchData.tradeData,
                                                                 onChangeEvent,
                                                                 disabled: !!rest.disabled,
                                                                 onTransferClick,
                                                                 transferBtnStatus,

                                                             }} />, [onChangeEvent, chargeFeeTokenList, rest, switchData, onTransferClick, transferBtnStatus]),
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
                toolBarItem: toolBarItemBack
            },]
    }
    return <SwitchPanel {...{...rest, ...props}} />
}) as <T, I>(props: TransferProps<T, I> & React.RefAttributes<any>) => JSX.Element;