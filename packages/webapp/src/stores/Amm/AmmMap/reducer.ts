import { createSlice, PayloadAction, Slice } from '@reduxjs/toolkit'
import { AmmMapStates, GetAmmMapParams } from './interface';
import { STATUS } from '../../constant';



const initialState: Required<AmmMapStates<object, object>> = {
    ammMap: undefined,
    __timer__: -1,
    status: 'UNSET',
    errorMessage: null,
}
const ammMapSlice: Slice = createSlice({
    name: 'ammMap',
    initialState,
    reducers: {
        getAmmMap(state, action: PayloadAction<GetAmmMapParams>) {
            state.status = STATUS.PENDING
        },
        getAmmMapStatus(state, action: PayloadAction<AmmMapStates<any, any>>) {
            // @ts-ignore
            if (action.error) {
                state.status = STATUS.ERROR
                // @ts-ignore
                state.errorMessage = action.error
            }
            const {ammMap, __timer__} = action.payload
            if (ammMap) {state.ammMap = ammMap;}
            if (__timer__) {state.__timer__ = __timer__;}
            state.status = STATUS.DONE
        },
        updateRealTimeAmmMap(state, action: PayloadAction<undefined>) {
            state.status = STATUS.PENDING
        },
        statusUnset: state => {
            state.status = STATUS.UNSET
        }
    },
});
export { ammMapSlice };
export const {getAmmMap, getAmmMapStatus, statusUnset, updateRealTimeAmmMap} = ammMapSlice.actions
