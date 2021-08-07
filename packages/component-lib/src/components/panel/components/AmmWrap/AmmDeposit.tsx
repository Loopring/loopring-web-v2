import {
    AmmData,
    AmmInData,
    DropDownIcon,
    EmptyValueTag,
    IBData,
    LinkedIcon,
    ReverseIcon,
    SlippageTolerance
} from '@loopring-web/common-resources';
import { WithTranslation } from 'react-i18next';
import { AmmDepositWrapProps } from './Interface';
import { Button, InputCoin, PopoverPure } from '../../../basic-lib';
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

    const [_isStoB, setIsStoB] = React.useState(typeof isStob !== 'undefined'? isStob : true);

    const _onSwitchStob = React.useCallback((_event: any)=>{
        console.log('...', _event)
        setIsStoB(!_isStoB)
        if(typeof switchStobEvent === 'function') {
            switchStobEvent(!_isStoB) 
        }
    },[switchStobEvent, _isStoB])

    const getDisabled = () => {
        if (disabled || ammCalcData === undefined || ammCalcData.coinInfoMap === undefined) {
            return true
        } else {
            return false
        }
    };
    if (typeof handleError !== 'function') {
        handleError = ({belong, balance, tradeValue}: any) => {
            if (balance < tradeValue || (tradeValue && !balance)) {
                return {error: true, message: t('tokenNotEnough', {belong: belong})}
            }
            return {error: false, message: ''}
        }
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
                ...ammData, slippage: slippage,
                __cache__: {
                    ...ammData.__cache__,
                    customSlippage: customSlippage
                }
            }, type: 'coinA'
        });
    }, [ammData, onChangeEvent])


    return <Grid className={ammCalcData ? '' : 'loading'} paddingLeft={5 / 2} paddingRight={5 / 2} container
                 direction={"column"}
                 justifyContent={'space-between'} alignItems={"center"} flex={1} height={'100%'}>
        <Grid item marginTop={2} display={'flex'} alignSelf={"stretch"} justifyContent={''} alignItems={"stretch"}  flexDirection={"column"}  >
            <InputCoin<any, I, any> ref={coinARef} disabled={getDisabled()} {...{
                ...propsA,
                order: 'right',
                inputData: ammData ? ammData.coinA : {} as any,
                coinMap: ammCalcData ? ammCalcData.coinInfoMap : {} as any
            }}/>
            <Box alignSelf={"center"}>
                <SvgStyled >
                    <LinkedIcon/>
                </SvgStyled>
            </Box>
            <InputCoin<any, I, any> ref={coinBRef} disabled={getDisabled()} {...{
                ...propsB,
                order: 'right',
                inputData: ammData ? ammData.coinB : {} as any,
                coinMap: ammCalcData ? ammCalcData.coinInfoMap : {} as any
            }}/>
        </Grid>

        <Grid item>
            <Typography component={'p'} variant="body1" height={20}>
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
                                <span>
                                    <IconButtonStyled
                                        {...bindHover(popupState)}
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
                                            slippage: ammData.slippage ? ammData.slippage : ammCalcData.slippage ? ammCalcData.slippage : 0.5
                                        }} />
                                    </PopoverPure>
                                </span>

                                <Typography
                                    component={'span'}>{ammData.slippage ? ammData.slippage : ammCalcData.slippage ? ammCalcData.slippage : 0.5}%</Typography></> : EmptyValueTag
                            }
                        </Typography>
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
                            disabled={getDisabled() || ammDepositBtnStatus === TradeBtnStatus.DISABLED || ammDepositBtnStatus === TradeBtnStatus.LOADING ? true : false}
                            fullWidth={true}>
                        {ammDepositBtnI18nKey ? t(ammDepositBtnI18nKey) : t(`labelAddLiquidityBtn`)}

                    </Button>
                </Grid>
            </Grid>
        </Grid>
    </Grid>
}