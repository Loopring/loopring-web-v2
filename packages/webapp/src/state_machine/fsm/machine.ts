import { Machine } from "xstate"
import { AccountStatus } from '../account_machine_spec'

const appMachine = Machine({
  initial: AccountStatus.UNCONNNECTED,
  states: {
    UNCONNNECTED: {
      on: {
        Connecting: AccountStatus.CONNECTED,
        Reset: AccountStatus.UNCONNNECTED,
      }
    },
    CONNECTED: {
      on: {
        HasPubkey: AccountStatus.LOCKED,
        HasNoPubkey: AccountStatus.UNACTIVATED,
        ErrorResponse: AccountStatus.NOACCOUNT,
        Reset: AccountStatus.UNCONNNECTED,
      }
    },
    NOACCOUNT: {
      on: {
        ErrorResponse: AccountStatus.NOACCOUNT,
        Reconnect: AccountStatus.CONNECTED,
        Reset: AccountStatus.UNCONNNECTED,
      }
    },
    DEPOSITING: {
      on: {
        FinishDeposit: AccountStatus.DEPOSIT_TO_CONFIREM,
        Reset: AccountStatus.UNCONNNECTED,
      }
    },
    DEPOSIT_TO_CONFIREM: {
      on: {
        HasPubkey: AccountStatus.ACTIVATED,
        HasNoPubkey: AccountStatus.DEPOSIT_TO_CONFIREM,
        ErrorResponse: AccountStatus.DEPOSIT_TO_CONFIREM,
        Reset: AccountStatus.UNCONNNECTED,
      }
    },
    UNACTIVATED: {
      on: {
        IsSmartWallet: AccountStatus.ARPROVING,
        Reset: AccountStatus.UNCONNNECTED,
      }
    },
    ARPROVING: {
      on: {
        ApproveSubmit: AccountStatus.APPROV_TO_CONFIRM,
        Reset: AccountStatus.UNCONNNECTED,
      }
    },
    APPROV_TO_CONFIRM: {
      on: {
        ApproveConfirmed: AccountStatus.ACTIVATED,
        Reset: AccountStatus.UNCONNNECTED,
      }
    },
    LOCKED: {
      on: {
        Unlock: AccountStatus.ACTIVATED,
        Reset: AccountStatus.UNCONNNECTED,
      }
    },
    ACTIVATED: {
      on: {
        Lock: AccountStatus.LOCKED,
        Reset: AccountStatus.UNCONNNECTED,
      }
    },
  }
})

export default appMachine
