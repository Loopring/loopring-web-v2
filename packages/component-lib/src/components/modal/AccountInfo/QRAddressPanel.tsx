import QRCode from 'qrcode.react';
import { Typography } from '@material-ui/core';
import { WithTranslation, withTranslation } from 'react-i18next';
import { Box } from '@material-ui/core/';
import { Account } from '@loopring-web/common-resources';


export const QRAddressPanel = withTranslation('common')(({
                                                   accAddress,
                                                   etherscanUrl,
                                               }: WithTranslation & { etherscanUrl: string} & Account) => {
    const etherscanLink = etherscanUrl + accAddress;
    return <Box flex={1} paddingY={2} paddingX={2}  display={'flex'} flexDirection={'column'}
                alignItems={'center'} justifyContent={'center'} >
        <QRCode value={etherscanLink} size={200} style={{backgroundColor: '#fff'}}
                aria-label={`link:${etherscanLink}`}/>
        <Typography marginTop={3} variant={'body2'} color={'textSecondary'}
                    style={{wordBreak: 'break-all'}}>{accAddress}</Typography>
    </Box>
})