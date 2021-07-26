import { createSlice, PayloadAction, Slice } from '@reduxjs/toolkit'

import { AccountInfo, ConnectorNames, } from 'loopring-sdk'

import { Lv2Account, } from 'defs/account_defs'
import { AccountStatus } from 'state_machine/account_machine_spec'
import { UserStorage } from 'storage'
import { myLog } from 'utils/log_tools'


const initialState = () => {
  const defaultAccId = process.env.REACT_APP_TEST_ACCOUND_ID ? process.env.REACT_APP_TEST_ACCOUND_ID : UserStorage.getAccountId()
  const defaultApiKey = process.env.REACT_APP_TEST_API_KEY ? process.env.REACT_APP_TEST_API_KEY : UserStorage.getApikey()
  const defaultOwner = process.env.REACT_APP_TEST_OWNER ? process.env.REACT_APP_TEST_OWNER : UserStorage.getAccount()
  const defaultEddsaKey = process.env.REACT_APP_TEST_EDDSA_KEY ? process.env.REACT_APP_TEST_EDDSA_KEY : UserStorage.getEddsakey()

  const defaultStatus = AccountStatus.UNCONNNECTED
  return {
    accAddr: defaultOwner,
    status: defaultStatus,
    accountId: defaultAccId,
    publicKey: {},
    nonce: 0,
    isContractAddress: false,
    apiKey: defaultApiKey,
    eddsaKey: defaultEddsaKey,
    connectName: ConnectorNames.Unknown,
  } as Lv2Account
}

const accountSlice:Slice = createSlice({
  name: 'account',
  initialState: initialState(),
  reducers: {
    reset(state) {
      myLog('try to reset account !!!!!!!!!')
      const initState = initialState()
      Object.assign(state, initState)
      UserStorage.clearWalletConnect()
      UserStorage.clearConnectorName()
    },
    setAccAddr(state, action: PayloadAction<string>) {
      state.accAddr = action.payload
      // UserStorage.setAccount(action.payload)
    },
    setAccountInfo(state, action: PayloadAction<AccountInfo>) {
      state.accAddr = action.payload.owner
      state.accountId = action.payload.accountId
      state.nonce = action.payload.nonce
      state.publicKey = action.payload.publicKey

      // UserStorage.setAccount(state.accAddr)
      // UserStorage.setAccountId(state.accountId)
      
    },
    setApikey(state, action: PayloadAction<string>) {
      state.apiKey = action.payload
      // UserStorage.setApikey(action.payload)
    },
    setAccountStatus(state, action: PayloadAction<AccountStatus>) {
      state.status = action.payload
    },
    setEddsaKey(state, action: PayloadAction<any>) {
      state.eddsaKey = action.payload
      // UserStorage.setEddsakey(action.payload)
    },
    setConnectName(state, action: PayloadAction<ConnectorNames>) {
      state.connectName = action.payload
    },
    setIsContractAddress(state, action: PayloadAction<boolean>) {
      state.isContractAddress = action.payload
    },
  },
})

export const { reset, setAccAddr, setApikey, setConnectName, setAccountInfo, setAccountStatus, setEddsaKey, setIsContractAddress, } = accountSlice.actions
export default accountSlice
