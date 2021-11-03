import { CoinInfo, CoinMap, getFormattedHash, IBData, NFTWholeINFO } from '@loopring-web/common-resources';
import { WithTranslation } from 'react-i18next';
import React from 'react';
import {  BasicANFTTradeProps } from './Interface';
import { InputCoin, InputSize, } from '../../basic-lib';
import { Box, Link, Typography } from '@mui/material';


export const BasicANFTTrade = <T extends IBData<I> & Partial<NFTWholeINFO>,
    I>({
           t, tradeData, onChangeEvent, disabled,
           handleError, inputNFTRef,
           inputNFTProps,
            inputNFTDefaultProps,
           ...rest
       }: BasicANFTTradeProps<T, I> & WithTranslation) => {
    const getDisabled = () => {
        if (disabled || tradeData === undefined ) {
            return true
        } else {
            return false
        }
    };
    // myLog(tradeData)
    const handleCountChange: any = React.useCallback((_tradeData: T, _name:string, _ref: any) => {
        //const focus: 'buy' | 'sell' = _ref?.current === buyRef.current ? 'buy' : 'sell';
        if (tradeData.tradeValue !== _tradeData.tradeValue) {
            onChangeEvent(0, {tradeData: {...tradeData, ..._tradeData}, to: 'button'});
        }

        // onCoinValueChange(ibData);
    }, [onChangeEvent, tradeData]);

    if (typeof handleError !== 'function') {
        handleError = ({belong, balance, tradeValue}: T) => {
            if (typeof tradeValue !== 'undefined' && balance < tradeValue || (tradeValue && !balance)) {
                return {error: true, message: t('tokenNotEnough', {belong: belong})}
            }
            return {error: false, message: ''}
        }
    }

    const inputCoinProps = {

        // label: t('labelTokenAmount'),
        subLabel: t('labelAvailable'),
        placeholderText: '0',
        decimalsLimit : 0,
        allowDecimals: false,
        // size = InputSize.middle,
        isHideError : true,
        isShowCoinInfo : false,
        isShowCoinIcon : false,
        order: 'right',
        noBalance:'0',
        // coinLabelStyle ,
        coinPrecision : 0,
        maxAllow: true,
        handleError,
        handleCountChange,
        ...inputNFTDefaultProps,
        ...inputNFTProps,
        ...rest
    }


    // @ts-ignore
    return <InputCoin<T,I,CoinInfo<I>> ref={inputNFTRef} disabled={getDisabled()}  {...{
        ...inputCoinProps,
        inputData: tradeData ? tradeData : {} as T,
        coinMap:  {} as CoinMap<I, CoinInfo<I>>
    }} />

}


export const NFTInput = React.memo(<T extends IBData<I> & Partial<NFTWholeINFO>,
    I>({isThumb,tradeData,t,onCopy,inputNFTDefaultProps,inputNFTRef,type,disabled,...rest}: BasicANFTTradeProps<T, I>
    & WithTranslation
    & { onCopy:(content:string)=>Promise<void>,
    type?:'TOKEN'|'NFT' }
)=> {
    return <>
        {isThumb? <Box display={'inline-flex'}
                       alignItems={'center'}
                       justifyContent={'space-between'} height={80} width={'100%'}>
            <Box display={'flex'} flexDirection={'column'}>
                <Typography variant={'body1'}
                            color={'var(--color-text-secondary)'} className={'main-label'} paddingBottom={1 / 2}>
                    {t('labelNFTName')} {tradeData.name}</Typography>
                <Box display={'flex'} marginTop={1 / 2} flexDirection={'row'} alignItems={'center'}>
                    {/*<img alt={'NFT'} width={'100%'} height={'100%'} src={popItem.image}/>*/}

                    <Box height={48} minWidth={48}
                         borderRadius={1 / 2}
                         style={{background: "var(--field-opacity)"}} display={'flex-inline'}
                         alignItems={'center'}
                         justifyContent={'center'}>
                        <img alt={'NFT'} width={'100%'} height={'100%'} src={tradeData?.image}/>
                    </Box>
                    <Box marginLeft={1}>
                        <Link variant={'h5'}
                              onClick={() => window.open(`${tradeData.etherscanBaseUrl}tx/${tradeData.tokenAddress}`)}>
                            {getFormattedHash(tradeData.tokenAddress)}
                        </Link>
                        <Typography variant={'body1'} onClick={() => onCopy(tradeData.nftId as string)}>
                            <Typography component={'span'} color={'text.secondary'}>ID: </Typography>
                            <Typography component={'span'} color={'text.secondary'} title={tradeData.nftId}>
                                {tradeData.nftId && parseInt(tradeData.nftId).toString().length > 16 ? getFormattedHash(parseInt(tradeData.nftId).toString())
                                    : parseInt(tradeData?.nftId ?? '').toString()} </Typography>
                        </Typography> {/*<Typography variant={'h5'} color={'text.secondary'} >*/}
                        {/*    {( tradeData?.name && tradeData.name.length > 8)?getFormattedHash(tradeData.name):tradeData.name}*/}
                        {/*</Typography>*/}


                    </Box>
                </Box>
            </Box>
            <Box maxWidth={120} marginLeft={1}>
                <BasicANFTTrade {...{
                    ...rest,

                    type,
                    t,
                    disabled,
                    walletMap: {},
                    tradeData,
                    // coinMap,
                    inputNFTDefaultProps: {label: ''},
                    // inputButtonDefaultProps,
                    inputNFTRef,
                }}  />
            </Box>
        </Box> :<BasicANFTTrade {...{
            ...rest,
            type,
            t,
            disabled,
            walletMap: {},
            tradeData,
            inputNFTDefaultProps: {
                size:InputSize.small,

                label: '' + tradeData?.name},
            // inputButtonDefaultProps,
            inputNFTRef,
        }}  /> }
    </>
})  as <T extends IBData<I> & Partial<NFTWholeINFO>,
    I>(props: BasicANFTTradeProps<T, I>
    & WithTranslation
    & { onCopy:(content:string)=>Promise<void>,
    type?:'TOKEN'|'NFT' }) => JSX.Element



