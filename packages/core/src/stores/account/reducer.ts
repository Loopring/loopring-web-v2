import { createSlice, PayloadAction, Slice } from '@reduxjs/toolkit'
import { SliceCaseReducers } from '@reduxjs/toolkit/src/createSlice'
import { Account, AccountState, AccountStatus, SagaStatus } from '@loopring-web/common-resources'
import { ConnectProviders } from '@loopring-web/web3-provider'

const initialState: AccountState = {
  accAddress: '',
  qrCodeUrl: '',
  readyState: AccountStatus.UN_CONNECT,
  accountId: -1,
  apiKey: '',
  eddsaKey: '',
  publicKey: {},
  level: '',
  keySeed: '',
  nonce: undefined,
  keyNonce: undefined,
  connectName: ConnectProviders.Unknown,
  _chainId: 1,
  status: SagaStatus.PENDING,
  errorMessage: null,
  frozen: false,
  __timer__: -1,
  hasUnknownCollection: undefined,
}

const accountSlice: Slice<AccountState> = createSlice<
  AccountState,
  SliceCaseReducers<AccountState>
>({
  name: 'account',
  initialState: initialState,
  reducers: {
    updateAccountStatus(state) {
      state.status = SagaStatus.PENDING
    },
    nextAccountSyncStatus(state) {
      state.status = SagaStatus.PENDING
    },
    changeShowModel(state, action: PayloadAction<{ _userOnModel: boolean | undefined }>) {
      const { _userOnModel } = action.payload
      state._userOnModel = _userOnModel
    },

    nextAccountStatus(state, action: PayloadAction<Partial<Account>>) {
      // @ts-ignore
      if (action.error) {
        state.status = SagaStatus.ERROR
        // @ts-ignore
        state.errorMessage = action.error
      } else {
        const {
          accAddress,
          qrCodeUrl,
          readyState,
          accountId,
          wrongChain,
          level,
          apiKey,
          eddsaKey,
          _chainId,
          keySeed,
          nonce,
          frozen,
          _accountIdNotActive,
          connectName,
          isInCounterFactualStatus,
          isContract1XAddress,
          isContractAddress,
          isCFAddress,
          isContract,
          __timer__,
          // hasUnknownCollection,
        } = action.payload
        if (_accountIdNotActive) {
          state._accountIdNotActive = _accountIdNotActive
        }
        if (accAddress !== undefined) {
          state.accAddress = accAddress
        }

        if (qrCodeUrl !== undefined) {
          state.qrCodeUrl = qrCodeUrl
        }

        if (wrongChain !== undefined) {
          state.wrongChain = wrongChain
        }
        if (readyState) {
          state.readyState = readyState
        }
        if (accountId !== undefined) {
          state.accountId = accountId
        }
        if (level !== undefined) {
          state.level = level
        }
        if (apiKey !== undefined) {
          state.apiKey = apiKey
        }
        if (eddsaKey !== undefined) {
          state.eddsaKey = eddsaKey
        }
        if (connectName !== undefined) {
          state.connectName = connectName
        }
        if (_chainId !== undefined) {
          state._chainId = _chainId
        }
        if (nonce !== undefined) {
          state.nonce = nonce
        }
        if (keySeed !== undefined) {
          state.keySeed = keySeed
        }
        if (__timer__ !== undefined) {
          state.__timer__ = __timer__
        }
        if (action.payload.hasOwnProperty('hasUnknownCollection')) {
          state.hasUnknownCollection = action.payload.hasUnknownCollection
        }
        state.isInCounterFactualStatus = isInCounterFactualStatus
        state.isContract1XAddress = isContract1XAddress
        state.isContractAddress = isContractAddress
        state.isCFAddress = isCFAddress
        state.isContract = isContract
        state.frozen = frozen
        state.status = SagaStatus.DONE
      }
    },
    cleanAccountStatus(
      state,
      _action: PayloadAction<{ shouldUpdateProvider?: boolean | undefined }>,
    ) {
      state.status = SagaStatus.PENDING
    },
    statusUnset: (state) => {
      state.status = SagaStatus.UNSET
    },
  },
})
export default accountSlice
export const {
  updateAccountStatus,
    // restAccountStatus,
  changeShowModel,
  cleanAccountStatus,
  nextAccountStatus,
  statusUnset,
  nextAccountSyncStatus,
} = accountSlice.actions
