import { AccountBaseProps } from './Interface';
import { AccountBase } from './AccountBase';
import { Button } from '../../basic-lib';
import { Box, Typography } from '@material-ui/core';
import { WithTranslation, withTranslation } from 'react-i18next';


export const HadAccount = withTranslation('common')(({ goDeposit, unlock, t, ...props }: WithTranslation & AccountBaseProps
    & {
        unlock: () => void,
        goDeposit: () => void
    }) => {
    return <Box flex={1} display={'flex'} justifyContent={'space-between'} alignItems={'center'}>

        <AccountBase {...props} t={t} />
        <Box display={'flex'} marginTop={3} flexDirection={'column'} alignItems={'center'}>
            <Typography variant={'body2'} >
                {t('labelActivatedAccountDeposit')}
            </Typography>

        </Box>

        <Button onClick={() => {
            unlock();
        }}>unlock</Button>

        <Button onClick={() => {
            goDeposit();
        }}>t('depositLabelBtn') </Button>
    </Box>

})