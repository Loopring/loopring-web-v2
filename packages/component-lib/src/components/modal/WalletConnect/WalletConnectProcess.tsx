import loadingSvg from '@loopring-web/common-resources/assets/svg/loading.svg';
import { Box, Typography } from '@material-ui/core';

export const WalletConnectProcess = ()=>{
    return   <Box>
        <Typography component={'h2'}>WalletConnect Processing</Typography>
        <img width={20} height={20} src={loadingSvg}
             alt={'loading'}/>
    </Box>
}