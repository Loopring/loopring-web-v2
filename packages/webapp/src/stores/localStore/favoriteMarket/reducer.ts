import { createSlice, PayloadAction, Slice } from '@reduxjs/toolkit'
import { FavoriteMarketStates } from './interface';
import { SliceCaseReducers } from '@reduxjs/toolkit/src/createSlice';

const favoriteMarketSlice: Slice<FavoriteMarketStates> = createSlice<FavoriteMarketStates,SliceCaseReducers<FavoriteMarketStates>,'favoriteMarket'>({
    name: 'favoriteMarket',
    initialState:[],
    reducers: {
        clearAll(state:FavoriteMarketStates, action: PayloadAction<undefined>) {
            state = [];
        },
        removeMarket(state:FavoriteMarketStates, action: PayloadAction<string>) {
            const pair = action.payload
            if (pair) {
                state = state.filter((_pair: string) => {
                    return _pair === pair;
                });
            }

        },
        addMarket(state:FavoriteMarketStates, action: PayloadAction<string>) {
            const pair = action.payload
            if (pair && state.findIndex((_pair: string) => _pair === pair) === -1) {
                state = [...state, pair]
            }
        },
        addMarkets(state:FavoriteMarketStates, action: PayloadAction<string[]>) {
            let pairs = action.payload
            if (pairs.length) {
                state = [...state, ...pairs.reduce((prev, pair) => {
                    if (pair && state.findIndex((_pair: string) => _pair === pair) === -1) {
                        prev.push(pair)
                    }
                    return prev
                }, [] as string[])]


            }
        },

    },
});
export { favoriteMarketSlice };
export const {clearAll, removeMarket, addMarket, addMarkets} = favoriteMarketSlice.actions
