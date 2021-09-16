import { WithTranslation, withTranslation } from 'react-i18next';
import { InputButton, InputCoin } from '../../basic-lib';
import { LimitTradeData, TradeLimitProps } from '../Interface';
import { CoinInfo, CoinKey, CoinMap, ExchangeIcon, IBData, TradeCalcData } from '@loopring-web/common-resources';
import { Box, Tab, Tabs } from '@mui/material';
import { TabContext } from '@mui/lab';
import { TradeProType } from './Interface';
import React from 'react';
import { IconButtonStyled } from '../components/Styled';

// const tradeDataInit:LimitTradeData<IBData<any>> = {
//     sell: {belong:'',tradeValue:undefined,balance} as IBData<any>,
//     buy:  {belong:''},
//     slippage: 0.5,
// }

export const limitTrade = withTranslation('common', {withRef: true})(<L extends LimitTradeData<T>,
    T extends IBData<I>,
    TCD extends TradeCalcData<I>, I = CoinKey<any>>(
    {
        t,
        // disabled,
        // tradeLimitI18nKey,
        // tradeCalcData,
        // TradeLimitBtnStatus,
        // tokenPriceProps,
        // tokenBuyProps,
        // tokenSellProps,
        // tradeData = {},
        // handleSubmitEvent,
        // onChangeEvent,
        // handleChangeIndex,
    }: TradeLimitProps<L,T,TCD, I> & WithTranslation
) => {
    // const _handleChangeIndex = React.useCallback((index:TradeProType)=>{
    //     if(handleChangeIndex){
    //         tradeData =  handleChangeIndex(index)
    //     }else{
    //         tradeData.type = index
    //     }
    //     onChangeEvent(tradeData)
    // },[tradeData])
    // const _onChangeEvent = React.useCallback((_tradeData)=>{
    //     if(onChangeEvent) {
    //         onChangeEvent({
    //            ...tradeData,
    //             _tradeData,
    //         })
    //     }
    // },[tradeData])
    return <Box flex={1} display={'flex'} flexDirection={'row'} alignItems={'stretch'}>
           {/*<Box className={'tool-bar'} paddingTop={2} paddingX={2} display={'flex'}  alignItems={'stretch'}>*/}
           {/*    <Tabs value={tradeData?.type??TradeProType.buy}*/}
           {/*          onChange={(e, index) => _handleChangeIndex(index)} className={'pro-tabs'}  >*/}
           {/*      <Tab value={TradeProType.buy} label={t('labelProBuy')}/>*/}

           {/*      <Tab value={TradeProType.sell} label={t('labelProSell')}/>*/}
           {/*    </Tabs>*/}
           {/*</Box>*/}
        <Box className={'trade-panel'} >

            {/*<InputCoin<any, I, CoinInfo<I>> ref={buyRef} disabled={getDisabled()} {...{*/}
            {/*    ...propsBuy,*/}
            {/*    // maxAllow:false,*/}
            {/*    isHideError: true,*/}
            {/*    inputData: tradeData ? tradeData.buy : {} as any,*/}
            {/*    coinMap: tradeCalcData && tradeCalcData.coinInfoMap ? tradeCalcData.coinInfoMap : {} as CoinMap<I, CoinInfo<I>>*/}
            {/*}} />*/}
            {/*/!*</Grid>*!/*/}
            {/*/!*<Grid item>*!/*/}
            {/*<Box alignSelf={"center"} marginY={1}>*/}

            {/*</Box>*/}
            {/*<InputButton<any, I, CoinInfo<I>> ref={sellRef} disabled={getDisabled()}  {...{*/}
            {/*    ...propsSell,*/}
            {/*    isHideError: true,*/}
            {/*    inputData: tradeData ? tradeData.sell : {} as any,*/}
            {/*    coinMap: tradeCalcData && tradeCalcData.coinInfoMap ? tradeCalcData.coinInfoMap : {} as CoinMap<I, CoinInfo<I>>*/}
            {/*}} />*/}
            {/*</Grid>*/}
            {/*<Grid item>*/}

            {/*< label={tradeCalcData.buyToken} coinMap={tradeCalcData.coinMap} />*/}
        </Box>
    </Box>
    // <InputCoin/>
})


