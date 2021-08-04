import QRCode from 'qrcode.react';
import { Box, Typography } from '@material-ui/core';
import { WithTranslation } from 'react-i18next';

export const WalletConnectQRCode = ({url, t}: { url: string } & WithTranslation)=>{
    return   <Box flex={1} display={'flex'} alignItems={'center'} justifyContent={'space-evenly'} flexDirection={'column'}>
        <Typography component={'h3'} variant={'h2'} marginBottom={3}>{t('labelWalletConnectQRCode')}</Typography>
        <QRCode value={url} size={160} style={{padding: 5, backgroundColor: '#fff'}} aria-label={`link:${url}`}/>
        <Typography component={'p'} marginTop={3} alignSelf={'flex-start'} paddingX={6} >
            {t('labelMetaMaskProcessDescribe')}
        </Typography>
    </Box>
}