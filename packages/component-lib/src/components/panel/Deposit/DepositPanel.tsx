import { DepositProps } from '../Interface';
import { withTranslation, WithTranslation } from 'react-i18next';
import { IBData } from '@loopring-web/common-resources';
import { SwitchPanel, SwitchPanelProps } from '../../basic-lib';
import { DepositWrap, TradeMenuList, useBasicTrade } from '../components';
import React from 'react';

export const DepositPanel = withTranslation('common', {withRef: true})(<T extends IBData<I>, I>(
    {
        // tradeData,
        // disabled,
        // coinMap,
        // walletMap,
        // handleError,
        // walletMap,
        // coinMap,
        onDepositClick,
        depositBtnStatus,
        ...rest
    }: DepositProps<T, I> & WithTranslation ) => {

    // const [transferData, setTransferData] = React.useState<SwitchData<T>>({
    //     to: 'button',
    //     tradeData: tradeData
    // } as SwitchData<T>);
    // const [index, setIndex] = React.useState(0);
    const {
        toolBarItemBack,
        onChangeEvent,
        index,
        switchData

    } = useBasicTrade({...rest});

    const props: SwitchPanelProps<'tradeMenuList' | 'trade'> = {
        index: index, // show default show
        panelList: [{
            key: "trade",
            element: () => <DepositWrap<T, I> key={"transfer"}
                                              {...{
                                                  ...rest,
                                                  tradeData: switchData.tradeData,
                                                  onChangeEvent,
                                                  disabled: rest.disabled ? true : false,
                                                  // onCoinValueChange,
                                                  // coinMap,
                                                  // walletMap,
                                                  // disabled,
                                                  // handleError,
                                                  onDepositClick,
                                                  depositBtnStatus,
                                              }} />,
            toolBarItem: () => <></>
        },
            {
                key: "tradeMenuList",
                element: () => <TradeMenuList {...{
                    ...rest,
                    onChangeEvent,
                    //rest.walletMap,
                    selected: switchData.tradeData.belong as string,
                    tradeData: switchData.tradeData,
                    //oinMap
                }}/>,
                toolBarItem: () => <>{toolBarItemBack}</>
            },]
    }
    return <SwitchPanel {...{...rest, ...props}} />
}) as <T, I>(props: DepositProps<T, I> & React.RefAttributes<any>) => JSX.Element;

// export const TransferModal = withTranslation()