import { IBData } from '@loopring-web/common-resources';
import { BasicACoinTradeHookProps } from '../Interface';
import React from 'react';
import { SwitchData } from '../../Interface';
import { useDeepCompareEffect } from 'react-use';
import { ToolBarItemBack } from '../tool';

export const useBasicTrade = <T extends IBData<I>,
    I>({tradeData, handlePanelEvent, walletMap, coinMap, ...rest}: BasicACoinTradeHookProps<T, I>) => {
    tradeData = tradeData ? tradeData : {} as T;
    // data used on trade input btn click to menu list and back to the input data transfer
    const [switchData, setSwitchData] = React.useState<SwitchData<T>>({
        to: 'button',
        tradeData: tradeData
    } as SwitchData<T>);
    // index is switch panel index number 1 is btn view
    const [index, setIndex] = React.useState(0);
    useDeepCompareEffect(() => {
        if (tradeData !== switchData.tradeData) {
            setSwitchData({...switchData, tradeData: tradeData});
        }
    }, [tradeData]);
    const onChangeEvent = React.useCallback(async (_index: 0 | 1, {to, tradeData}: SwitchData<T>) => {
        if (handlePanelEvent) {
            await handlePanelEvent({to, tradeData}, `To${to}` as any);
        }
        if (typeof rest.onChangeEvent == 'function') {
            setSwitchData(rest.onChangeEvent(_index, {to, tradeData}));
        } else {
            if (to === 'menu') {
                setSwitchData({tradeData, to});
            } else if (to === 'button') {
                const count = tradeData.belong ? walletMap[ tradeData.belong ]?.count : 0;
                setSwitchData({tradeData: {...tradeData, balance: count}, to});
            }
        }
        if (_index !== index) {
            setIndex(_index);
        }
    }, [handlePanelEvent, tradeData, walletMap, coinMap, rest, index]);

    const toolBarItemBack = React.useMemo(() => <ToolBarItemBack onChangeEvent={onChangeEvent}
                                                                 tradeData={tradeData}/>, [tradeData, onChangeEvent])
    return {
        //toolbar UI
        toolBarItemBack,
        //Data, panel and function
        onChangeEvent,
        index,
        switchData

    }
}