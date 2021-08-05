import { Box, Link, Typography } from '@material-ui/core';
import { Trans, WithTranslation } from 'react-i18next';
import { EmbarIcon, LinkIcon } from '@loopring-web/common-resources';
//depositTitleAndActive
export const FailedDeposit = ({onRetry,t,label="depositTitle",etherscanLink}: { label?:string,onRetry:(event:any)=>void,etherscanLink:string  } & WithTranslation)=>{
    return    <Box flex={1} display={'flex'} alignItems={'center'} justifyContent={'space-evenly'} flexDirection={'column'}>
        <Typography component={'h3'} variant={'h2'} marginBottom={3}>{t(label)}</Typography>
        <Typography component={'p'} display={'flex'} alignItems={'center'} flexDirection={'column'}>
            <EmbarIcon color={'error'} style={{width:60,height:60}}></EmbarIcon>
            <Typography variant={'h6'} color={'textSecondary'} marginTop={1}>{t('labelFailedDeposit')}</Typography>
        </Typography>
        {/*<Typography component={'p'} marginTop={3} alignSelf={'flex-start'} paddingX={6} >*/}
        {/*    {t('labelMetaMaskProcessDescribe')}*/}
        {/*</Typography>*/}
        <Typography component={'p'} marginTop={2} >
            <Trans i18nKey={'labelFailedDeposit'}>
                Rejected, Please<Link onClick={onRetry}>retry</Link>
            </Trans>
        </Typography>
        <Link target='_blank'  href={etherscanLink} display={'inline-block'}  marginTop={1 / 2}>
            <Typography variant={'body2'}>  <LinkIcon fontSize={'small'}  style={{verticalAlign:'middle'}} /> {'Etherscan'} </Typography>
        </Link>
    </Box>

}
