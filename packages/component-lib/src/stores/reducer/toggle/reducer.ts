import { createSlice, PayloadAction, Slice } from '@reduxjs/toolkit'
import { SliceCaseReducers } from '@reduxjs/toolkit/src/createSlice'
import { TogglePlayLoad, ToggleState } from './interface'
import { MapChainId } from '@loopring-web/common-resources'

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
  redpacket_exclusive: { enable: true },
  dual_reinvest: { enable: true },
  VaultInvest: { enable: true },
  VaultDustCollector: { enable: true },
  taikoFarming: { enable: true },
  rabbitWithdraw: { enable: true },
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
    updateToggleStatus(state, action: PayloadAction<TogglePlayLoad>) {
      const { account, chainId, ...rest } = action.payload
      // let toggle = {}
      Reflect.ownKeys(state).forEach((key) => {
        if (rest.hasOwnProperty(key) && rest[key.toString()] !== undefined) {
          state[key.toString()] = rest[key.toString()] as any
          // toggle[key.toString()] = rest[key.toString()] as any
        }
      })
      const network = MapChainId[chainId] ?? MapChainId[1]
      let isSupperUser = false,
        list: any = []
      if (
        account &&
        account.accAddress &&
        state?.whiteList &&
        state?.whiteList[network?.toUpperCase()] &&
        state?.whiteList[network?.toUpperCase()]
      ) {
        // const toggle = _.cloneDeep(_toggle)
        const newToggle = {
          ...state,
        }
        state?.whiteList[network?.toUpperCase()].forEach((item: string) => {
          // @ts-ignore
          isSupperUser = item?.superUserAddress?.find(
            (addr: string) => addr?.toLowerCase() == account?.accAddress?.toLowerCase(),
          )
          if (isSupperUser) {
            // @ts-ignore
            item?.superUserFunction?.forEach((fn: string) => {
              const key: string | undefined = Reflect.ownKeys(newToggle).find(
                // @ts-ignore
                (_toggle: string) => _toggle?.toUpperCase() == fn?.toUpperCase(),
              )
              if (key && newToggle[key].enable == false && state[key].reason === 'no view') {
                state[key] = { ...newToggle[key], enable: true, reason: 'whiteList' }
                list.push(key)
              }
            })
          }
        })
      }

      // updateToggleStatus(state, action: PayloadAction<Partial<ToggleState>>) {
      //   const rest = action.payload
      //   Reflect.ownKeys(state).forEach((key) => {
      //     if (rest.hasOwnProperty(key) && rest[key.toString()] !== undefined) {
      //       state[key.toString()] = rest[key.toString()] as any
      //     }
      //   })
      // },
    },
  },
})
export const { updateToggleStatus } = toggleSlice.actions
