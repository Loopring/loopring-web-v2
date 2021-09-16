import { WithTranslation, withTranslation } from 'react-i18next';
import { MarketTradeData, TradeMarketProps } from '../Interface';
import { CoinInfo, CoinKey, CoinMap, IBData, TradeCalcData } from '@loopring-web/common-resources';
import React from 'react';
import { TradeProType } from './Interface';
import { Box, Tab, Tabs } from '@mui/material';
import { InputButton, InputCoin } from '../../basic-lib';
import { useSettings } from '../../../stores';
import { useCommon } from './hookCommon';

export const MarketTrade = withTranslation('common', {withRef: true})(<M extends MarketTradeData<T>,
    T extends IBData<I>,
    TCD extends TradeCalcData<I>, I = CoinKey<any>>(
    props: TradeMarketProps<M, T, TCD, I> & WithTranslation
) => {
    const {slippage} = useSettings();
    // onChangeEvent?: (data:L,type:TradeProType) => L,

    const  {
        t,
        // disabled,
        tradeMarketI18nKey:_tradeMarketI18nKey,
        // tradeCalcData,
        tradeMarketBtnStatus:_tradeMarketBtnStatus,
        // tokenBuyProps,
        // tokenSellProps,
        tradeData,
        // handleError,
        // handleSubmitEvent,
        // handleChangeIndex,
        // onChangeEvent,
        // ...rest
    } =  props
    const {
        sellRef,
        buyRef,
        // slippage,
        getDisabled,
        handleCountChange,
        _handleChangeIndex,
        i18nKey : tradeMarketI18nKey,
        tradeCalcData,
        tradeBtnBaseStatus:tradeMarketBtnStatus,
        propsBuy,
        propsSell,
    } = useCommon({
        ...props,
        tradeData,
        i18nKey: _tradeMarketI18nKey,
        tradeBtnBaseStatus: _tradeMarketBtnStatus
    })
    return <Box flex={1} display={'flex'} flexDirection={'row'} alignItems={'stretch'}>
        <Box className={'tool-bar'} paddingTop={2} paddingX={2} display={'flex'} alignItems={'stretch'}>
            <Tabs value={tradeData?.type ?? TradeProType.buy}
                  onChange={(_e, index) => _handleChangeIndex(index)} className={'pro-tabs'}>
                <Tab value={TradeProType.buy} label={t('labelProBuy')}/>

                <Tab value={TradeProType.sell} label={t('labelProSell')}/>
            </Tabs>
        </Box>
        <Box className={'trade-panel'} >

            <InputCoin<any, I, CoinInfo<I>> ref={buyRef} disabled={getDisabled()} {...{
                ...propsBuy,
                // maxAllow:false,
                isHideError: true,
                inputData: tradeData ? tradeData.buy : {} as any,
                coinMap: tradeCalcData && tradeCalcData.coinInfoMap ? tradeCalcData.coinInfoMap : {} as CoinMap<I, CoinInfo<I>>
            }} />
            {/*</Grid>*/}
            {/*<Grid item>*/}
            <Box alignSelf={"center"} marginY={1}>

            </Box>
            <InputButton<any, I, CoinInfo<I>> ref={sellRef} disabled={getDisabled()}  {...{
                ...propsSell,
                isHideError: true,
                inputData: tradeData ? tradeData.sell : {} as any,
                coinMap: tradeCalcData && tradeCalcData.coinInfoMap ? tradeCalcData.coinInfoMap : {} as CoinMap<I, CoinInfo<I>>
            }} />
            {/*</Grid>*/}
            {/*<Grid item>*/}

            {/*< label={tradeCalcData.buyToken} coinMap={tradeCalcData.coinMap} />*/}
        </Box>
    </Box>
})
