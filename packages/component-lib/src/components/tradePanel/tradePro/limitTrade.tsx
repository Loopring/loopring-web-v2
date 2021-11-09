import { WithTranslation, withTranslation } from 'react-i18next';
import { BtnPercentage, InputCoin, InputSize } from '../../basic-lib';
import { LimitTradeData, TradeBtnStatus, TradeLimitProps } from '../Interface';
import {
    CoinInfo,
    CoinKey,
    CoinMap,
    EmptyValueTag,
    IBData,
    PriceTag,
    TradeCalcProData
} from '@loopring-web/common-resources';
import { Box, Grid, Tab, Typography } from '@mui/material';
import { TradeProType } from './Interface';
import { ButtonStyle, TabsStyle } from '../components/Styled';
import { useCommon } from './hookCommon';
import React from 'react';
import { useSettings } from '../../../stores';
import { Currency } from '@loopring-web/loopring-sdk';

// const tradeDataInit:LimitTradeData<IBData<any>> = {
//     quote: {belong:'',tradeValue:undefined,balance} as IBData<any>,
//     base:  {belong:''},
//     slippage: 0.5,
// }

export const LimitTrade = withTranslation('common', {withRef: true})(<L extends LimitTradeData<T>,
    T extends IBData<I>,
    TCD extends TradeCalcProData<I>, I = CoinKey<any>>(
    {tradeData = {type:TradeProType.sell} as L,...props}:TradeLimitProps<L,T,TCD, I> & WithTranslation
) => {
    const  {
        t,
        // disabled,
        tradeType,
        tradeLimitI18nKey,
        // tradeCalcProData,
        // handleCountChange,
        tradeLimitBtnStatus,
        tradeLimitBtnStyle,
        // tokenBaseProps,
        // tokenQuoteProps,
        // tradeData,
        // handleError,
        tokenPriceProps,
        handleSubmitEvent,
        // handleChangeIndex,
        onChangeEvent,
        // ...rest
    } =  props
    const {currency} = useSettings()
    const priceRef = React.useRef();
    const {
        quoteRef,
        baseRef,
        btnLabel,
        getDisabled,
        _handleChangeIndex,
        // inputError,
        tradeCalcProData,
        tradeBtnBaseStatus,
        handleCountChange,
        propsBase,
        propsQuote,
        onPercentage,
        selectedPercentage,
    } = useCommon({
        type: 'limit',
        ...props as any,
        tradeData,
        tradeType,
        onChangeEvent,
        i18nKey: tradeLimitI18nKey?tradeLimitI18nKey:'labelProLimitBtn',
        tradeBtnBaseStatus: tradeLimitBtnStatus
    })
    const propsPrice = React.useMemo(()=>{
        return {
            label: t('labelProPrice'),
            subLabel: `\u2248 ${currency == Currency.usd?PriceTag.Dollar:PriceTag.Yuan}`,   //'\u224'
            emptyText: t('tokenSelectToken'),
            placeholderText: '0.00',
            size:InputSize.small,
            order:'"right"' as any,
            coinLabelStyle:{color:'var(--color-text-secondary)'},
            isShowCoinIcon:false,
            ...tokenPriceProps,
            handleCountChange,
            // handleError:tabIndex === TradeProType.sell? handleError :undefined,
            maxAllow: false,

            // handleOnClick,
            t
        }
    },[tradeType,TradeProType,handleCountChange])
    const fee = (tradeCalcProData && tradeCalcProData.fee) ? ((parseFloat(tradeCalcProData.fee) / 100).toString() + '%') : EmptyValueTag

    return <Box flex={1} display={'flex'} flexDirection={'column'} alignItems={'stretch'}>
        <Box className={'tool-bar'}  paddingX={2} display={'flex'} alignItems={'center'} justifyContent={'center'}>
            <Box component={'header'} width={'100%'} >
                <TabsStyle className={'trade-tabs pro-tabs'}  variant={'fullWidth'} value={tradeType}
                      onChange={(_e, index) => _handleChangeIndex(index)} >
                    <Tab className={'trade-tab-buy'} value={TradeProType.buy} label={t('labelProBuy')}/>
                    <Tab className={'trade-tab-sell'} value={TradeProType.sell} label={t('labelProSell')}/>
                </TabsStyle>
            </Box>
        </Box>
        <Box className={'trade-panel'} paddingX={2} paddingTop={2}>
            <Box paddingTop={2}>
                <InputCoin<any, I, CoinInfo<I>> ref={priceRef as any}  name={'price'} disabled={false} {...{
                    ...propsPrice,
                    maxAllow:false,
                    isHideError: true,
                    inputData: tradeData ? tradeData.price : {} as any,
                    coinMap: tradeCalcProData && tradeCalcProData.coinInfoMap ? tradeCalcProData.coinInfoMap : {} as CoinMap<I, CoinInfo<I>>
                }} />
            </Box>
            <Box paddingTop={2}>
                <InputCoin<any, I, CoinInfo<I>> ref={baseRef as any} name={'base'} disabled={getDisabled()} {...{
                    ...propsBase,
                    // maxAllow:false,
                    isHideError: true,
                    handleCountChange,
                    inputData: tradeData ? tradeData.base : {} as any,
                    coinMap: tradeCalcProData && tradeCalcProData.coinInfoMap ? tradeCalcProData.coinInfoMap : {} as CoinMap<I, CoinInfo<I>>
                }} />
            </Box>
            {/*</Grid>*/}
            {/*<Grid item>*/}
            <Box alignSelf={"center"} paddingTop={4} paddingX={1}>
                <BtnPercentage step={1}
                               // valuetext={(value)=>`${value}%`}
                               getAriaLabel={(value)=>`${value}%`}
                               valueLabelFormat={(value)=>`${value}%`}
                               valueLabelDisplay={'on'} selected={selectedPercentage} anchors={[{
                    value: 0, label: ''
                }, {
                    value: 25, label: ''
                }, {
                    value: 50, label: ''
                }, {
                    value: 75, label: ''
                }, {
                    value: 100, label: ''
                }]} handleChanged={onPercentage}  />
            </Box>
            <Box paddingTop={2}>
                <InputCoin<any, I, CoinInfo<I>> ref={quoteRef} name={'quote'} disabled={getDisabled()}  {...{
                    ...propsQuote,
                    isHideError: true,
                    handleCountChange,
                    inputData: tradeData ? tradeData.quote : {} as any,
                    coinMap: tradeCalcProData && tradeCalcProData.coinInfoMap ? tradeCalcProData.coinInfoMap : {} as CoinMap<I, CoinInfo<I>>
                }} />
            </Box>
            {/*</Grid>*/}
            {/*<Grid item>*/}

            {/*< label={tradeCalcProData.baseToken} coinMap={tradeCalcProData.coinMap} />*/}
        </Box>
        <Box className={'info-panel'} paddingX={2} paddingTop={2}>

        {/* <Grid container justifyContent={'space-between'} direction={"row"} alignItems={"center"}
              marginTop={1 / 2} >
            <Typography component={'p'} variant="body2"
                        color={'textSecondary'}> {t('swapFee')} </Typography>
            <Typography component={'p'}
                        variant="body2" color={'textPrimary'}>{fee}</Typography>
        </Grid> */}
        </Box>
        <Box paddingX={2} paddingTop={2}>
            {/*{getDisabled()} {tradeBtnBaseStatus}*/}
            <ButtonStyle variant={'contained'} size={'medium'}
                         color={tradeType === TradeProType.sell ?'error':'success'}
                         loadingbg={tradeType === TradeProType.sell ?'var(--color-error)' :'var(--color-success)'}
                         style={tradeLimitBtnStyle} onClick={() => {
                handleSubmitEvent(tradeData)
            }}
                         loading={!getDisabled() && tradeBtnBaseStatus === TradeBtnStatus.LOADING ? 'true' : 'false'}
                         disabled={getDisabled() || tradeBtnBaseStatus === TradeBtnStatus.DISABLED || tradeBtnBaseStatus === TradeBtnStatus.LOADING }
                         fullWidth={true}>
                {btnLabel}
            </ButtonStyle>
        </Box>
    </Box>
}) as <L extends LimitTradeData<T>,
    T extends IBData<I>,
    TCD extends TradeCalcProData<I>, I = CoinKey<any>>(props: TradeLimitProps<L,T,TCD,I>) => JSX.Element


