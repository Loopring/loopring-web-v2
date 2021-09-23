import { WithTranslation, withTranslation } from 'react-i18next';
import { BtnPercentage, InputCoin, InputSize } from '../../basic-lib';
import { LimitTradeData, TradeBtnStatus, TradeLimitProps } from '../Interface';
import { CoinInfo, CoinKey, CoinMap, EmptyValueTag, IBData, TradeCalcProData } from '@loopring-web/common-resources';
import { Box, Grid, Tab, Tabs, Typography } from '@mui/material';
import { TradeProType } from './Interface';
import { ButtonStyle } from '../components/Styled';
import { useCommon } from './hookCommon';
import React from 'react';

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
        tradeLimitI18nKey,
        // tradeCalcProData,
        // handleCountChange,
        tradeLimitBtnStatus,
        tradeLimitBtnStyle,
        // tokenBaseProps,
        // tokenQuoteProps,
        // tradeData,
        // handleError,
        handleSubmitEvent,
        // handleChangeIndex,
        onChangeEvent,
        // ...rest
    } =  props
    const priceRef = React.useRef();
    // const _handleCountChange = React.useCallback((ibData: IBData<I>,name:string, _ref: any) => {
    //     console.log('limitTrade: handleUser input :',ibData,name)
    //     // const base = tradeData[TradeBaseType.base];
    //     // const price = tradeData[TradeBaseType.price];
    //     // const quote = tradeData[TradeBaseType.quote];
    //     const _tradeData = {
    //         ...tradeData,
    //         // base,
    //         // price,
    //         // quote,
    //         [name]: ibData,
    //     }
    //     onChangeEvent(_tradeData,TradeBaseType[name])
    //
    // }, [tradeData,onChangeEvent]);
    const {
        quoteRef,
        baseRef,
        btnLabel,
        getDisabled,
        _handleChangeIndex,
        inputError,
        tabIndex,
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
        onChangeEvent,
        i18nKey: tradeLimitI18nKey?tradeLimitI18nKey:'labelProLimitBtn',
        tradeBtnBaseStatus: tradeLimitBtnStatus
    })
    const propsPrice = React.useMemo(()=>{
        return {
            label: t('labelProPrice'),
            subLabel: t('tokenMax'),
            emptyText: t('tokenSelectToken'),
            placeholderText: '0.00',
            size:InputSize.small,
            order:'"right"' as any,
            coinLabelStyle:{color:'var(--color-text-secondary)'},
            isShowCoinIcon:false,
            // ...tokenQuoteProps,
            handleCountChange,
            // handleError:tabIndex === TradeProType.sell? handleError :undefined,
            maxAllow: false,

            // handleOnClick,
            t
        }
    },[tabIndex,TradeProType,handleCountChange])
    const fee = (tradeCalcProData && tradeCalcProData.fee) ? ((parseFloat(tradeCalcProData.fee) / 100).toString() + '%') : EmptyValueTag

    return <Box flex={1} display={'flex'} flexDirection={'column'} alignItems={'stretch'}>
        <Box className={'tool-bar'}  paddingX={2} display={'flex'} alignItems={'center'} justifyContent={'center'}>
            <Box component={'header'} width={'100%'} >
                <Tabs variant={'fullWidth'} value={tabIndex}
                      onChange={(_e, index) => _handleChangeIndex(index)} className={'pro-tabs'}>
                    <Tab value={TradeProType.buy} label={t('labelProBuy')}/>
                    <Tab value={TradeProType.sell} label={t('labelProSell')}/>
                </Tabs>
            </Box>
        </Box>
        <Box className={'trade-panel'} paddingX={2} paddingTop={2}>
            <Box paddingTop={2}>
                <InputCoin<any, I, CoinInfo<I>> ref={priceRef as any}  name={'price'} disabled={false} {...{
                    ...propsPrice,
                    // maxAllow:false,
                    isHideError: true,
                    inputData:tradeData ? tradeData.price : {} as any,
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
                <BtnPercentage step={25}
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

        <Grid container justifyContent={'space-between'} direction={"row"} alignItems={"center"}
              marginTop={1 / 2} >
            <Typography component={'p'} variant="body2"
                        color={'textSecondary'}> {t('swapFee')} </Typography>
            <Typography component={'p'}
                        variant="body2" color={'textPrimary'}>{fee}</Typography>
        </Grid>
        </Box>
        <Box paddingX={2} paddingTop={2}>
            <ButtonStyle variant={'contained'} size={'medium'}
                         color={tabIndex === TradeProType.sell ?'success':'error'}
                         style={tradeLimitBtnStyle} onClick={() => {
                handleSubmitEvent(tradeData)
            }}
                         loading={!getDisabled() && tradeBtnBaseStatus === TradeBtnStatus.LOADING ? 'true' : 'false'}
                         disabled={getDisabled() || tradeBtnBaseStatus === TradeBtnStatus.DISABLED || tradeBtnBaseStatus === TradeBtnStatus.LOADING || inputError.error}
                         fullWidth={true}>{btnLabel}
            </ButtonStyle>
        </Box>
    </Box>
}) as <L extends LimitTradeData<T>,
    T extends IBData<I>,
    TCD extends TradeCalcProData<I>, I = CoinKey<any>>(props: TradeLimitProps<L,T,TCD,I>) => JSX.Element


