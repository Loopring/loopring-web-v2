import { AccountBasePanel } from './AccountBase';
import {AccountBaseProps } from './Interface';
import { Box, Typography } from '@mui/material';
import { Button, AnimationArrow } from '../../../index';
import { WithTranslation, withTranslation } from 'react-i18next';
import { ChainHashInfos } from '@loopring-web/common-resources';

export const NoAccount =  withTranslation('common')(({goDeposit,t,...props}: WithTranslation & AccountBaseProps & { goDeposit:()=>void,
    chainInfos:ChainHashInfos
    // updateDepositHash: (depositHash: string,accountAddress:string,status?:'success'|'failed') => void,
}) => {
    return <Box flex={1} display={'flex'} flexDirection={'column'} justifyContent={'space-between'} alignItems={'center'}>
        <Box display={'flex'} flex={1} marginBottom={5} justifyContent={'center'} alignItems={'center'}>

            <AccountBasePanel {...props} t={t}/>
        </Box>
        {/*<Box display={'flex'} marginTop={3} flexDirection={'column'} alignItems={'center'}>*/}
        {/*    */}
        {/*</Box>*/}
        <Box display={'flex'}  marginTop={2} alignSelf={'stretch'} paddingX={5} flexDirection={'column'} alignItems={'center'}>
            <Typography variant={'body2'}>
                {t('labelActivatedAccountDeposit')}
            </Typography>
            <AnimationArrow className={'arrowCta'}/>
            <Button variant={'contained'} fullWidth size={'medium'}  onClick={() => {
                goDeposit()
            }}>{t('depositLabelBtn')} </Button>
        </Box>
        {/*<DepositRecorder  {...props} t={t}/>*/}


    </Box>

})

    