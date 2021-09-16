import { WithTranslation, withTranslation } from 'react-i18next';
import { MarketTradeData, TradeBtnStatus, TradeMarketProps } from '../Interface';
import { CoinInfo, CoinKey, CoinMap, IBData, TradeCalcData } from '@loopring-web/common-resources';
import { TradeProType } from './Interface';
import { Box, Tab, Tabs } from '@mui/material';
import {  InputCoin } from '../../basic-lib';
import { useCommon } from './hookCommon';
import { ButtonStyle } from '../components/Styled';

export const MarketTrade = withTranslation('common', {withRef: true})(<M extends MarketTradeData<T>,
    T extends IBData<I>,
    TCD extends TradeCalcData<I>, I = CoinKey<any>>(
    {tradeData = {} as M,...props}: TradeMarketProps<M, T, TCD, I> & WithTranslation
) => {
    // const {slippage} = useSettings();
    // onChangeEvent?: (data:L,type:TradeProType) => L,

    const  {
        t,
        // disabled,
        tradeMarketI18nKey,
        // tradeCalcData,
        tradeMarketBtnStatus,
        // tokenBuyProps,
        // tokenSellProps,
        // tradeData,
        // handleError,
        // handleSubmitEvent,
        // handleChangeIndex,
        // onChangeEvent,
        // ...rest
    } =  props
    const {
        sellRef,
        buyRef,
        btnLabel,
        getDisabled,
        _handleChangeIndex,
        inputError,
        // i18nKey : tradeMarketI18nKey,
        tradeCalcData,
        tradeBtnBaseStatus,
        propsBuy,
        propsSell,
    } = useCommon({
        ...props as any,
        tradeData,
        i18nKey: tradeMarketI18nKey?tradeMarketI18nKey:'labelTrade',
        tradeBtnBaseStatus: tradeMarketBtnStatus
    })
    return <Box flex={1} display={'flex'} flexDirection={'column'} alignItems={'stretch'}>
        <Box className={'tool-bar'} paddingTop={2} paddingX={2} display={'flex'} alignItems={'stretch'}>
            <Tabs value={tradeData?.type ?? TradeProType.buy}
                  onChange={(_e, index) => _handleChangeIndex(index)} className={'pro-tabs'}>
                <Tab value={TradeProType.buy} label={t('labelProBuy')}/>

                <Tab value={TradeProType.sell} label={t('labelProSell')}/>
            </Tabs>
        </Box>
        <Box className={'trade-panel'} >

            <InputCoin<any, I, CoinInfo<I>> ref={buyRef as any} disabled={getDisabled()} {...{
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
            <InputCoin<any, I, CoinInfo<I>> ref={sellRef} disabled={getDisabled()}  {...{
                ...propsSell,
                isHideError: true,
                inputData: tradeData ? tradeData.sell : {} as any,
                coinMap: tradeCalcData && tradeCalcData.coinInfoMap ? tradeCalcData.coinInfoMap : {} as CoinMap<I, CoinInfo<I>>
            }} />
            {/*</Grid>*/}
            {/*<Grid item>*/}

            {/*< label={tradeCalcData.buyToken} coinMap={tradeCalcData.coinMap} />*/}
        </Box>
        <Box>
            <ButtonStyle variant={'contained'} size={'large'} color={'primary'} onClick={() => {
                // onSwapClick(swapData.tradeData)
            }}
                         loading={!getDisabled() && tradeBtnBaseStatus === TradeBtnStatus.LOADING ? 'true' : 'false'}
                         disabled={getDisabled() || tradeBtnBaseStatus === TradeBtnStatus.DISABLED || tradeBtnBaseStatus === TradeBtnStatus.LOADING || inputError.error}
                         fullWidth={true}>{btnLabel}
            </ButtonStyle>
        </Box>
    </Box>
})   as <M extends MarketTradeData<T>,
    T extends IBData<I>,
    TCD extends TradeCalcData<I>, I = CoinKey<any>>(props: TradeMarketProps<M,T,TCD, I>) => JSX.Element
