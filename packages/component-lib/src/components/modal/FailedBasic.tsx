// import { Button } from '../../basic-lib';
import { Box, Typography } from '@material-ui/core';
import {  WithTranslation } from 'react-i18next';
import {  EmbarIcon } from '@loopring-web/common-resources';
import { Button } from '../basic-lib';


export const FailedBasic= ({onRetry,describe,label,t}: {describe:JSX.Element, onRetry:(event:any)=>void,label:string } & WithTranslation)=>{
    return    <Box flex={1} display={'flex'} alignItems={'center'}  justifyContent={'space-between'} flexDirection={'column'}>
        <Typography component={'h3'} variant={'h2'} marginBottom={3}>{t(label)}</Typography>
        <Typography component={'p'} display={'flex'} alignItems={'center'} flexDirection={'column'} marginBottom={2}>
            <EmbarIcon color={'error'} style={{width:60,height:60}}></EmbarIcon>
        </Typography>
        {describe}
        {/*<Typography component={'p'} marginTop={3} alignSelf={'flex-start'} paddingX={6} >*/}
        {/*    {t('labelMetaMaskProcessDescribe')}*/}
        {/*</Typography>*/}
        {/*<Typography component={'p'} marginTop={2} >*/}
        {/*    <Trans i18nKey={'labelRejectOrError'}>*/}
        {/*        Rejected, Please<Link onClick={onRetry}>retry</Link>*/}
        {/*    </Trans>*/}
        {/*</Typography>*/}
        <Box marginTop={2} alignSelf={'stretch'} paddingX={6}>
            <Button variant={'contained'} fullWidth size={'medium'}  onClick={onRetry}>{t('labelRetry')} </Button>
        </Box>
    </Box>

}
