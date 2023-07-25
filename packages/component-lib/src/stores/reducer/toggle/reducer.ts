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
          state[key.toString()] = rest[key.toString()]
        }
      })
      // for (let key of rest) {
      // }
      // if (order !== undefined) {
      //   state.order = order
      // }

      // Reflect.ownKeys(rest).forEach((key) => {
      //   if (key in rest)rest[key] !== undefined) state[key] = rest[key]
      // })
      // if (joinAmm !== undefined) {
      //   state.joinAmm = joinAmm
      // }
      // if (exitAmm !== undefined) {
      //   state.exitAmm = exitAmm
      // }
      // if (transfer !== undefined) {
      //   state.transfer = transfer
      // }
      // if (transferNFT !== undefined) {
      //   state.transferNFT = transferNFT
      // }
      // if (deposit !== undefined) {
      //   state.deposit = deposit
      // }
      // if (depositNFT !== undefined) {
      //   state.depositNFT = depositNFT
      // }
      // if (withdraw !== undefined) {
      //   state.withdraw = withdraw
      // }
      // if (withdrawNFT !== undefined) {
      //   state.withdrawNFT = withdrawNFT
      // }
      // if (mintNFT !== undefined) {
      //   state.mintNFT = mintNFT
      // }
      // if (deployNFT !== undefined) {
      //   state.deployNFT = deployNFT
      // }
      // if (updateAccount !== undefined) {
      //   state.updateAccount = updateAccount
      // }
      // if (WSTETHInvest !== undefined) {
      //   state.WSTETHInvest = WSTETHInvest
      // }
      // if (RETHInvest !== undefined) {
      //   state.RETHInvest = RETHInvest
      // }
      // if (collectionNFT !== undefined) {
      //   state.collectionNFT = collectionNFT
      // }
      // if (defiInvest !== undefined) {
      //   state.defiInvest = defiInvest
      // }
      // if (claim !== undefined) {
      //   state.claim = claim
      // }
      // if (dualInvest !== undefined) {
      //   state.dualInvest = dualInvest
      // }
      // if (redPacketNFTV1 !== undefined) {
      //   state.redPacketNFTV1 = redPacketNFTV1
      // }
      // if (LRCStackInvest !== undefined) {
      //   state.LRCStackInvest = LRCStackInvest
      // }
      // if (StopLimit !== undefined) {
      //   state.StopLimit = StopLimit
      // }
      // if (BTradeInvest !== undefined) {
      //   state.BTradeInvest = BTradeInvest
      // }
      // if (send !== undefined) {
      //   state.send = send
      // }
      // if (receive !== undefined) {
      //   state.receive = receive
      // }
      // if (CIETHInvest !== undefined) {
      //   state.CIETHInvest = CIETHInvest
      // }
    },
  },
})
export const { updateToggleStatus } = toggleSlice.actions
