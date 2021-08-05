import { Box, Typography } from '@material-ui/core';
import {  WithTranslation } from 'react-i18next';
import { CoinInfo, EmbarIcon } from '@loopring-web/common-resources';
import { Button } from '../../basic-lib';
//depositTitleAndActive
export const FailedTokenAccess = ({onRetry,t,label="depositTitle",coinInfo}: { coinInfo?:CoinInfo<any>|undefined,label?:string,onRetry:(event:any)=>void, } & WithTranslation)=>{
    return    <Box flex={1} display={'flex'} alignItems={'center'} justifyContent={'space-evenly'} flexDirection={'column'}>
        <Typography component={'h3'} variant={'h2'} marginBottom={3}>{t(label)}</Typography>
        <Typography component={'p'} display={'flex'} alignItems={'center'} flexDirection={'column'}>
            <EmbarIcon color={'error'} style={{width:60,height:60}}></EmbarIcon>
            <Typography variant={'h6'} color={'textSecondary'} marginTop={1}>
                {t('labelFailedTokenAccess',{symbol:coinInfo?.simpleName})}

            </Typography>
        </Typography>
        {/*<Typography component={'p'} marginTop={3} alignSelf={'flex-start'} paddingX={6} >*/}
        {/*    {t('labelMetaMaskProcessDescribe')}*/}
        {/*</Typography>*/}
       
        {/*<Link target='_blank'  href={etherscanLink} display={'inline-block'}  marginTop={1 / 2}>*/}
        {/*    <Typography variant={'body2'}>  <LinkIcon fontSize={'small'}  style={{verticalAlign:'middle'}} /> {'Etherscan'} </Typography>*/}
        {/*</Link>*/}
        <Box marginTop={2} alignSelf={'stretch'} paddingX={3}>
            <Button variant={'contained'} fullWidth size={'medium'}  onClick={onRetry}>{t('labelRetry')} </Button>
        </Box>
    </Box>

}
