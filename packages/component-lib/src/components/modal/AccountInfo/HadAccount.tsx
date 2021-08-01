import { AccountBaseProps } from './Interface';
import { AccountBase } from './AccountBase';
import { Button } from '../../basic-lib';
import { Box } from '@material-ui/core';
import { Account } from '@loopring-web/common-resources';


export const HadAccount = (props: AccountBaseProps & { account: Account }) => {
    // const
    return <Box flex={1} alignItems={'stretch'}>
        <AccountBase {...props}/>
        <Button onClick={() => {
            //TODO
        }}>lock/ unlock</Button>
    </Box>
}