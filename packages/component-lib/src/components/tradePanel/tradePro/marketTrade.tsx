import { WithTranslation, withTranslation } from 'react-i18next';
import { MarketTradeData, TradeBaseType, TradeBtnStatus, TradeMarketProps } from '../Interface';
import {
    CoinInfo,
    CoinKey,
    CoinMap,
    EmptyValueTag,
    getValuePrecisionThousand,
    IBData, SlippageTolerance,
    TradeCalcData
} from '@loopring-web/common-resources';
import { TradeProType } from './Interface';
import { Box, Grid, Tab, Tabs, Typography } from '@mui/material';
import { InputCoin, LinkActionStyle, PopoverPure } from '../../basic-lib';
import { useCommon } from './hookCommon';
import { ButtonStyle } from '../components/Styled';
import { bindHover, bindPopover } from 'material-ui-popup-state/es';
import { SlippagePanel } from '../components';
import React from 'react';
import { usePopupState } from 'material-ui-popup-state/hooks';
import { useSettings } from '../../../stores';

export const MarketTrade = withTranslation('common', {withRef: true})(<M extends MarketTradeData<T>,
    T extends IBData<I>,
    TCD extends TradeCalcData<I>, I = CoinKey<any>>(
    {tradeData = {} as M,...props}: TradeMarketProps<M, T, TCD, I> & WithTranslation
) => {
    // const {slippage} = useSettings();
    // onChangeEvent?: (data:L,type:TradeProType) => L,
    const {slippage} = useSettings();
    const slippageArray: Array<number | string> = SlippageTolerance.concat(`slippage:${slippage}`) as Array<number | string>;
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
        onChangeEvent,
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
        onChangeEvent,
        i18nKey: tradeMarketI18nKey?tradeMarketI18nKey:'labelTrade',
        tradeBtnBaseStatus: tradeMarketBtnStatus
    })
    const popupState = usePopupState({
        variant: 'popover',
        popupId: 'slippagePop',
    })
    const _onSlippageChange = React.useCallback((slippage: number | string, customSlippage: number | string | undefined) => {
        popupState.close();
        onChangeEvent( {
                ...tradeData,
                slippage: slippage,
                __cache__: {
                    ...tradeData.__cache__,
                    customSlippage: customSlippage
                }},TradeBaseType.slippage);
    }, [tradeData, onChangeEvent])
    const priceImpactColor =  tradeCalcData?.priceImpactColor ? tradeCalcData.priceImpactColor : 'textPrimary'
    const priceImpact = tradeCalcData?.priceImpact ?  getValuePrecisionThousand(tradeCalcData.priceImpact) + ' %' : EmptyValueTag

    const fee = (tradeCalcData && tradeCalcData.fee) ? ((parseFloat(tradeCalcData.fee) / 100).toString() + '%') : EmptyValueTag

    const minimumReceived = tradeCalcData && tradeCalcData.minimumReceived ? tradeCalcData.minimumReceived : EmptyValueTag


    return <Box flex={1} display={'flex'} flexDirection={'column'} alignItems={'stretch'}>
        <Box className={'tool-bar'} paddingTop={2} paddingX={2} display={'flex'} alignItems={'stretch'}>
            <Tabs value={tradeData?.type ?? TradeProType.buy}
                  onChange={(_e, index) => _handleChangeIndex(index)} className={'pro-tabs'}>
                <Tab value={TradeProType.buy} label={t('labelProBuy')}/>

                <Tab value={TradeProType.sell} label={t('labelProSell')}/>
            </Tabs>
        </Box>
        <Box className={'trade-panel'} paddingTop={2} paddingX={2}  >

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
        <Box  paddingTop={2} paddingX={2} >
            <Grid container direction={"column"} spacing={1} alignItems={"stretch"}>
                <Grid item paddingBottom={3} sx={{color: 'text.secondary'}}>
                    <Grid container justifyContent={'space-between'} direction={"row"} alignItems={"center"}
                          height={24}>

                        <Typography component={'p'} variant="body2" color={'textSecondary'}>{t('swapTolerance')}</Typography>
                        <Typography component={'p'} variant="body2" >
                            {tradeCalcData ? <>
                                <Typography {...bindHover(popupState)}
                                            component={'span'} color={'textPrimary'}>
                                    <LinkActionStyle>
                                        {tradeData.slippage ? tradeData.slippage : tradeCalcData.slippage ? tradeCalcData.slippage : 0.5}%
                                    </LinkActionStyle>
                                    <PopoverPure
                                        className={'arrow-right'}
                                        {...bindPopover(popupState)}
                                        {...{
                                            anchorOrigin: {vertical: 'bottom', horizontal: 'right'},
                                            transformOrigin: {vertical: 'top', horizontal: 'right'}
                                        }}
                                    >
                                        <SlippagePanel {...{
                                            t,
                                            handleChange: _onSlippageChange,
                                            slippageList: slippageArray,
                                            slippage: tradeData.slippage ? tradeData.slippage : tradeCalcData.slippage ? tradeCalcData.slippage : 0.5
                                        }} />
                                    </PopoverPure>
                                </Typography>
                            </> : EmptyValueTag

                            }
                        </Typography>
                    </Grid>
                    <Grid container justifyContent={'space-between'} direction={"row"} alignItems={"center"} marginTop={1/2}>
                        <Typography component={'p'} variant="body2" color={'textSecondary'}> {t('swapPriceImpact')}</Typography>
                        <Typography component={'p'} color={priceImpactColor} variant="body2"> {priceImpact}  </Typography>
                    </Grid>
                    <Grid container justifyContent={'space-between'} direction={"row"} alignItems={"center"} marginTop={1/2}>
                        <Typography component={'p'} variant="body2" color={'textSecondary'}> {t('swapMinReceive')}</Typography>
                        <Typography component={'p'}
                                    variant="body2" color={'textPrimary'}>
                            { minimumReceived !== EmptyValueTag  ? getValuePrecisionThousand(minimumReceived) : EmptyValueTag} </Typography>
                    </Grid>
                    <Grid container justifyContent={'space-between'} direction={"row"} alignItems={"center"} marginTop={1/2}>
                        <Typography component={'p'} variant="body2" color={'textSecondary'}> {t('swapFee')} </Typography>
                        <Typography component={'p'}
                                    variant="body2" color={'textPrimary'}>{fee}</Typography>
                    </Grid>
                </Grid>
            </Grid>
        </Box>
        <Box paddingTop={2} paddingX={2} >
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
