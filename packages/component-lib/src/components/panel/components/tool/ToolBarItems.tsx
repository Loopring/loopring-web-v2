import { Grid } from '@material-ui/core';
import { DropDownIcon } from '../../../../static-resource';
import { SwitchData } from '../../Interface';
import { IconButtonStyled } from '../index'

export const ToolBarItemBack = <T extends any>({
                                                   onChangeEvent,
                                                   tradeData
                                               }: { tradeData: T, onChangeEvent: (index: 0 | 1, data: SwitchData<T>) => Promise<void> }) => {
    return <Grid container justifyContent={'flex-start'}>
        <IconButtonStyled edge="start" sx={{transform: 'rotate(90deg)', transformOrigin: '50%'}}
                          className={'switch'}
                          color="inherit"
                          onClick={() => {
                              onChangeEvent(0, {tradeData, to: 'button'})}
                          }
                          aria-label="to Professional">

            <DropDownIcon/>
        </IconButtonStyled>
    </Grid>
}