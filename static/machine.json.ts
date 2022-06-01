// import { Machine } from "xstate"
// const loopringMachine = Machine(
// @ts-ignore
const test = {
  initial: "UNCONNECTED",
  states: {
    UNCONNECTED: {
      on: {
        Connect: "CONNECTED",
      },
    },
    CONNECTED: {
      on: {
        CheckNoAccount: "NO_ACCOUNT",
        CheckDeposited: "DEPOSITING",
        CheckAccountUpdate: "NOT_ACTIVE",
        CheckAccountReady: "LOCKED",
        Reset: "UNCONNECTED",
      },
    },
    NO_ACCOUNT: {
      on: {
        Deposit: "DEPOSITING",
        Reset: "UNCONNECTED",
      },
    },
    DEPOSITING: {
      on: {
        CheckAccountUpdate: "NOT_ACTIVE",
        Reset: "UNCONNECTED",
      },
    },
    NOT_ACTIVE: {
      on: {
        UpdateAccount: "ACTIVATED",
        Reset: "UNCONNECTED",
      },
    },
    LOCKED: {
      on: {
        Unlock: "ACTIVATED",
        Reset: "UNCONNECTED",
      },
    },
    ACTIVATED: {
      on: {
        Lock: "LOCKED",
        Reset: "UNCONNECTED",
      },
    },
  },
};
// })
