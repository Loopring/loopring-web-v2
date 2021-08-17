import {
    AmmData,
    AmmInData,
    CoinInfo,
    EmptyValueTag,
    IBData,
    LinkedIcon,
    ReverseIcon,
    SlippageTolerance
} from '@loopring-web/common-resources';
import { AmmWithdrawWrapProps } from './Interface';
import { WithTranslation } from 'react-i18next';
import React from 'react';
import { usePopupState } from 'material-ui-popup-state/hooks';
import { Grid, Link, Typography } from '@material-ui/core';
import { BtnPercentage, Button, IconButtonStyled, InputCoin, PopoverPure, TradeBtnStatus } from '../../../index';
import { bindHover, bindPopover } from 'material-ui-popup-state/es';
import { SlippagePanel } from '../tool';
import { useSettings } from '../../../../stores';
import { Box } from '@material-ui/core/';
import { SvgStyled } from './styled';

export const AmmWithdrawWrap = <T extends AmmData<C extends IBData<I> ? C : IBData<I>>,
    I,
    ACD extends AmmInData<I>,
    C = IBData<I>>({
                       t,
                       disabled,
                       isStob,
                       switchStobEvent,
                       ammWithdrawBtnStatus,
                       ammCalcData,
                       onAmmRemoveClick,
                       tokenAProps,
                       tokenBProps,
                       anchors,
                       ammWithdrawBtnI18nKey,
                       onChangeEvent,
                       handleError,
                       ammData,
                       selectedPercentage = -1,
                       ...rest
                   }: AmmWithdrawWrapProps<T, I, ACD, C> & WithTranslation) => {
    const coinARef = React.useRef();
    const coinBRef = React.useRef();
    const {slippage} = useSettings();
    const slippageArray: Array<number | string> = SlippageTolerance.concat(`slippage:${slippage}`) as Array<number | string>;
    const [_selectedPercentage, setSelectedPercentage] = React.useState(selectedPercentage);

    const [_isStoB, setIsStoB] = React.useState(typeof isStob !== 'undefined' ? isStob : true);
    const [error, setError] = React.useState<{ error: boolean, message?: string | React.ElementType }>({
        error: false,
        message: ''
    });
    const _onSwitchStob = React.useCallback((_event: any) => {
        setIsStoB(!_isStoB)
        if (typeof switchStobEvent === 'function') {
            switchStobEvent(!_isStoB)
        }
    }, [switchStobEvent, _isStoB])

    const getDisabled = () => {
        return disabled || ammCalcData === undefined || ammCalcData.coinInfoMap === undefined;
    };
    if (typeof handleError !== 'function') {
        handleError = ({belong, balance, tradeValue}: any) => {
            if (balance < tradeValue || (tradeValue && !balance)) {
                const _error = {error: true, message: t('tokenNotEnough', {belong: belong})}
                setError(_error);
                return _error

            }
            setError({error: false, message: ''});
            return {error: false, message: ''}
        }
        // handleError = ({belong, balance, tradeValue}: any) => {
        //     if (balance < tradeValue || (tradeValue && !balance)) {
        //         return {error: true, message: t('tokenNotEnough', {belong: belong})}
        //     }
        //     return {error: false, message: ''}
        // }
    }
    const handleCountChange = React.useCallback((ibData: IBData<I>, _ref: any, flag = -1) => {
        if (flag !== _selectedPercentage) {
            setSelectedPercentage(flag)
        }
        if (_ref) {
            let focus = _ref?.current === coinARef.current ? 'coinA' : 'coinB';
            if (ammData[ focus ].tradeValue !== ibData.tradeValue) {
                onChangeEvent({tradeData: {...ammData, [ focus ]: ibData}, type: focus as any});
            }
        } else {
            onChangeEvent({tradeData: {...ammData, [ 'coinA' ]: ibData}, type: 'percentage'});
        }
    }, [ammData, onChangeEvent]);
    const onPercentage = (value: any) => {
        ammData[ 'coinA' ].tradeValue = ammData[ 'coinA' ].balance * value / 100;
        handleCountChange(ammData[ 'coinA' ], null, value)
    }
    const _onSlippageChange = React.useCallback((slippage: number | string, customSlippage: number | string | undefined) => {
        popupState.close();
        onChangeEvent({
            tradeData: {
                ...ammData,
                slippage: slippage,
                __cache__: {
                    ...ammData.__cache__,
                    customSlippage: customSlippage
                }
            }, type: 'coinA'
        });
    }, [ammData, onChangeEvent]);
    const propsA: any = {
        label: t('labelTokenAmount'),
        subLabel: t('labelAvailable'),
        placeholderText: '0.00',
        maxAllow: true,
        ...tokenAProps,
        handleError,
        handleCountChange,
        ...rest
    }
    const propsB: any = {
        label: t('labelTokenAmount'),
        subLabel: t('labelAvailable'),
        placeholderText: '0.00',
        maxAllow: true,
        ...tokenBProps,
        handleError,
        handleCountChange,
        ...rest
    }
    const popupState = usePopupState({
        variant: 'popover',
        popupId: 'slippagePop',
    })

    const label = React.useMemo(() => {
        if (error.error) {
            if (typeof error.message === 'string') {
                return t(error.message)
            } else if (error.message !== undefined) {
                return error.message;
            } else {
                return t('labelError')
            }

        }
        if (ammWithdrawBtnI18nKey) {
            const key = ammWithdrawBtnI18nKey.split(',');
            return t(key[ 0 ], key && key[ 1 ] ? {arg: key[ 1 ]} : undefined)
        } else {
            return t(`labelRemoveLiquidityBtn`)
        }
        // return  t(ammWithdrawBtnI18nKey ? t(ammWithdrawBtnI18nKey) : t(`labelRemoveLiquidityBtn`))
    }, [error, ammWithdrawBtnI18nKey, t])

    return <Grid className={ammCalcData ? '' : 'loading'} paddingLeft={5 / 2} paddingRight={5 / 2} container
                 direction={"column"}
                 justifyContent={'space-between'} alignItems={"center"} flex={1} height={'100%'}>
        <Grid item marginTop={3} display={'flex'} alignSelf={"stretch"} justifyContent={''} alignItems={"stretch"}
              flexDirection={"column"}>
            <InputCoin<IBData<I>, I, CoinInfo<I>> ref={coinARef} disabled={getDisabled()} {...{
                ...propsA,
                isHideError: true,
                order: 'right',
                inputData: ammData ? ammData.coinA : {} as any,
                coinMap: ammCalcData ? ammCalcData.coinInfoMap : {} as any
            }}/>
            <Box alignSelf={"center"} marginY={1}>
                <SvgStyled>
                    <LinkedIcon/>
                </SvgStyled>
            </Box>
            <InputCoin<IBData<I>, I, CoinInfo<I>> ref={coinBRef} disabled={getDisabled()} {...{
                ...propsB,
                isHideError: true,
                order: 'right',
                inputData: ammData ? ammData.coinB : {} as any,
                coinMap: ammCalcData ? ammCalcData.coinInfoMap : {} as any
            }}/>
            <Grid item alignSelf={'stretch'} marginTop={2}>
                <BtnPercentage selected={_selectedPercentage} anchors={anchors}
                               handleChanged={onPercentage}/>
            </Grid>
        </Grid>

        <Grid item>
            <Typography component={'p'} variant="body1" height={24} lineHeight={'24px'}>
                {ammData.coinA?.belong && ammData.coinB?.belong && ammCalcData ? <>
                    {_isStoB ? `1${ammData.coinA?.belong} \u2248 ${ammCalcData.AtoB ? ammCalcData.AtoB : EmptyValueTag} ${ammData.coinB?.belong}`
                        : `1${ammData.coinB?.belong} \u2248 ${ammCalcData.AtoB ? (1 / ammCalcData.AtoB) : EmptyValueTag} ${ammData.coinA?.belong}`}
                    <IconButtonStyled size={'small'} aria-label={t('tokenExchange')} onClick={_onSwitchStob}
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
                            {ammCalcData ? <>
                                <Typography {...bindHover(popupState)}
                                            component={'span'}>
                                    <Link>
                                        {ammData.slippage ? ammData.slippage : ammCalcData.slippage ? ammCalcData.slippage : 0.5}%
                                    </Link>
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
                                            slippage: ammData.slippage ? ammData.slippage : ammCalcData.slippage ? ammCalcData.slippage : 0.5
                                        }} />
                                    </PopoverPure>
                                </Typography>
                            </> : EmptyValueTag

                            }
                        </Typography>

                    </Grid>

                    <Grid container justifyContent={'space-between'} direction={"row"} alignItems={"center"}>
                        <Typography component={'p'} variant="body1"> {t('swapFee')} </Typography>
                        <Typography component={'p'}
                                    variant="body1">{t(ammCalcData ? ammCalcData.feeExit : EmptyValueTag)}</Typography>
                    </Grid>
                </Grid>
                <Grid item>
                    <Button variant={'contained'} size={'large'} color={'primary'} onClick={() => {
                        onAmmRemoveClick(ammData)
                    }}
                            loading={!getDisabled() && ammWithdrawBtnStatus === TradeBtnStatus.LOADING ? 'true' : 'false'}
                            disabled={getDisabled() || ammWithdrawBtnStatus === TradeBtnStatus.DISABLED || ammWithdrawBtnStatus === TradeBtnStatus.LOADING || error.error}
                            fullWidth={true}>
                        {label}
                    </Button>
                </Grid>
            </Grid>
        </Grid>
    </Grid>;

}

