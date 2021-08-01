import loadingSvg from '@loopring-web/common-resources/assets/svg/loading.svg';
import { Box, Typography } from '@material-ui/core';

export const MetaMaskProcess = ()=>{
    return   <Box>
        <Typography component={'h2'}>MetaMask Processing</Typography>
        <img width={20} height={20} src={loadingSvg}
             alt={'loading'}/>
    </Box>
}