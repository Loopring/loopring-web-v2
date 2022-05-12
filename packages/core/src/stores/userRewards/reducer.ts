import { createSlice, PayloadAction, Slice } from "@reduxjs/toolkit";
import { UserRewardsStates } from "./interface";
import { SagaStatus } from "@loopring-web/common-resources";

const initialState: UserRewardsStates = {
  userRewardsMap: undefined,
  status: "PENDING",
  errorMessage: null,
  __timer__: -1,
};
const userRewardsMapSlice: Slice<UserRewardsStates> = createSlice({
  name: "userRewardsMap",
  initialState,
  reducers: {
    getUserRewards(state, action: PayloadAction<undefined>) {
      state.status = SagaStatus.PENDING;
    },
    resetUserRewards(state, action: PayloadAction<undefined>) {
      state.status = SagaStatus.PENDING;
    },
    getUserRewardsStatus(state, action: PayloadAction<UserRewardsStates>) {
      // @ts-ignore
      if (action.error) {
        state.status = SagaStatus.ERROR;
        // @ts-ignore
        state.errorMessage = action.error;
      }
      state.userRewardsMap = action.payload.userRewardsMap; //{...state.userRewardsMap, ...action.payload.userRewardsMap};
      if (action.payload.__timer__) {
        state.__timer__ = action.payload.__timer__;
      }
      state.status = SagaStatus.DONE;
    },
    statusUnset: (state) => {
      state.status = SagaStatus.UNSET;
    },
  },
});
export { userRewardsMapSlice };
export const {
  getUserRewards,
  resetUserRewards,
  getUserRewardsStatus,
  statusUnset,
} = userRewardsMapSlice.actions;
