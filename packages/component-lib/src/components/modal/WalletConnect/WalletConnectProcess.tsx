import loadingSvg from '@loopring-web/common-resources/assets/svg/loading.svg';
import { Box, Typography } from '@material-ui/core';
import { Trans, WithTranslation } from 'react-i18next';
import React from 'react';
import { LoadingIcon } from '@loopring-web/common-resources';

export const WalletConnectProcess = ({t}:WithTranslation)=>{
    return   <Box flex={1} display={'flex'} alignItems={'center'} justifyContent={'space-evenly'} flexDirection={'column'}>
        <Typography component={'h3'} variant={'h2'} marginBottom={3}>{t('labelWalletConnectProcessing')}</Typography>
        <Typography component={'p'} display={'flex'} alignItems={'center'} flexDirection={'column'}>
            <LoadingIcon color={'primary'} style={{width:60,height:60}}/>
            <Typography component={'span'} variant={'body1'} paddingY={1}>{t('labelProcessing')}</Typography>
        </Typography>
        <Typography variant={'body2'} color={'textSecondary'} component={'p'} marginTop={3} alignSelf={'flex-start'} paddingX={6} textAlign={'b'}>
            <Trans i18nKey={'labelWalletConnectProcessDescribe'}>
                 Please wait WalletConnect Provider working processing
            </Trans>
        </Typography>
    </Box>
}
