import {  Typography } from '@material-ui/core';
import {  WithTranslation } from 'react-i18next';
import React from 'react';
import { CoinInfo, LinkIcon } from '@loopring-web/common-resources';
import { ProcessBasic } from '../ProcessBasic';
import { Link } from '@material-ui/core/';

export const ActiveAccountProcess = ({t, ...rest}: WithTranslation & { providerName: string }) => {
    const describe = React.useMemo(() => {
        return <>
            <Typography variant={'body1'}>
                {t('labelProcessing')}
            </Typography>
        </>
    }, [])
    return <ProcessBasic label={'labelActiveAccount'} describe={ describe} {...{...rest, t}}/>
}

export const DepositApproveProcess = ({
                                          t,
                                          label = "depositTitle",
                                          // providerName,
                                          etherscanLink,
                                          ...rest
                                      }: WithTranslation & { label?: string, providerName: string, etherscanLink: string }) => {
    const describe = React.useMemo(() => {
        return <>
            <Typography variant={'body1'}>
                {label}
            </Typography>
            <Link target='_blank' href={etherscanLink} display={'inline-block'} marginTop={1 / 2}>
                <Typography variant={'body2'}> <LinkIcon fontSize={'small'}
                                                         style={{verticalAlign: 'middle'}}/> {'Etherscan'} </Typography>
            </Link></>

    }, [])
    return <ProcessBasic label={label} describe={describe}  {...{...rest, t}}/>

}

export const TokenAccessProcess = ({
                                       t,
                                       label = "depositTitle",
                                       // providerName,
                                       coinInfo,
                                       ...rest
                                   }: WithTranslation & { coinInfo?: CoinInfo<any>, label?: string, providerName: string }) => {
    const describe = React.useMemo(() => {
        return <>
            <Typography variant={'body1'}>
                {t('labelTokenAccess', {symbol: coinInfo?.simpleName})}
            </Typography>

        </>
    }, [])
    return <ProcessBasic label={label} describe={describe} {...{...rest, t}}/>

}

export const ProcessUnlock = ({t, ...rest}: WithTranslation & { providerName: string }) => {
    const describe = React.useMemo(() => {
        return <>
            <Typography variant={'body1'}>
                {t('labelProcessing')}
            </Typography>
        </>

    }, [])
    return <ProcessBasic label={'labelUnLockLayer2'} describe={describe} {...{...rest, t}}/>
}


