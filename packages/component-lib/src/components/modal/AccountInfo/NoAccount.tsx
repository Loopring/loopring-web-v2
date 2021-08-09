import { AccountBase } from './AccountBase';
import { AccountBaseProps } from './Interface';
import { Box, Typography } from '@material-ui/core/';
import { Button,AnimationArrow } from '../../../index';
import { WithTranslation, withTranslation } from 'react-i18next';

export const NoAccount =  withTranslation('common')(({goDeposit,t,...props}:WithTranslation & AccountBaseProps & { goDeposit:()=>void }) => {
    return <Box flex={1} display={'flex'} flexDirection={'column'} justifyContent={'space-between'} alignItems={'center'}>
        <AccountBase {...props} t={t}/>
        <Box display={'flex'} marginTop={3} flexDirection={'column'} alignItems={'center'}>
            <Typography variant={'body2'} marginBottom={1}>
                {t('labelActivatedAccountDeposit')}
            </Typography>
        </Box>
        <Box marginTop={2} alignSelf={'stretch'} paddingX={5} display={'flex'} flexDirection={'column'} alignItems={'center'}>
            <AnimationArrow className={'arrowCta'}/>
            <Button variant={'contained'} fullWidth size={'medium'}  onClick={() => {
                goDeposit();
            }}>{t('depositLabelBtn')} </Button>
        </Box>

    </Box>

})