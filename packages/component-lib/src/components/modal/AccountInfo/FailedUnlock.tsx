import { Box, Link, Typography } from '@material-ui/core';
import { Trans, WithTranslation } from 'react-i18next';
import { EmbarIcon } from '@loopring-web/common-resources';

export const FailedUnlock = ({onRetry,t}: { onRetry:(event:any)=>void } & WithTranslation)=>{
    return    <Box flex={1} display={'flex'} alignItems={'center'} justifyContent={'space-evenly'} flexDirection={'column'}>
        <Typography component={'h3'} variant={'h2'} marginBottom={3}>{t('labelUnLockLayer2')}</Typography>
        <Typography component={'p'} display={'flex'} alignItems={'center'} flexDirection={'column'}>
            <EmbarIcon color={'error'} style={{width:60,height:60}}></EmbarIcon>
            <Typography variant={'h6'} color={'textSecondary'} marginTop={1}>{t('labelFailedUnLocK')}</Typography>
        </Typography>
        {/*<Typography component={'p'} marginTop={3} alignSelf={'flex-start'} paddingX={6} >*/}
        {/*    {t('labelMetaMaskProcessDescribe')}*/}
        {/*</Typography>*/}
        <Typography component={'p'} marginTop={2} >
            <Trans i18nKey={'labelRejectOrError'}>
                Rejected, Please<Link onClick={onRetry}>retry</Link>
            </Trans>
        </Typography>

    </Box>

}
