import { WithTranslation, withTranslation } from 'react-i18next';
import {  InputCoin } from '../../basic-lib';
import { LimitTradeData, TradeBtnStatus, TradeLimitProps } from '../Interface';
import { CoinInfo, CoinKey, CoinMap, IBData, TradeCalcData } from '@loopring-web/common-resources';
import { Box, Tab, Tabs } from '@mui/material';
import { TradeProType } from './Interface';
import { ButtonStyle } from '../components/Styled';
import { useCommon } from './hookCommon';

// const tradeDataInit:LimitTradeData<IBData<any>> = {
//     sell: {belong:'',tradeValue:undefined,balance} as IBData<any>,
//     buy:  {belong:''},
//     slippage: 0.5,
// }

export const LimitTrade = withTranslation('common', {withRef: true})(<L extends LimitTradeData<T>,
    T extends IBData<I>,
    TCD extends TradeCalcData<I>, I = CoinKey<any>>(
    {tradeData = {} as L,...props}:TradeLimitProps<L,T,TCD, I> & WithTranslation
) => {
    const  {
        t,
        // disabled,
        tradeLimitI18nKey,
        // tradeCalcData,
        tradeLimitBtnStatus,
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
        // i18nKey : tradeLimitI18nKey,
        tradeCalcData,
        tradeBtnBaseStatus,
        propsBuy,
        propsSell,
    } = useCommon({
        ...props as any,
        tradeData,
        i18nKey: tradeLimitI18nKey?tradeLimitI18nKey:'labelTrade',
        tradeBtnBaseStatus: tradeLimitBtnStatus
    })
    return <Box flex={1} display={'flex'} flexDirection={'column'} alignItems={'stretch'}>
        <Box className={'tool-bar'} paddingTop={2} paddingX={2} display={'flex'} alignItems={'stretch'}>
            <Tabs value={tradeData?.type ?? TradeProType.buy}
                  onChange={(_e, index) => _handleChangeIndex(index)} className={'pro-tabs'}>
                <Tab value={TradeProType.buy} label={t('labelProBuy')}/>

                <Tab value={TradeProType.sell} label={t('labelProSell')}/>
            </Tabs>
        </Box>
        <Box className={'trade-panel'} paddingX={2} paddingTop={2}>

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
        <Box paddingX={2} paddingTop={2}>
            <ButtonStyle variant={'contained'} size={'large'} color={'primary'} onClick={() => {
                // onSwapClick(swapData.tradeData)
            }}
                         loading={!getDisabled() && tradeBtnBaseStatus === TradeBtnStatus.LOADING ? 'true' : 'false'}
                         disabled={getDisabled() || tradeBtnBaseStatus === TradeBtnStatus.DISABLED || tradeBtnBaseStatus === TradeBtnStatus.LOADING || inputError.error}
                         fullWidth={true}>{btnLabel}
            </ButtonStyle>
        </Box>
    </Box>
}) as <L extends LimitTradeData<T>,
    T extends IBData<I>,
    TCD extends TradeCalcData<I>, I = CoinKey<any>>(props: TradeLimitProps<L,T,TCD,I>) => JSX.Element


