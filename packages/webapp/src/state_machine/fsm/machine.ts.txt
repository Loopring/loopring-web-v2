import { createMachine } from "xstate"

const loopringMachine = createMachine({
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
          Connect: 'CONNECTED',
          Depositing:'DEPOSITED_NO_UPDATE_ACCOUNT',
          Reset:'UNCONNECTED',
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
