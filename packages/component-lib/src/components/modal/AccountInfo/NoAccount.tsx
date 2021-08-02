import { AccountBase } from './AccountBase';
import { AccountBaseProps } from './Interface';
import { Box } from '@material-ui/core/';
import { Button } from '../../../index';

export const NoAccount = ({goDeposit,...props}: AccountBaseProps & { goDeposit:()=>void }) => {
    return <Box flex={1} alignItems={'stretch'}>
        <AccountBase {...props}/>
        <Button onClick={() => {
            goDeposit();
        }}>Click To deposit </Button>
    </Box>

}