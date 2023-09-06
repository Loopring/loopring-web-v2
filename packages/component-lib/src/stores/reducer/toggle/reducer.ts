import { createSlice, PayloadAction, Slice } from '@reduxjs/toolkit'
import { SliceCaseReducers } from '@reduxjs/toolkit/src/createSlice'
import { ToggleState } from './interface'

const initialState: ToggleState = {
  order: { enable: true },
  joinAmm: { enable: true },
  exitAmm: { enable: true },
  transfer: { enable: true },
  transferNFT: { enable: true },
  deposit: { enable: true },
  depositNFT: { enable: true },
  withdraw: { enable: true },
  withdrawNFT: { enable: true },
  mintNFT: { enable: true },
  deployNFT: { enable: true },
  updateAccount: { enable: true },
  collectionNFT: { enable: true },
  WSTETHInvest: { enable: true },
  RETHInvest: { enable: true },
  leverageETHInvest: { enable: true },
  defiInvest: { enable: true },
  dualInvest: { enable: true },
  claim: { enable: true },
  redPacketNFTV1: { enable: true },
  LRCStackInvest: { enable: true },
  BTradeInvest: { enable: true },
  StopLimit: { enable: true },
  send: {
    orbiter: ['ETH'],
  },
  receive: {
    layerSwap: ['ETH', 'LRC', 'USDC'],
    orbiter: ['ETH'],
  },
  CIETHInvest: { enable: true },
  VaultInvest: { enable: true },
  whiteList: {},
  isSupperUser: false as any,
}

export const toggleSlice: Slice<ToggleState> = createSlice<
  ToggleState,
  SliceCaseReducers<ToggleState>
>({
  name: 'toggle',
  initialState: initialState,
  reducers: {
    updateToggleStatus(state, action: PayloadAction<Partial<ToggleState>>) {
      const rest = action.payload
      Reflect.ownKeys(state).forEach((key) => {
        if (rest.hasOwnProperty(key) && rest[key.toString()] !== undefined) {
          state[key.toString()] = rest[key.toString()] as any
        }
      })
    },
  },
})
export const { updateToggleStatus } = toggleSlice.actions
