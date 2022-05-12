import { createSlice, PayloadAction, Slice } from "@reduxjs/toolkit";
import { FavoriteMarketStates } from "./interface";
import { SliceCaseReducers } from "@reduxjs/toolkit/src/createSlice";

const favoriteMarketSlice: Slice<FavoriteMarketStates> = createSlice<
  FavoriteMarketStates,
  SliceCaseReducers<FavoriteMarketStates>,
  "favoriteMarket"
>({
  name: "favoriteMarket",
  initialState: [],
  reducers: {
    clearAll(state: FavoriteMarketStates, action: PayloadAction<undefined>) {
      state.length = 0;
    },
    removeMarket(state: FavoriteMarketStates, action: PayloadAction<string>) {
      const pair = action.payload;
      if (pair && state.includes(pair)) {
        const index = state.findIndex((_pair) => _pair === pair);
        state.splice(index, 1);
      }
    },
    addMarket(state: FavoriteMarketStates, action: PayloadAction<string>) {
      const pair = action.payload;
      if (pair && state.findIndex((_pair: string) => _pair === pair) === -1) {
        state.push(pair);
      }
    },
    addMarkets(state: FavoriteMarketStates, action: PayloadAction<string[]>) {
      const pairs = action.payload;
      if (pairs.length) {
        pairs.forEach((pair) => {
          if (
            pair &&
            state.findIndex((_pair: string) => _pair === pair) === -1
          ) {
            state.push(pair);
          }
        });
      }
    },
  },
});
export { favoriteMarketSlice };
export const { clearAll, removeMarket, addMarket, addMarkets } =
  favoriteMarketSlice.actions;
