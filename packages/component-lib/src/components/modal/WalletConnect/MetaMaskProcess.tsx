// import loadingSvg from '@loopring-web/common-resources/assets/svg/loading.svg';
import { Avatar, Box, Typography } from '@material-ui/core';
import { Trans, WithTranslation } from 'react-i18next';
import { LoadingIcon } from '@loopring-web/common-resources';
import { useTheme } from '@emotion/react';
import React from 'react';

export const MetaMaskProcess = ({t}: WithTranslation) => {
    const theme = useTheme();
    return <Box flex={1} display={'flex'} alignItems={'center'} justifyContent={'space-evenly'}
                flexDirection={'column'}>
        <Typography component={'h3'} variant={'h2'} marginBottom={3}>{t('labelMetaMaskProcessing')}</Typography>
        <Typography component={'p'} display={'flex'} alignItems={'center'} flexDirection={'column'}>
            <LoadingIcon color={'primary'} style={{width:60,height:60}}/>
            <Typography component={'span'} paddingY={1}>{t('labelProcessing')}</Typography>
        </Typography>
        <Typography variant={'body2'} color={'textSecondary'} component={'p'} marginTop={3} alignSelf={'flex-start'} paddingX={6} textAlign={'b'}>
            <Trans i18nKey={'labelMetaMaskProcessDescribe'}>
                {/*Please adding MetaMask to your browser,*/}
                Please click approve button on MetaMask popup window.
                When MetaMask dialog is dismiss,
                please manually click <img style={{verticalAlign:'middle'}} src={'static/images/MetaMaskPlugIn.png'}/> on your browser toolbar.
            </Trans>

        </Typography>


    </Box>

}