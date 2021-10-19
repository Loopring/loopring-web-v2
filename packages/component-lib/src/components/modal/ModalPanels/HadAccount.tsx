import { AccountBaseProps } from './Interface'
import { AccountBasePanel } from './AccountBase'
import { Box } from '@mui/material';
import { WithTranslation, withTranslation } from 'react-i18next';
import { DepositRecorder } from './DepositRecorder';
import { ChainHashInfos } from '@loopring-web/common-resources';

export const HadAccount = withTranslation('common')(({mainBtn, t, ...props }: WithTranslation &
    AccountBaseProps & {
    // updateDepositHash: (depositHash: string,accountAddress:string,status?:'success'|'failed') => void,
    chainInfos:ChainHashInfos}) => {
    return <Box flex={1} display={'flex'} flexDirection={'column'} justifyContent={'space-between'} alignItems={'center'}>
        <Box display={'flex'} flex={1}  justifyContent={'center'} alignItems={'center'}>
            <AccountBasePanel {...props} t={t}/>
        </Box>
        {/*marginBottom={6}*/}
        {/*<Box display={'flex'}  flexDirection={'column'} alignItems={'center'}>*/}
        {/*    <Typography variant={'body2'} marginBottom={1} >*/}
        {/*        {t('labelActivatedAccountDeposit')}*/}
        {/*    </Typography>*/}
        {/*</Box>*/}
        <Box display={'flex'}  marginTop={2} alignSelf={'stretch'} paddingX={5} flexDirection={'column'} alignItems={'center'}>
            {mainBtn}
        </Box>

        <Box display={'flex'} marginX={0}  marginTop={3} marginBottom={-5} alignSelf={'stretch'} paddingX={5} padding={0} >
            <DepositRecorder  {...props} t={t}/>
        </Box>

    </Box>
})