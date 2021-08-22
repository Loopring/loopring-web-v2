import {
    AmmData,
    AmmInData,
    EmptyValueTag,
    IBData,
    LinkedIcon,
    ReverseIcon,
    SlippageTolerance
} from '@loopring-web/common-resources';
import { WithTranslation } from 'react-i18next';
import { AmmDepositWrapProps } from './Interface';
import { Button, InputCoin, LinkActionStyle, PopoverPure } from '../../../basic-lib';
import React from 'react';
import { usePopupState } from 'material-ui-popup-state/hooks';
import { Grid, Typography } from '@material-ui/core';
import { IconButtonStyled } from '../Styled';
import { bindHover, bindPopover } from 'material-ui-popup-state/es';
import { SlippagePanel } from '../tool';
import { TradeBtnStatus } from '../../Interface';
import { SvgStyled } from './styled';
import { useSettings } from '../../../../stores';
import { Box } from '@material-ui/core/';


export const AmmDepositWrap = <T extends AmmData<C extends IBData<I> ? C : IBData<I>>,
    I,
    ACD extends AmmInData<I>,
    C = IBData<I>>({
                       t,
                       disabled,
                       isStob,
                       switchStobEvent,
                       ammDepositBtnStatus,
                       ammCalcData,
                       ammDepositBtnI18nKey,
                       onAmmAddClick,
                       tokenAProps,
                       tokenBProps,
                       onChangeEvent,
                       handleError,
                       ammData,
                       ...rest
                   }: AmmDepositWrapProps<T, I, ACD, C> & WithTranslation) => {
    const coinARef = React.useRef();
    const coinBRef = React.useRef();
    const {slippage} = useSettings();
    const slippageArray: Array<number | string> = SlippageTolerance.concat(`slippage:${slippage}`) as Array<number | string>;
    const [error, setError] = React.useState<{ error: boolean, message?: string | React.ElementType }>({
        error: false,
        message: ''
    });
    const [_isStoB, setIsStoB] = React.useState(typeof isStob !== 'undefined' ? isStob : true);

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
                return  _error

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
    const handleCountChange = React.useCallback((ibData: IBData<I>, _ref: any) => {
        const focus: 'coinA' | 'coinB' = _ref?.current === coinARef.current ? 'coinA' : 'coinB';
        if (ammData[ focus ].tradeValue !== ibData.tradeValue) {
            onChangeEvent({tradeData: {...ammData, [ focus ]: ibData}, type: focus});
        }
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
    }, [ammData, onChangeEvent]) ;
    const label = React.useMemo(()=>{
        if(error.error){
            if(typeof  error.message === 'string'){
                return  t(error.message)
            }else if(error.message !== undefined){
                return error.message;
            }else{
                return t('labelError')
            }

        }
        if (ammDepositBtnI18nKey) {
            const key = ammDepositBtnI18nKey.split(',');
            return t(key[ 0 ], key && key[ 1 ] ? {arg: key[ 1 ]} : undefined)
        } else {
            return t(`labelAddLiquidityBtn`)
        }
    },[error,ammDepositBtnI18nKey,t])

    return <Grid className={ammCalcData ? '' : 'loading'} paddingLeft={5 / 2} paddingRight={5 / 2} container
                 direction={"column"}
                 justifyContent={'space-between'} alignItems={"center"} flex={1} height={'100%'}>
        <Grid item marginTop={3} display={'flex'} alignSelf={"stretch"} justifyContent={''} alignItems={"stretch"}
              flexDirection={"column"}>
            <InputCoin<any, I, any> ref={coinARef} disabled={getDisabled()} {...{
                ...propsA,
                isHideError:true,
                order: 'right',
                inputData: ammData ? ammData.coinA : {} as any,
                coinMap: ammCalcData ? ammCalcData.coinInfoMap : {} as any
            }}/>
            <Box alignSelf={"center"} marginY={1}>
                <SvgStyled>
                    <LinkedIcon/>
                </SvgStyled>
            </Box>
            <InputCoin<any, I, any> ref={coinBRef} disabled={getDisabled()} {...{
                ...propsB,
                isHideError:true,
                order: 'right',
                inputData: ammData ? ammData.coinB : {} as any,
                coinMap: ammCalcData ? ammCalcData.coinInfoMap : {} as any
            }}/>
        </Grid>

        <Grid item>
            <Typography component={'p'} variant={'body1'} height={24} lineHeight={'24px'}>
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
                    </Grid>

                    <Grid container justifyContent={'space-between'} direction={"row"} alignItems={"center"}>
                        <Typography component={'p'} variant="body1"> {t('swapFee')} </Typography>
                        <Typography component={'p'}
                                    variant="body1">{t(ammCalcData ? ammCalcData.feeJoin : EmptyValueTag)}</Typography>
                    </Grid>
                </Grid>
                <Grid item>
                    <Button variant={'contained'} size={'large'} color={'primary'} onClick={() => {
                        onAmmAddClick(ammData)
                    }}
                            loading={!getDisabled() && ammDepositBtnStatus === TradeBtnStatus.LOADING ? 'true' : 'false'}
                            disabled={getDisabled() || ammDepositBtnStatus === TradeBtnStatus.DISABLED || ammDepositBtnStatus === TradeBtnStatus.LOADING || error.error}
                            fullWidth={true}>
                        {label}

                    </Button>
                </Grid>
            </Grid>
        </Grid>
    </Grid>
}