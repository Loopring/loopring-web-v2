import QRCode from 'qrcode.react';
import { Box, Typography } from '@mui/material';
import { WithTranslation } from 'react-i18next';
import { Link } from '@mui/material';
import { SoursURL } from '@loopring-web/common-resources';

export const WalletConnectQRCode = ({url,onCopy, t}: { url: string,onCopy:()=>void } & WithTranslation)=>{
    return   <Box flex={1} display={'flex'} alignItems={'center'} justifyContent={'space-between'} flexDirection={'column'}>

        <Typography component={'h3'} variant={'h3'} marginBottom={3} lineHeight={'36px'}>
            <img style={{verticalAlign:'middle'}}  src={SoursURL + 'svg/wallet-connect.svg'} alt={'walletConnect'} height={36}/> WalletConnect
        </Typography>
        <QRCode value={url} size={240} style={{padding: 8, backgroundColor: '#fff'}} aria-label={`link:${url}`}/>

        <Box display={'flex'} alignItems={'center'} justifyContent={'center'} flexDirection={'column'}>
            <Typography variant={'body2'} color={'textSecondary'} marginTop={2}>
                {t('labelWalletConnectQRCode')}
            </Typography>
            <Typography variant={'body2'} component={'p'} marginTop={2} >
                <Link onClick={onCopy}>{t('labelCopyClipBoard')}</Link>
            </Typography>
        </Box>

    </Box>
}