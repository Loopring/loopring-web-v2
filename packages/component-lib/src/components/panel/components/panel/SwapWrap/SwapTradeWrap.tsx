import { SwapTradeData, TradeBtnStatus } from '../../../Interface';
import {
    CoinInfo,
    CoinMap,
    DropDownIcon,
    EmptyValueTag,
    ExchangeIcon,
    IBData,
    ReverseIcon,
    SlippageTolerance,
    TradeCalcData
} from '@loopring-web/common-resources';
import { WithTranslation } from 'react-i18next';
import React from 'react';
import { Grid, Typography } from '@material-ui/core';
import { Button, InputButton, PopoverPure } from '../../../../basic-lib';
import { bindTrigger, usePopupState } from 'material-ui-popup-state/hooks';
import { bindPopover } from 'material-ui-popup-state/es';
import { IconButtonStyled, SlippagePanel } from '../../';
import { SwapTradeProps } from './Interface';
import { useSettings } from '../../../../../stores';


export const SwapTradeWrap = <T extends IBData<I>,
    I,
    TCD extends TradeCalcData<I>>({
                                      t,
                                      onChangeEvent,
                                      swapData, disabled,
                                      handleError, swapBtnStatus,
                                      onSwapClick, swapBtnI18nKey,
                                      tradeCalcData,
                                      tokenSellProps,
                                      tokenBuyProps,
                                      ...rest
                                  }: SwapTradeProps<T, I, TCD> & WithTranslation) => {
    const sellRef = React.useRef();
    const buyRef = React.useRef();
    const {slippage} = useSettings();
    const slippageArray: Array<number | string> = SlippageTolerance.concat(`slippage:${slippage}`) as Array<number | string>;
    const getDisabled = () => {
        if (disabled || tradeCalcData === undefined || tradeCalcData.sellCoinInfoMap === undefined) {
            return true
        } else {
            return false
        }
    };
    const tradeData = swapData.tradeData
    const handleOnClick = React.useCallback((_event: React.MouseEvent, ref: any) => {
        const focus: 'buy' | 'sell' = ref.current === buyRef.current ? 'buy' : 'sell';
        onChangeEvent(1, {tradeData: swapData.tradeData, type: focus, to: 'menu'});
    }, [swapData, onChangeEvent])
    const handleCountChange = React.useCallback((ibData: IBData<I>, _ref: any) => {
        const focus: 'buy' | 'sell' = _ref?.current === buyRef.current ? 'buy' : 'sell';
        if (swapData.tradeData[ focus ].tradeValue !== ibData.tradeValue) {
            onChangeEvent(0, {tradeData: {...swapData.tradeData, [ focus ]: ibData}, type: focus, to: 'button'});
        }
    }, [swapData, onChangeEvent]);
    const covertOnClick = React.useCallback(() => {
        onChangeEvent(0, {
            tradeData: {sell: swapData.tradeData.buy, buy: swapData.tradeData.sell} as SwapTradeData<T>,
            type: 'exchange',
            to: 'button'
        });
    }, [swapData, onChangeEvent]);
    const _onSlippageChange = React.useCallback((slippage: number | string, customSlippage: number | string | undefined) => {
        popupState.close();
        onChangeEvent(0, {
            ...swapData,
            tradeData: {
                ...swapData.tradeData,
                slippage: slippage,
                __cache__: {
                    ...swapData.tradeData.__cache__,
                    customSlippage: customSlippage
                }
            }
        });
    }, [swapData, onChangeEvent])
    if (typeof handleError !== 'function') {
        handleError = ({belong, balance, tradeValue}: any) => {
            if (balance < tradeValue || (tradeValue && !balance)) {
                return {error: true, message: t('tokenNotEnough', {belong: belong})}
            }
            return {error: false, message: ''}
        }
    }
    const propsSell = {
        label: t('tokenEnterPaymentToken'),
        subLabel: t('tokenMax'),
        emptyText: t('tokenSelectToken'),
        placeholderText: '0.00',
        maxAllow: true,
        ...tokenSellProps,
        handleError,
        handleCountChange,
        handleOnClick,
        ...rest
    }
    const propsBuy = {
        label: t('tokenEnterReceiveToken'),
        subLabel: t('tokenHave'),
        emptyText: t('tokenSelectToken'),
        placeholderText: '0.00',
        maxAllow: false,
        ...tokenBuyProps,
        // handleError,
        handleCountChange,
        handleOnClick,
        ...rest
    }
    const popupState = usePopupState({
        variant: 'popover',
        popupId: 'slippagePop',
    })


    return <Grid className={tradeCalcData ? '' : 'loading'} paddingLeft={5 / 2} paddingRight={5 / 2} container
                 direction={"column"}
                 justifyContent={'space-between'} alignItems={"center"} flex={1} height={'100%'}>
        <Grid item>
            <Grid container direction={"column"} spacing={1} alignItems={"center"} alignContent={"center"}>
                <Grid item>
                    <InputButton<any, I, CoinInfo<I>> ref={sellRef} disabled={getDisabled()}  {...{
                        ...propsSell,
                        inputData: tradeData ? tradeData.sell : {} as any,
                        coinMap: tradeCalcData && tradeCalcData.sellCoinInfoMap ? tradeCalcData.sellCoinInfoMap : {} as CoinMap<I, CoinInfo<I>>
                    }} />
                </Grid>
                <Grid item>
                    <IconButtonStyled size={'medium'} onClick={covertOnClick} color="inherit"
                                      aria-label={t('tokenExchange')}>
                        <ExchangeIcon/>
                    </IconButtonStyled>
                </Grid>
                <Grid item>
                    <InputButton<any, I, CoinInfo<I>> ref={buyRef} disabled={getDisabled()} {...{
                        ...propsBuy,
                        // maxAllow:false,
                        inputData: tradeData ? tradeData.buy : {} as any,
                        coinMap: tradeCalcData && tradeCalcData.buyCoinInfoMap ? tradeCalcData.buyCoinInfoMap : {} as CoinMap<I, CoinInfo<I>>
                    }} />
                </Grid>
            </Grid>
        </Grid>
        <Grid item>
            <Typography component={'p'} variant="body1" height={24} lineHeight={'24px'}>
                {tradeData.buy.belong && tradeData.sell && tradeCalcData ? <>
                    {`1${tradeData.sell?.belong} = ${tradeCalcData.StoB ? tradeCalcData.StoB : EmptyValueTag} ${tradeData.buy?.belong}`}
                    <IconButtonStyled size={'small'} aria-label={t('tokenExchange')} onClick={covertOnClick}
                        // style={{transform: 'rotate(90deg)'}}
                    ><ReverseIcon/></IconButtonStyled>
                </> : EmptyValueTag}
            </Typography>
        </Grid>
        <Grid item alignSelf={"stretch"}>
            <Grid container direction={"column"} spacing={1} alignItems={"stretch"}>
                <Grid item paddingBottom={3} sx={{color: 'text.secondary'}}>
                    <Grid container justifyContent={'space-between'} direction={"row"} alignItems={"center"}
                          height={24}>
                        <Typography component={'p'} variant="body1">{t('swapTolerance')}</Typography>
                        <Typography component={'p'} variant="body1">
                            {tradeCalcData ? <>
                                <span>
                                    <IconButtonStyled
                                        {...bindTrigger(popupState)}
                                        size={'small'}
                                        sx={{fontSize: '1.4rem', height: '24px', minWidth: '24px', width: '24px'}}
                                        className={'clock-loading'}
                                        color="inherit"
                                        aria-label="3' price update">
                                        <DropDownIcon/>
                                    </IconButtonStyled>
                                    <PopoverPure
                                        className={'arrow-right'}
                                        {...bindPopover(popupState)}
                                        {...{
                                            anchorOrigin: {vertical: 'bottom', horizontal: 'right'},
                                            transformOrigin: {vertical: 'top', horizontal: 'right'}
                                        }}
                                    >
                                        <SlippagePanel {...{
                                            ...rest, t,
                                            handleChange: _onSlippageChange,
                                            slippageList: slippageArray,
                                            slippage: tradeData.slippage ? tradeData.slippage : tradeCalcData.slippage ? tradeCalcData.slippage : 0.5
                                        }} />
                                    </PopoverPure>
                                </span>
                                <Typography
                                    component={'span'}>{tradeData.slippage ? tradeData.slippage : tradeCalcData.slippage ? tradeCalcData.slippage : 0.5}%</Typography></> : EmptyValueTag
                            }
                        </Typography>
                    </Grid>
                    <Grid container justifyContent={'space-between'} direction={"row"} alignItems={"center"}>
                        <Typography component={'p'} variant="body1"> {t('swapPriceImpact')}</Typography>
                        <Typography component={'p'}
                                    variant="body1"> {t(tradeCalcData ? tradeCalcData.priceImpact : EmptyValueTag)} </Typography>
                    </Grid>
                    <Grid container justifyContent={'space-between'} direction={"row"} alignItems={"center"}>
                        <Typography component={'p'} variant="body1"> {t('swapMinReceive')}</Typography>
                        <Typography component={'p'}
                                    variant="body1">{t(tradeCalcData ? tradeCalcData.minimumReceived : EmptyValueTag)} </Typography>
                    </Grid>
                    <Grid container justifyContent={'space-between'} direction={"row"} alignItems={"center"}>
                        <Typography component={'p'} variant="body1"> {t('swapFee')} </Typography>
                        <Typography component={'p'}
                                    variant="body1">{t(tradeCalcData ? tradeCalcData.fee : EmptyValueTag)}</Typography>
                    </Grid>
                </Grid>
                <Grid item>
                    <Button variant={'contained'} size={'large'} color={'primary'} onClick={() => {
                        onSwapClick(swapData.tradeData)
                    }}
                            loading={!getDisabled() && swapBtnStatus === TradeBtnStatus.LOADING ? 'true' : 'false'}
                            disabled={getDisabled() || swapBtnStatus === TradeBtnStatus.DISABLED || swapBtnStatus === TradeBtnStatus.LOADING ? true : false}
                            fullWidth={true}>{t(swapBtnI18nKey ? swapBtnI18nKey : `swapBtn`)}
                    </Button>
                </Grid>
            </Grid>
        </Grid>

    </Grid>
}

