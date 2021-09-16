import { createSlice, PayloadAction, Slice } from '@reduxjs/toolkit'
import { AmmActivityMapStates } from './interface';
import { SagaStatus } from '@loopring-web/common-resources';


const initialState: Required<AmmActivityMapStates> = {
    ammActivityMap: {},
    activityRules: {},
    status: 'PENDING',
    errorMessage: null,
}
const ammActivityMapSlice: Slice = createSlice({
    name: 'ammActivityMap',
    initialState,
    reducers: {
        getAmmActivityMap(state, action: PayloadAction<string | undefined>) {
            state.status = SagaStatus.PENDING
        },
        getAmmActivityMapStatus(state, action: PayloadAction<AmmActivityMapStates>) {
            // @ts-ignore
            if (action.error) {
                state.status = SagaStatus.ERROR
                // @ts-ignore
                state.errorMessage = action.error
            }
            state.ammActivityMap = {...action.payload.ammActivityMap};
            state.activityRules = {...action.payload.activityRules};
            state.status = SagaStatus.DONE
        },
        statusUnset: state => {
            state.status = SagaStatus.UNSET
        }

    },
});
export { ammActivityMapSlice };
export const {getAmmActivityMap, getAmmActivityMapStatus, statusUnset} = ammActivityMapSlice.actions
