import QRCode from 'qrcode.react';
import { Box, Typography } from '@material-ui/core';
import { WithTranslation } from 'react-i18next';
import React from 'react';

export const WalletConnectQRCode = ({url, t}: { url: string } & WithTranslation)=>{
    return   <Box flex={1} display={'flex'} alignItems={'center'} justifyContent={'space-evenly'} flexDirection={'column'}>
        <Typography component={'h3'} variant={'h2'} marginBottom={3}>
            <img style={{verticalAlign:'middle'}}  src={'static/svg/wallet-connect.svg'} alt={'walletConnect'} height={18}/> WalletConnect
        </Typography>
        <QRCode value={url} size={160} style={{padding: 5, backgroundColor: '#fff'}} aria-label={`link:${url}`}/>
        <Typography component={'p'} marginTop={3} alignSelf={'flex-start'} paddingX={6} >
            {t('labelMetaMaskProcessDescribe')}
        </Typography>
    </Box>
}