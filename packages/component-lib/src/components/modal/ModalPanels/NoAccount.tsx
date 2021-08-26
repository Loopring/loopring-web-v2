import { AccountBasePanel } from './AccountBase';
import { AccountBaseNewProps } from './Interface';
import { Box, Typography } from '@material-ui/core/';
import { Button, AnimationArrow } from '../../../index';
import { WithTranslation, withTranslation } from 'react-i18next';

export const NoAccount =  withTranslation('common')(({goDeposit,t,...props}:WithTranslation & AccountBaseNewProps & { goDeposit:()=>void }) => {
    return <Box flex={1} display={'flex'} flexDirection={'column'} justifyContent={'space-between'} alignItems={'center'}>
        <AccountBasePanel {...props} t={t}/>
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

    </Box>

})

