import { Grid } from '@mui/material';
import { DropDownIcon } from '@loopring-web/common-resources';
import { SwitchData } from '../../Interface';
import { IconButtonStyled } from '../Styled';

export const ToolBarItemBack = <T extends any>({
                                                   onChangeEvent,
                                                   tradeData
                                               }: { tradeData: T, onChangeEvent: (index: 0 | 1, data: SwitchData<T>) => Promise<void>|void }) => {
    return <Grid container justifyContent={'flex-start'}>
        <IconButtonStyled edge="start" sx={{transform: 'rotate(90deg)', transformOrigin: '50%'}}
                          className={'switch'}
                          color="inherit"
                          onClick={() => {
                              onChangeEvent(0, {tradeData, to: 'button'})
                          }
                          }
                          aria-label="to Professional">

            <DropDownIcon/>
        </IconButtonStyled>
    </Grid>
}