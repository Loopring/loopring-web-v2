// import { Button } from '../../basic-lib';
import { Box, Typography } from '@material-ui/core';
import {  WithTranslation } from 'react-i18next';
import {  EmbarIcon } from '@loopring-web/common-resources';
import { Button } from '../basic-lib';

export const FailedBasic= ({onRetry,describe,label,t}: {describe:JSX.Element, onRetry:(event:any)=>void,label:string } & WithTranslation)=>{
    return    <Box flex={1} display={'flex'} alignItems={'center'}  justifyContent={'space-between'} flexDirection={'column'}>
        <Typography component={'h3'} variant={'h3'} marginBottom={3}>{t(label)}</Typography>
        <Typography component={'p'} display={'flex'} alignItems={'center'} flexDirection={'column'} marginBottom={2}>
            <EmbarIcon color={'error'} style={{width:60,height:60}}></EmbarIcon>
        </Typography>
        {describe}
        <Box marginTop={2} alignSelf={'stretch'} paddingX={5}>
            <Button variant={'contained'} fullWidth size={'medium'}  onClick={onRetry}>{t('labelRetry')} </Button>
        </Box>
    </Box>

}
