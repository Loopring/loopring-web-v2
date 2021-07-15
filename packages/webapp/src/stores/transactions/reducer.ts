import { createSlice, PayloadAction } from '@reduxjs/toolkit'

const now = () => new Date().getTime()

export interface SerializableTransactionReceipt {
  to: string
  from: string
  contractAddress: string
  transactionIndex: number
  blockHash: string
  transactionHash: string
  blockNumber: number
  status?: number
}

export interface TransactionDetails {
  hash: string
  approval?: { tokenAddress: string; spender: string }
  summary?: string
  claim?: { recipient: string }
  receipt?: SerializableTransactionReceipt
  lastCheckedBlockNumber?: number
  addedTime: number
  confirmedTime?: number
  from: string
}

export interface TransactionState {
  [chainId: number]: {
    [txHash: string]: TransactionDetails
  }
}

export const initialState: TransactionState = {}

const transactionsSlice = createSlice({
  name: 'transactions',
  initialState,
  reducers: {
    reset(state) {
      Object.assign(state, initialState)
    },
    addTransaction(state: TransactionState, action: PayloadAction<{
      chainId: number, from: string,
      hash: string, approval: any, summary: string, claim: any
    }>) {
      const { chainId, from, hash, approval, summary, claim} = action.payload
      if (state[chainId]?.[hash]) {
        throw Error('the existing TX can\'t be added again')
      }

      const txs = state[chainId] ?? {}
      txs[hash] = {
        hash, 
        approval, 
        summary, 
        claim, 
        from,
        addedTime: now(), 
      }
      // state[chainId] = txs
    },
    clearAllTransactions(state: TransactionState, action: PayloadAction<number>) {
      const chainId = action.payload
      if (!state[chainId]) return
      state[chainId] = {}
    },
    checkedTransaction(state: TransactionState, action: PayloadAction<{chainId: number,
    hash: string, blockNumber: number}>) {
      const { chainId, hash, blockNumber} = action.payload
      const tx = state[chainId]?.[hash]
      if (!tx) {
        return
      }
      if (!tx.lastCheckedBlockNumber) {
        tx.lastCheckedBlockNumber = blockNumber
      } else {
        tx.lastCheckedBlockNumber = Math.max(blockNumber, tx.lastCheckedBlockNumber)
      }
      // state[chainId][hash] = tx
    },
    finalizeTransaction(state: TransactionState, action: PayloadAction<{
      hash: string, chainId: number, receipt: any
    }>) {
      const { chainId, hash, receipt } = action.payload
      
      const tx = state[chainId]?.[hash]
      if (!tx) {
        return
      }
      tx.receipt = receipt
      tx.confirmedTime = now()
    }
  }
}
)

export const { reset, addTransaction, clearAllTransactions, checkedTransaction, finalizeTransaction, } = transactionsSlice.actions
export default transactionsSlice
