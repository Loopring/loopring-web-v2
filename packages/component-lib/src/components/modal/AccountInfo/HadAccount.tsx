import { AccountBaseProps } from './Interface';
import { AccountBase } from './AccountBase';
import { Box } from '@material-ui/core';
import { WithTranslation, withTranslation } from 'react-i18next';


export const HadAccount = withTranslation('common')(({mainBtn, t, ...props }: WithTranslation & AccountBaseProps) => {
    return <Box flex={1} display={'flex'} flexDirection={'column'} justifyContent={'space-between'} alignItems={'center'}>
        <AccountBase {...props} t={t}/>
        {/*<Box display={'flex'}  flexDirection={'column'} alignItems={'center'}>*/}
        {/*    <Typography variant={'body2'} marginBottom={1} >*/}
        {/*        {t('labelActivatedAccountDeposit')}*/}
        {/*    </Typography>*/}
        {/*</Box>*/}
        <Box width={120} marginTop={3}>
            {mainBtn}
        </Box>

    </Box>
})