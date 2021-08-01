import { Button } from '../../basic-lib';
import { Box, Typography } from '@material-ui/core';

export const FailedConnect = ({handleRetry}: { handleRetry:(event:any)=>void })=>{
    return   <Box>
        <Typography component={'h2'}>Failed Connect</Typography>
        <Button onClick={handleRetry}>Retry</Button>
    </Box>

}
