import { MenuItem } from '../../../basic-lib';
import { ListItemText, Typography } from '@material-ui/core';

export const ChargeFeeTokenListView = <C extends { [ key: string ]: any }>({chargeFeeTokenList}: {
    chargeFeeTokenList: Array<{ belong: C | string, fee: number | string, __raw__?: any }>
}): JSX.Element => {
    return <>{chargeFeeTokenList.map(({belong, fee}, index) => {
            // @ts-ignore
            return <MenuItem key={index} value={index} withNoCheckIcon={'true'}>
                <ListItemText primary={<Typography
                    sx={{display: 'inline'}}
                    component="span"
                    variant="body1"
                    color="text.primary"
                >{belong}</Typography>} secondary={<Typography
                    sx={{display: 'inline'}}
                    component="span"
                    variant="body1"
                    color="text.primaryLight"
                >{fee}</Typography>}/>
            </MenuItem>
        })
        }
    </>
}

// ) )as <C extends { [ key: string ]: any }>(props: {
//     chargeFeeTokenList: Array<{ belong: C, fee: number | string, __raw__?: any }>
// }) => JSX.Element;