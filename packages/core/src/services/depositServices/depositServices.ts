import { Subject } from 'rxjs'

export enum DepositCommands {
  DepsitERC20 = 0,
  DepsitNFT = 1,
}

const subject = new Subject<{
  status: DepositCommands
  data?: {
    uniqueId?: string
    [key: string]: any
  }
}>()
export const depositServices = {
  depositERC20: () => {
    subject.next({
      status: DepositCommands.DepsitERC20,
      data: {
        emptyData: false,
      },
    })
  },
  depositNFT: () => {
    subject.next({
      status: DepositCommands.DepsitNFT,
      data: {
        emptyData: false,
      },
    })
  },
  onSocket: () => subject.asObservable(),
}
