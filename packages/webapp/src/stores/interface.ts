import { STATUS } from './constant';
import { ErrorObject } from '@loopring-web/component-lib/src/static-resource';

export type StateBase = {
  status: keyof typeof STATUS,
  errorMessage?:ErrorObject|null,
}