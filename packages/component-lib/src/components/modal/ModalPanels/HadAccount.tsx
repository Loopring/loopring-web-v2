import { AccountBaseProps } from './Interface'
import { AccountBasePanel } from './AccountBase'
import { Box } from '@mui/material';
import { WithTranslation, withTranslation } from 'react-i18next';
import { DepositRecorder } from './DepositRecorder';
import { AccountHashInfo } from '@loopring-web/common-resources';

export const HadAccount = withTranslation('common')(({mainBtn, t, ...props }: WithTranslation &
    AccountBaseProps & {
    clearDepositHash: () => void ,
    chainInfos:AccountHashInfo}) => {
    return <Box flex={1} display={'flex'} flexDirection={'column'} justifyContent={'space-between'} alignItems={'center'}>
        <Box display={'flex'} flex={1}  justifyContent={'center'} alignItems={'center'}>
            <AccountBasePanel {...props} t={t}/>
        </Box>
        <Box display={'flex'}  marginTop={2} alignSelf={'stretch'} paddingX={5} flexDirection={'column'} alignItems={'center'}>
            {mainBtn}
        </Box>

        <Box display={'flex'} marginX={0}  marginTop={3} marginBottom={-5} alignSelf={'stretch'} paddingX={5} padding={0} >
            <DepositRecorder  {...props} clear={props.clearDepositHash} t={t}/>
        </Box>

    </Box>
})