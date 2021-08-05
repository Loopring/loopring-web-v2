import QRCode from 'qrcode.react';
import { Box, Typography } from '@material-ui/core';
import { WithTranslation } from 'react-i18next';
import { Link } from '@material-ui/core/';

export const WalletConnectQRCode = ({url,onCopy, t}: { url: string,onCopy:()=>void } & WithTranslation)=>{
    return   <Box flex={1} display={'flex'} alignItems={'center'} justifyContent={'space-evenly'} flexDirection={'column'}>
        <Typography component={'h3'} variant={'h2'} marginBottom={3}>
            <img style={{verticalAlign:'middle'}}  src={'static/svg/wallet-connect.svg'} alt={'walletConnect'} height={18}/> WalletConnect
        </Typography>
        <QRCode value={url} size={160} style={{padding: 5, backgroundColor: '#fff'}} aria-label={`link:${url}`}/>
        <Typography variant={'body2'} component={'p'} marginTop={2} >
        <Link onClick={onCopy}>{t('labelCopyClipBoard')}</Link>
        </Typography>
    </Box>
}