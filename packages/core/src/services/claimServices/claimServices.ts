import { Subject } from 'rxjs'
import { CLAIM_TYPE } from '@loopring-web/common-resources'

export enum ClaimCommands {
  Success = 0,
  Failed = 1,
}

const subject = new Subject<{
  status: ClaimCommands
  data?: {
    type: CLAIM_TYPE
    error?: any
  }
}>()
export const claimServices = {
  claimSuccess: ({ type }: { type: CLAIM_TYPE }) => {
    subject.next({
      status: ClaimCommands.Success,
      data: {
        type,
      },
    })
  },
  claimFailed: ({ type, error }: { type: CLAIM_TYPE; error: any }) => {
    subject.next({
      status: ClaimCommands.Failed,
      data: {
        type,
        error,
      },
    })
  },
  onSocket: () => subject.asObservable(),
}
