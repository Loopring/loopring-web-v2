import { Box, Typography } from '@material-ui/core';
import {  WithTranslation } from 'react-i18next';
import { CheckedIcon } from '@loopring-web/common-resources';
import { useTheme } from '@emotion/react';
import { Button } from '../basic-lib';

export const SuccessBasic = ({t, label, describe,onClose }: WithTranslation & {label:string,describe:JSX.Element, onClose:(event:any)=>void }) => {
    const theme = useTheme();
    return   <Box flex={1} display={'flex'} alignItems={'center'}  justifyContent={'space-between'} flexDirection={'column'}>
        <Typography component={'h3'} variant={'h2'} marginBottom={3}>{label}</Typography>
        <Typography component={'p'} display={'flex'} alignItems={'center'} flexDirection={'column'} marginBottom={2}>
            <CheckedIcon style={{width: 60, height: 60, color: theme.colorBase.success}}/>
        </Typography>
        {/*<Typography component={'p'} marginTop={3} alignSelf={'flex-start'} paddingX={6} >*/}
        {/*    {t('labelMetaMaskProcessDescribe')}*/}
        {/*</Typography>*/}
        {/*<Typography component={'p'} marginTop={2} >*/}
        {/*    <Trans i18nKey={'labelRejectOrError'}>*/}
        {/*        Rejected, Please<Link onClick={onRetry}>retry</Link>*/}
        {/*    </Trans>*/}
        {/*</Typography>*/}
        {describe}

        <Box marginTop={2} alignSelf={'stretch'} paddingX={5}>
            <Button variant={'contained'} fullWidth size={'medium'}  onClick={onClose}>{t('labelClose')} </Button>
        </Box>
    </Box>



}
