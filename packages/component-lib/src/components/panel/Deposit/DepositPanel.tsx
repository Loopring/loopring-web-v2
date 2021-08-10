import { DepositProps } from '../Interface';
import { withTranslation, WithTranslation } from 'react-i18next';
import { IBData } from '@loopring-web/common-resources';
import { SwitchPanel, SwitchPanelProps } from '../../basic-lib';
import { DepositWrap, TradeMenuList, useBasicTrade } from '../components';
import React from 'react'

export const DepositPanel = withTranslation('common', { withRef: true })(<T extends IBData<I>, I>(
    {
        onDepositClick,
        depositBtnStatus,
        ...rest
    }: DepositProps<T, I> & WithTranslation) => {

    const {
        toolBarItemBack,
        onChangeEvent,
        index,
        switchData

    } = useBasicTrade({ ...rest });

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
                selected: switchData.tradeData.belong as string,
                tradeData: switchData.tradeData,
            }} />,
            toolBarItem: () => <>{toolBarItemBack}</>
        },]
    }
    return <SwitchPanel {...{ ...rest, ...props }} />
}) as <T, I>(props: DepositProps<T, I> & React.RefAttributes<any>) => JSX.Element;
