import { Box, Typography } from '@material-ui/core';
import { Trans, WithTranslation } from 'react-i18next';
import {
    ConnectProviders,
    LoadingIcon,
    DoneIcon, FailedIcon, RefuseIcon, SubmitIcon, LinkIcon,
} from '@loopring-web/common-resources';
import React from 'react';

import { Button } from '../../basic-lib';
import { Link } from '@material-ui/core/';

export enum IconType {
    LoadingIcon,
    DoneIcon,
    FailedIcon,
    RefuseIcon,
    SubmitIcon,
}

export interface PanelProps {
    title?: string,
    iconType?: IconType,
    value?: number,
    symbol?: string,
    describe1?: any,
    describe2?: string,
    txCheck?: {
        route: string,
        callback: (e?: any) => void,
    },
    btnInfo?: {
        btnTxt: any,
        callback: (e?: any) => void,
    }
    providerName?: 'MetaMask' | 'WalletConnect' | 'unknown'
    link?: {
        name: string,
        url: string,
    }
}

export const BasicPanel = ({
    t,
    title,
    iconType,
    describe1,
    describe2,
    txCheck,
    btnInfo,
    providerName,
    link,
}: PanelProps & WithTranslation) => {

    const iconDiv = React.useMemo(() => {
        switch (iconType) {
            case IconType.LoadingIcon:
                return <LoadingIcon color={'primary'} style={{ width: 72, height: 72 }} />
            case IconType.FailedIcon:
                return <FailedIcon style={{ color: 'var(--color-error)', width: 72, height: 72 }} />
            case IconType.SubmitIcon:
                return <SubmitIcon color={'primary'} style={{ width: 72, height: 72 }} />
            case IconType.RefuseIcon:
                return <RefuseIcon style={{ color: 'var(--color-warning)', width: 60, height: 60 }} />
            case IconType.DoneIcon:
                return <DoneIcon style={{ color: 'var(--color-success)', width: 72, height: 72 }} />
        }
    }, [iconType])

    const providerDescribe = React.useMemo(() => {
        if (providerName) {
            switch (providerName) {
                case ConnectProviders.MetaMask:
                    return <Trans i18nKey={'labelMetaMaskProcessDescribe'}>
                        {/*Please adding MetaMask to your browser,*/}
                        Please click approve button on MetaMask popup window.
                        When MetaMask dialog is dismiss,
                        please manually click <img alt="MetaMask" style={{ verticalAlign: 'text-bottom' }}
                            src={'static/images/MetaMaskPlugIn.png'} /> on your browser toolbar.
                    </Trans>
                case ConnectProviders.WalletConnect:
                    return <Trans i18nKey={'labelWalletConnectProcessDescribe2'}>
                        Please click approve on your device.</Trans>
                default:
                    break
            }
        }
        return <></>
    }, [providerName])

    return <Box flex={1} display={'flex'} alignItems={'center'} justifyContent={'space-between'}
        flexDirection={'column'}>
        <Typography component={'h3'} variant={'h3'} marginBottom={3}>{t(title as string)}</Typography>
        <Typography component={'p'} display={'flex'} alignItems={'center'} flexDirection={'column'} marginBottom={2}>
            {iconDiv}
        </Typography>
        {describe1 && describe1} {txCheck && <>check the tx.</>}
        {txCheck &&
            <Link target='_blank' href={txCheck.route} display={'inline-block'} marginTop={1 / 2}>
                <LinkIcon color={'primary'} fontSize={'small'} style={{ verticalAlign: 'middle' }} />
            </Link>}
        {describe2 && <>{describe2}</>}
        {providerName &&
            <Typography variant={'body2'} color={'textSecondary'} component={'p'} marginTop={3} alignSelf={'flex-start'}
                paddingX={5}>
                {providerDescribe}
            </Typography>
        }
        {btnInfo &&
            <Box marginTop={2} alignSelf={'stretch'} paddingX={5}>
                <Button variant={'contained'} fullWidth size={'medium'} onClick={(e?: any) => { if (btnInfo?.callback) { btnInfo.callback(e) } }}>{btnInfo?.btnTxt} </Button>
            </Box>}
        {link && <>{JSON.stringify(link)}</>}
    </Box>
}

export const ConnectBase = (props: PanelProps & WithTranslation) => {
    const propsPatch = {
        title: 'labelConnect'
    }
    return <BasicPanel {...propsPatch} {...props} />
}

export const CreateAccountBase = (props: PanelProps & WithTranslation) => {
    const propsPatch = {
        title: 'labelCreateAccount'
    }
    return <BasicPanel {...propsPatch} {...props} />
}

export const RetrieveAccountBase = (props: PanelProps & WithTranslation) => {
    const propsPatch = {
        title: 'labelRetrieveAccount'
    }
    return <BasicPanel {...propsPatch} {...props} />
}

export const UnlockAccountBase = (props: PanelProps & WithTranslation) => {
    const propsPatch = {
        title: 'labelUnlockAccount'
    }
    return <BasicPanel {...propsPatch} {...props} />
}

export const UpdateAccountBase = (props: PanelProps & WithTranslation) => {
    const propsPatch = {
        title: 'labelUpdateAccount'
    }
    return <BasicPanel {...propsPatch} {...props} />
}

export const DepositBase = (props: PanelProps & WithTranslation) => {
    const propsPatch = {
        title: 'labelDeposit'
    }
    return <BasicPanel {...props} {...propsPatch} />
}

export const TransferBase = (props: PanelProps & WithTranslation) => {
    const propsPatch = {
        title: 'labelTransfer'
    }
    return <BasicPanel {...propsPatch} {...props} />
}

export const WithdrawBase = (props: PanelProps & WithTranslation) => {
    const propsPatch = {
        title: 'labelWithdraw'
    }
    return <BasicPanel {...propsPatch} {...props} />
}
