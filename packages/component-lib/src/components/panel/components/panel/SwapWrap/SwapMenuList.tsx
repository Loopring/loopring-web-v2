import { SwitchData } from '../../../Interface';
import { IBData, TradeCalcData } from 'static-resource';
import { WithTranslation } from 'react-i18next';
import React from 'react';
import { TradeMenuList } from '../../tool/TradeMenuList';
import { SwapMenuListProps } from './Interface';

export const SwapMenuList = <T extends IBData<I>,
    I,
    TCD extends TradeCalcData<I>>({
                                      onChangeEvent,
                                      tradeCalcData,
                                      swapData,
                                      ...rest
                                  }: SwapMenuListProps<T, TCD> & WithTranslation) => {
    const selected: string | undefined = swapData.tradeData[ swapData.type ].belong ? swapData.tradeData[ swapData.type ]?.belong : '';
    const tradeData = swapData.tradeData[ swapData.type ];
    const coinMap = swapData.type === 'sell' ? tradeCalcData?.sellCoinInfoMap : tradeCalcData?.buyCoinInfoMap as any;
    const walletMap = tradeCalcData?.walletMap as any;   //IBData<I>
    const handleOnChangeIndex = React.useCallback((index: 0 | 1, {tradeData, to}: SwitchData<IBData<I>>) => {
        console.log('SwapMenuList item handleSelect', tradeData, swapData)
        onChangeEvent(index, {
            ...swapData,
            tradeData: {...swapData.tradeData, [ swapData.type ]: tradeData},
            to: to,
        });
    }, [swapData, onChangeEvent])
    return <TradeMenuList  {...{
        ...rest,
        selected,
        tradeData,
        coinMap,
        walletMap,
        onChangeEvent: handleOnChangeIndex
    }}  />
}
