import { Machine } from "xstate"
const loopringMachine = Machine({
  initial: 'UNCONNECTED',
  states:{
    UNCONNECTED:{
      on:{
        Connect:'CONNECTED'
      }
    },
    CONNECTED:  {
      on:{
        CheckNoAccount:'NO_ACCOUNT',
        CheckDeposited:'DEPOSITED_NO_UPDATE_ACCOUNT',
        CheckAccountReady:'LOCKED',
        Reset:'UNCONNECTED',
      }
    },
    NO_ACCOUNT:{
      on:{
        Depositing:'DEPOSITED_NO_UPDATE_ACCOUNT',
        Disconnect:'UNCONNECTED',
      }
    },
    DEPOSITED_NO_UPDATE_ACCOUNT:  {
      on:{
        UpdateAccount:'ACTIVATED',
        Reset:'UNCONNECTED',
      }
    },
    LOCKED:{
      on:{
        Unlock:'ACTIVATED',
        Reset:'UNCONNECTED',
      }
    },
    ACTIVATED:{
      on:{
        Lock:'LOCKED',
        Reset:'UNCONNECTED',
      }
    }
  }
})