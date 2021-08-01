import QRCode from 'qrcode.react';
import { Box, Typography } from '@material-ui/core';

export const WalletConnectQRCode = ({url}: { url: string })=>{
    return  <Box>
        <Typography component={'h2'}>WalletConnect QRCode</Typography>
        <QRCode value={url} size={160} style={{padding: 5, backgroundColor: '#fff'}} aria-label={`link:${url}`}/>

    </Box>
}