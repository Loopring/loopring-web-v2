import { Box, Typography } from '@material-ui/core';
import { LinkIcon, LoadingIcon } from '@loopring-web/common-resources';
import { WithTranslation } from 'react-i18next';
import { Link } from '@material-ui/core/';
import { Button } from '../../basic-lib';

export const Depositing =  ({t, goUpdateAccount, label='depositTitle',etherscanLink,count=30}: WithTranslation & { goUpdateAccount?: () => void ,label?:'depositTitle'|'depositTitleAndActive',etherscanLink:string,count?:number}) => {
    return <Box flex={1} display={'flex'} alignItems={'center'} justifyContent={'space-evenly'}
                flexDirection={'column'}>
        <Typography component={'h3'} variant={'h2'} marginBottom={3}>{t(label)}</Typography>
        <Typography component={'p'} display={'flex'} alignItems={'center'} flexDirection={'column'}>
            <LoadingIcon color={'primary'} style={{width:60,height:60}}/>
        </Typography>
        <Typography color={'textSecondary'} component={'span'} paddingY={1}>{t('labelDepositingProcessing',{count})}</Typography>
        <Link target='_blank'  href={etherscanLink} display={'inline-block'}  marginTop={1 / 2}>
            <Typography variant={'body2'}>  <LinkIcon fontSize={'small'}  style={{verticalAlign:'middle'}} /> {'Etherscan'} </Typography>
        </Link>
        <Box marginTop={2} alignSelf={'stretch'} paddingX={6}>
            <Button variant={'contained'} fullWidth size={'medium'} onClick={() => {
                if (goUpdateAccount) {
                    goUpdateAccount()
                }
            }}>{t('labelActiveAccount')} </Button>
        </Box>

    </Box>
}
