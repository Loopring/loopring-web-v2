import { Box, Typography } from '@material-ui/core/';
import { WithTranslation } from 'react-i18next';
import { AccountBaseProps, AnimationArrow, Button } from '../../../index';
import { AccountBase } from './AccountBase';

export const ApproveAccount = ({
                                   t,
                                   goActiveAccount: goActivateAccount,
                                   ...props
                               }: WithTranslation & AccountBaseProps & { goActiveAccount: () => void }) => {
    // const theme = useTheme();
    return <Box flex={1} display={'flex'} flexDirection={'column'} justifyContent={'space-between'}
                alignItems={'center'}>
        <AccountBase {...props} t={t}/>
        <Box display={'flex'} marginTop={3} flexDirection={'column'} alignItems={'center'}>
            <Typography variant={'body2'} marginBottom={1}>
                {t('labelActivatedAccountDeposit')}
            </Typography>

            <AnimationArrow className={'arrowCta'}/>
        </Box>
        <Box marginTop={2} alignSelf={'stretch'} paddingX={5}>
            <Button variant={'contained'} fullWidth size={'medium'} onClick={() => {
                goActivateAccount();
            }}>{t('labelActivateAccount')} </Button>
        </Box>
    </Box>
    // <Box flex={1} display={'flex'} alignItems={'center'} justifyContent={'space-evenly'}
    //             flexDirection={'column'}>
    //     <Typography component={'h3'} variant={'h3'} marginBottom={3}>{t('labelDepositApproveProcess')}</Typography>
    //     <Typography color={theme.colorBase.success} component={'p'} display={'flex'} alignItems={'center'} flexDirection={'column'}>
    //         {t('labelDepositApproveSuccess')}
    //         <Link target='_blank'  href={etherscanLink} display={'inline-block'}  marginTop={1 / 2}>
    //             <Typography variant={'body2'} >  <LinkIcon fontSize={'small'}  style={{verticalAlign:'middle'}} /> {'Etherscan'} </Typography>
    //         </Link>
    //     </Typography>
    //     <Box width={120} marginTop={2}>
    //         <Button variant={'contained'} fullWidth size={'medium'}  onClick={() => {
    //             goActiveAccount();
    //         }}>{t('depositLabelBtn')} </Button>
    //     </Box>
    //
    // </Box>
}
