import {
    AmmData,
    AmmInData, AmmWithdrawData,
    CoinInfo,
    EmptyValueTag,
    IBData,
    // LinkedIcon,
    ReverseIcon,
    SlippageTolerance
} from '@loopring-web/common-resources';
import { AmmWithdrawWrapProps } from './Interface';
import { WithTranslation } from 'react-i18next';
import React from 'react';
import { usePopupState } from 'material-ui-popup-state/hooks';
import { Grid, Typography } from '@material-ui/core';
import {
    BtnPercentage,
    Button,
    IconButtonStyled,
    InputCoin,
    LinkActionStyle,
    PopoverPure,
    TradeBtnStatus
} from '../../../index';
import { bindHover, bindPopover } from 'material-ui-popup-state/es';
import { SlippagePanel } from '../tool';
import { useSettings } from '../../../../stores';
import { Box, Link } from '@material-ui/core/';
import { SvgStyled } from './styled';

export const AmmWithdrawWrap = <T extends AmmWithdrawData<C extends IBData<I> ? C : IBData<I>>,
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
    // const coinARef = React.useRef();
    const coinLPRef = React.useRef();
    // const coinBRef = React.useRef();
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
        // if (flag !== _selectedPercentage) {
        //     setSelectedPercentage(flag)
        // }
        // if (_ref) {
        //     let focus = _ref?.current === coinARef.current ? 'coinA' : 'coinB';
        //     if (ammData[ focus ].tradeValue !== ibData.tradeValue) {
        //         onChangeEvent({tradeData: {...ammData, [ focus ]: ibData}, type: focus as any});
        //     }
        // } else {
        //     onChangeEvent({tradeData: {...ammData, [ 'coinA' ]: ibData}, type: 'percentage'});
        // }
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
            }, type: 'lp'
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
    // const propsB: any = {
    //     label: t('labelTokenAmount'),
    //     subLabel: t('labelAvailable'),
    //     placeholderText: '0.00',
    //     maxAllow: true,
    //     ...tokenBProps,
    //     handleError,
    //     handleCountChange,
    //     ...rest
    // }
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
    const [isPercentage,setIsPercentage] = React.useState(true);

    return <Grid className={ammCalcData ? '' : 'loading'} paddingLeft={5 / 2} paddingRight={5 / 2} container
                 direction={"column"}
                 justifyContent={'space-between'} alignItems={"center"} flex={1} height={'100%'}>
        <Grid item marginTop={3} display={'flex'} alignSelf={"stretch"} justifyContent={''} alignItems={"stretch"}
              flexDirection={"column"}>
            <Typography alignSelf={'flex-end'}>
                <Link onClick={()=>setIsPercentage(!isPercentage)}>{t('labelPercentage')}</Link>
            </Typography>
            <Typography alignSelf={'center'} variant={'h2'} >
                {_selectedPercentage}%
            </Typography>
            <Typography alignSelf={'center'} variant={'body2'} >
                {ammData}
            </Typography>
            <Grid item alignSelf={'stretch'} marginTop={2} hidden={isPercentage}>
                <BtnPercentage selected={_selectedPercentage} anchors={[{
                    value: 0, label: '0'
                }, {
                    value: 25, label: ''
                }, {
                    value: 50, label: ''
                }, {
                    value: 75, label: ''
                }, {
                    value: 100, label: t('labelAvaiable:') + '100%'
                }]} handleChanged={onPercentage}/>
            </Grid>
            <Grid item alignSelf={'stretch'} marginTop={2} hidden={false}>
            <InputCoin<IBData<I>, I, CoinInfo<I>> ref={coinLPRef} disabled={getDisabled()} {...{
                ...propsA,
                isHideError: true,
                order: 'right',
                inputData: ammData ? ammData.coinA : {} as any,
                coinMap: ammCalcData ? ammCalcData.coinInfoMap : {} as any
            }}/>
            </Grid>
            {/*<Box alignSelf={"center"} marginY={1}>*/}
            {/*    <SvgStyled>*/}
            {/*        <LinkedIcon/>*/}
            {/*    </SvgStyled>*/}
            {/*</Box>*/}
            {/*<InputCoin<IBData<I>, I, CoinInfo<I>> ref={coinBRef} disabled={getDisabled()} {...{*/}
            {/*    ...propsB,*/}
            {/*    isHideError: true,*/}
            {/*    order: 'right',*/}
            {/*    inputData: ammData ? ammData.coinB : {} as any,*/}
            {/*    coinMap: ammCalcData ? ammCalcData.coinInfoMap : {} as any*/}
            {/*}}/>*/}
            <Box alignSelf={"center"} marginY={1}>
                <SvgStyled>
                    <ReverseIcon/>
                </SvgStyled>
            </Box>
            <Box borderRadius={1/2} style={{background:'var(--color-pop-bg)'}}>
                <Typography variant={'body1'} color={'textSecondary'} >{lp}</Typography>
            </Box>
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
                                            component={'span'} variant="body1">
                                    <LinkActionStyle>
                                        {ammData.slippage ? ammData.slippage : ammCalcData.slippage ? ammCalcData.slippage : 0.5}%
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
                                    variant="body1">{t(ammCalcData ? ammCalcData.fee : EmptyValueTag)}</Typography>
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

