import { Box, Typography } from '@material-ui/core/';
import { ConnectProviders, LoadingIcon } from '@loopring-web/common-resources';
import { Trans, WithTranslation } from 'react-i18next';
import React from 'react';

export const ProcessUnlock = ({t, providerName}: WithTranslation & { providerName: string }) => {
   const Describe = React.useMemo(()=>{
       switch (providerName){
           case  ConnectProviders.MetaMask:
               return <Trans i18nKey={'labelMetaMaskProcessDescribe'}>
                   {/*Please adding MetaMask to your browser,*/}
                   Please click approve button on MetaMask popup window.
                   When MetaMask dialog is dismiss,
                   please manually click <img  alt="MetaMask" style={{verticalAlign:'middle'}} src={'static/images/MetaMaskPlugIn.png'}/> on your browser toolbar.
               </Trans>
           case  ConnectProviders.WalletConnect:
               return <Trans i18nKey={'labelWalletConnectProcessDescribe2'}>
                   Please click approve on your device.</Trans>
       }
   },[providerName])

    return <Box flex={1} display={'flex'} alignItems={'center'} justifyContent={'space-evenly'}
                flexDirection={'column'}>
        <Typography component={'h3'} variant={'h2'} marginBottom={3}>{t('labelUnlockProcessing')}</Typography>
        <Typography component={'p'} display={'flex'} alignItems={'center'} flexDirection={'column'}>
            <LoadingIcon color={'primary'} style={{width:60,height:60}}/>
            <Typography component={'span'} paddingY={1}>{t('labelProcessing')}</Typography>
        </Typography>
        <Typography variant={'body2'} color={'textSecondary'} component={'p'} marginTop={3} alignSelf={'flex-start'} paddingX={6} >
            {Describe}
        </Typography>


    </Box>
}

