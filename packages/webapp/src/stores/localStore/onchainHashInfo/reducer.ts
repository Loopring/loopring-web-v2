import { createSlice, PayloadAction, Slice } from '@reduxjs/toolkit'
import { SliceCaseReducers } from '@reduxjs/toolkit/src/createSlice'
import { ChainHashInfos, TxInfo } from '@loopring-web/common-resources';

const initialState: ChainHashInfos = {
    depositHashes:{},
    // withdrawHashes:{},
}

const OnChainHashInfoSlice: Slice<ChainHashInfos> = createSlice<ChainHashInfos, SliceCaseReducers<ChainHashInfos>, 'chainHashInfos'>({
    name: 'chainHashInfos',
    initialState,
    reducers: {
        clearAll(state: ChainHashInfos, action: PayloadAction<undefined>) {
            state = initialState
        },
        clearDepositHash(state: ChainHashInfos) {
            // state.depositHashes = {}
        },
        clearWithdrawHash(state: ChainHashInfos) {
            // state.withdrawHashes = {}
        },
        updateDepositHash(state: ChainHashInfos, action: PayloadAction<{txInfo: TxInfo,accountAddress:string }>) {
            const {txInfo,accountAddress} = action.payload;
            if(accountAddress && txInfo){
                if(!txInfo.status){
                    txInfo.status= 'pending';
                    txInfo.timestamp = Date.now();
                    state.depositHashes = {
                        [accountAddress]:state.depositHashes[accountAddress]?
                            [
                                ...[txInfo],
                                ...state.depositHashes[accountAddress]] : [txInfo]
                    }
                }else if(state.depositHashes[accountAddress]){
                    const index =  state.depositHashes[accountAddress].findIndex(item=>item.hash === txInfo.hash);
                    if(index !==-1){
                        state.depositHashes[accountAddress][index] = {
                            ...state.depositHashes[accountAddress][index],
                            status:txInfo.status
                        }
                    }
                }

                if(state.depositHashes[accountAddress].length > 5) {
                    state.depositHashes[accountAddress].length = 5
                }
                //  = {
                //     ...state.depositHashes[accountAddress],
                //     [txInfo.timestamp]: txInfo
                // }
                // Reflect.ownKeys( state.depositHashes[accountAddress]).reduce(()=>{
                //
                // },[])
                // Object.keys()

            }
            // state.depositHashes[ txInfo.hash ] = txInfo
        },
        // updateWithdrawHash(state: ChainHashInfos, action: PayloadAction<TxInfo>) {
        //     const txInfo = action.payload
        //     state.withdrawHashes[ txInfo.hash ] = txInfo
        // }
    },
})

export { OnChainHashInfoSlice }
export const {
    clearAll,
    clearDepositHash,
    updateDepositHash,
    clearWithdrawHash,
    updateWithdrawHash
} = OnChainHashInfoSlice.actions
