import { createSlice, PayloadAction, Slice } from '@reduxjs/toolkit'
import { GetTokenMapParams, TokenMapStates } from './interface';
import { STATUS } from '../constant';

const initialState: TokenMapStates<object> = {
    coinMap: {},
    addressIndex: undefined,
    tokenMap: undefined,
    marketMap: undefined,
    idIndex: undefined,
    status: 'UNSET',
    errorMessage: null,
}
const tokenMapSlice: Slice<TokenMapStates<object>> = createSlice({
    name: 'tokenMap',
    initialState,
    reducers: {
        getTokenMap(state, action: PayloadAction<GetTokenMapParams<any>>) {
            state.status = STATUS.PENDING
        },
        getTokenMapStatus(state, action: PayloadAction<TokenMapStates<object>>) {
            // @ts-ignore      console.log(action.type)
            if (action.error) {
                state.status = STATUS.ERROR
                // @ts-ignore
                state.errorMessage = action.error
            }

            const {tokenMap, marketMap, addressIndex, idIndex, coinMap, marketArray, marketCoins} = action.payload;
            if (tokenMap) { state.tokenMap = tokenMap }
            if (marketMap) { state.marketMap = marketMap }
            if (addressIndex) { state.addressIndex = addressIndex }
            if (idIndex) { state.idIndex = idIndex }
            if (coinMap) { state.coinMap = coinMap }
            if (marketArray) { state.marketArray = marketArray }
            if (marketCoins)  { state.marketCoins = marketCoins }
            // if (tokenPairsMap) {state.tokenPairsMap = tokenPairsMap }
            state.status = STATUS.DONE;
        },
        // getTokenPairMap(state, action: PayloadAction<{tokenPairs: TokenPairs }>) {
        //     const {tokenPairs} = action.payload;
        //     const tokenPairsMap =  Reflect.ownKeys(tokenPairs).reduce((prev,key)=>{
        //         // @ts-ignore
        //         return prev[key as string] =  tokenPairs[key as string].tokenList
        //     }, {} )
        //     if (tokenPairsMap) {state.tokenPairsMap = tokenPairsMap }
        //     // state.status = STATUS.PENDING
        // },
        statusUnset: state => {
            state.status = STATUS.UNSET
        }

    },
});
export { tokenMapSlice };
export const {getTokenMap, getTokenMapStatus,getTokenPairMap, statusUnset} = tokenMapSlice.actions;