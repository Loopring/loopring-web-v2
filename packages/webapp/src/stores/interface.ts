import { STATUS } from './constant';
import { ErrorObject } from '@loopring-web/common-resources';

export type StateBase = {
  status: keyof typeof STATUS,
  errorMessage?:ErrorObject|null,
}