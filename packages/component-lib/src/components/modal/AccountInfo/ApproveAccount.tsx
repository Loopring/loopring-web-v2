import { Box, Link, Typography } from '@material-ui/core/';
import { WithTranslation } from 'react-i18next';
import { LinkIcon } from '@loopring-web/common-resources';
import { useTheme } from '@emotion/react';
import { Button } from '../../basic-lib';

export const ApproveAccount = ({t ,etherscanLink,goActiveAccount}: WithTranslation & {goActiveAccount:()=>void, etherscanLink:string }) => {
    const theme = useTheme();
    return <Box flex={1} display={'flex'} alignItems={'center'} justifyContent={'space-evenly'}
                flexDirection={'column'}>
        <Typography component={'h3'} variant={'h2'} marginBottom={3}>{t('labelDepositApproveProcess')}</Typography>
        <Typography color={theme.colorBase.success} component={'p'} display={'flex'} alignItems={'center'} flexDirection={'column'}>
            {t('labelDepositApproveSuccess')}
            <Link target='_blank'  href={etherscanLink} display={'inline-block'}  marginTop={1 / 2}>
                <Typography variant={'body2'} >  <LinkIcon fontSize={'small'}  style={{verticalAlign:'middle'}} /> {'Etherscan'} </Typography>
            </Link>
        </Typography>
        <Box width={120} marginTop={2}>
            <Button variant={'contained'} fullWidth size={'medium'}  onClick={() => {
                goActiveAccount();
            }}>{t('depositLabelBtn')} </Button>
        </Box>

    </Box>
}
