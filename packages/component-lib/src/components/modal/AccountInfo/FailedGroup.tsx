import { Trans, WithTranslation } from 'react-i18next';
import { Link, Typography } from '@material-ui/core';
import { CoinInfo, LinkIcon } from '@loopring-web/common-resources';
import React from 'react';
import { FailedBasic } from '../FailedBasic';


export const FailedDeposit = ({
                                  onRetry,
                                  label = "depositTitle",
                                  etherscanLink,
                                  t,
                                  ...rest
                              }: { label?: string, onRetry: (event: any) => void, etherscanLink: string } & WithTranslation) => {
    const describe = React.useMemo(() => {
        return <>
            <Typography variant={'h6'} color={'textSecondary'} marginTop={1}>{t('labelFailedDeposit')}</Typography>
            <Link target='_blank' href={etherscanLink} display={'inline-block'} marginTop={1 / 2}>
                <Typography variant={'body2'}> <LinkIcon fontSize={'small'}
                                                         style={{verticalAlign: 'middle'}}/> {'Etherscan'} </Typography>
            </Link>
        </>
    }, [])
    return <FailedBasic label={label} onRetry={onRetry} describe={describe} {...{...rest, t}}/>

}
export const FailedTokenAccess = ({
                                      onRetry,
                                      t,
                                      label = "depositTitle",
                                      coinInfo,
                                      ...rest
                                  }: { coinInfo?: CoinInfo<any> | undefined, label?: string, onRetry: (event: any) => void, } & WithTranslation) => {
    const describe = React.useMemo(() => {
        return <Typography variant={'h6'} color={'textSecondary'} marginTop={1}>
            {t('labelFailedTokenAccess', {symbol: coinInfo?.simpleName})}
        </Typography>
    }, [])
    return <FailedBasic label={label} onRetry={onRetry} describe={describe} {...{...rest, t}}/>
}

export const FailedUnlock = ({onRetry, t,...rest}: { onRetry: (event: any) => void } & WithTranslation) => {
    const describe = React.useMemo(() => {
        return   <>
            <Typography variant={'h6'} color={'textSecondary'} marginTop={1}>{t('labelFailedUnLocK')}</Typography>
            <Typography component={'p'} marginTop={2}>
                <Trans i18nKey={'labelRejectOrError'}>
                    Rejected, Please<Link onClick={onRetry}>retry</Link>
                </Trans>
            </Typography>
        </>
    }, [])
    return <FailedBasic label={'labelUnLockLayer2'} onRetry={onRetry} describe={describe} {...{...rest, t}}/>

}