import { createSlice, PayloadAction, Slice } from '@reduxjs/toolkit'
import { AmmMapStates, GetAmmMapParams } from './interface';
import { SagaStatus } from '@loopring-web/common-resources';


const initialState: Required<AmmMapStates<object, object>> = {
    ammMap: undefined,
    __timer__: -1,
    status: 'PENDING',
    errorMessage: null,
}
const ammMapSlice: Slice = createSlice({
    name: 'ammMap',
    initialState,
    reducers: {
        getAmmMap(state, action: PayloadAction<GetAmmMapParams>) {
            state.status = SagaStatus.PENDING
        },
        getAmmMapStatus(state, action: PayloadAction<AmmMapStates<any, any>>) {
            // @ts-ignore
            if (action.error) {
                state.status = SagaStatus.ERROR
                // @ts-ignore
                state.errorMessage = action.error
            }
            const {ammMap, __timer__} = action.payload
            if (ammMap) {
                state.ammMap = ammMap;
            }
            if (__timer__) {
                state.__timer__ = __timer__;
            }
            state.status = SagaStatus.DONE
        },
        updateRealTimeAmmMap(state, action: PayloadAction<undefined>) {
            state.status = SagaStatus.PENDING
        },
        statusUnset: state => {
            state.status = SagaStatus.UNSET
        }
    },
});
export { ammMapSlice };
export const {getAmmMap, getAmmMapStatus, statusUnset, updateRealTimeAmmMap} = ammMapSlice.actions
