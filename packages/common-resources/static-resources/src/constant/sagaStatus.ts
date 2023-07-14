import { ErrorObject } from '../error'

export enum SagaStatus {
  UNSET = 'UNSET',
  PENDING = 'PENDING',
  ERROR = 'ERROR', // success failed timeout is Done
  DONE = 'DONE', // success failed timeout is Done
}

export type StateBase = {
  status: keyof typeof SagaStatus
  errorMessage?: ErrorObject | null
}
