import { createSlice, PayloadAction, Slice } from '@reduxjs/toolkit'
import { AmmActivityMapStates } from './interface';
import { STATUS } from '../../constant';


const initialState:Required<AmmActivityMapStates>  = {
    ammActivityMap:{},
    status:'UNSET',
    errorMessage:null,
}
const ammActivityMapSlice:Slice = createSlice({
    name: 'ammActivityMap',
    initialState,
    reducers: {
        getAmmActivityMap(state, action:PayloadAction<string | undefined>) {
            state.status = STATUS.PENDING
        },
        getAmmActivityMapStatus(state, action: PayloadAction<AmmActivityMapStates>) {
            // @ts-ignore
            if (action.error) {
                state.status =  STATUS.ERROR
                // @ts-ignore
                state.errorMessage = action.error
            }
            state.ammActivityMap = {...action.payload.ammActivityMap};
            state.status = STATUS.DONE
        },
        statusUnset: state => {
            state.status = STATUS.UNSET
        }

    },
});
export { ammActivityMapSlice };
export const { getAmmActivityMap, getAmmActivityMapStatus, statusUnset } = ammActivityMapSlice.actions
