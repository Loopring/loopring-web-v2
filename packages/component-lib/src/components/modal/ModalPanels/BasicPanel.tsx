import { Box, Typography } from '@material-ui/core';
import { Trans, WithTranslation } from 'react-i18next';
import {
    ConnectProviders,
    LoadingIcon,
    DoneIcon, FailedIcon, RefuseIcon, GoodIcon,
} from '@loopring-web/common-resources';
import React from 'react';

import { Button } from '../../basic-lib';

export enum IconType {
    LoadingIcon,
    DoneIcon,
    FailedIcon,
    RefuseIcon,
    GoodIcon,
}

export interface PanelProps {
    title: string,
    iconType: IconType,
    describe1: string,
    describe2?: string,
    txCheck?: {
        route: string,
        callback: () => boolean,
    },
    btnInfo?: {
        btnTxt: string,
        callback: () => boolean,
    }
    providerName?: ConnectProviders,
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
            case IconType.DoneIcon:
                return <LoadingIcon color={'primary'} style={{ width: 72, height: 72 }} />
            case IconType.FailedIcon:
                return <FailedIcon color={'primary'} style={{ width: 72, height: 72 }} />
            case IconType.GoodIcon:
                return <GoodIcon color={'primary'} style={{ width: 72, height: 72 }} />
            case IconType.RefuseIcon:
                return <RefuseIcon color={'primary'} style={{ width: 72, height: 72 }} />
            case IconType.DoneIcon:
                return <DoneIcon color={'primary'} style={{ width: 72, height: 72 }} />
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
            }
        }
    }, [providerName])

    return <Box flex={1} display={'flex'} alignItems={'center'} justifyContent={'space-between'}
        flexDirection={'column'}>
        <Typography component={'h3'} variant={'h3'} marginBottom={3}>{t(title)}</Typography>
        <Typography component={'p'} display={'flex'} alignItems={'center'} flexDirection={'column'} marginBottom={2}>
            {iconDiv}
        </Typography>
        {describe1} { txCheck && <>check the tx.</> }
        {describe2 && <>{describe2}</>}
        {providerName &&
            <Typography variant={'body2'} color={'textSecondary'} component={'p'} marginTop={3} alignSelf={'flex-start'}
                paddingX={5}>
                {providerDescribe}
            </Typography>
        }
        {btnInfo &&
            <Box marginTop={2} alignSelf={'stretch'} paddingX={5}>
                <Button variant={'contained'} fullWidth size={'medium'} onClick={btnInfo.callback}>{t(btnInfo.btnTxt)} </Button>
            </Box>}
        {link && <>{JSON.stringify(link)}</>}
    </Box>
}

export const ConnectBase = (props: PanelProps & WithTranslation) => {
    props.title = 'labelConnect'
    return <BasicPanel {...props} />
}

export const CreateAccountBase = (props: PanelProps & WithTranslation) => {
    props.title = 'labelCreateAccount'
    return <BasicPanel {...props} />
}

export const RetrieveAccountBase = (props: PanelProps & WithTranslation) => {
    props.title = 'labelRetrieveAccount'
    return <BasicPanel {...props} />
}

export const UnlockAccountBase = (props: PanelProps & WithTranslation) => {
    props.title = 'labelRetrieveAccount'
    return <BasicPanel {...props} />
}

export const ActivateAccountBase = (props: PanelProps & WithTranslation) => {
    props.title = 'labelActivateAccount'
    return <BasicPanel {...props} />
}
