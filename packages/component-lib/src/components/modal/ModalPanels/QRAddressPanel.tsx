import QRCode from 'qrcode.react';
import { Typography } from '@mui/material';
import { WithTranslation, withTranslation } from 'react-i18next';
import { Box } from '@mui/material';
import { Account } from '@loopring-web/common-resources';


export const QRAddressPanel = withTranslation('common')(({
                                                   accAddress,
                                                //    etherscanUrl,
                                               }: WithTranslation & { etherscanUrl: string} & Account) => {
//     const etherscanLink = etherscanUrl + 'address/' + accAddress;
    return <Box flex={1} paddingY={2} paddingX={2}  display={'flex'} flexDirection={'column'}
                alignItems={'center'} justifyContent={'center'} >
        <QRCode value={accAddress} size={240} style={{padding: 8,backgroundColor: '#fff'}}
                aria-label={`address:${accAddress}`}/>
        <Typography marginTop={3} variant={'body2'} color={'textSecondary'}
                    style={{wordBreak: 'break-all'}}>{accAddress}</Typography>
    </Box>
})
