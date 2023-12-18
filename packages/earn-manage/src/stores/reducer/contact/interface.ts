import { StateBase } from '@loopring-web/common-resources'
import * as sdk from '@loopring-web/loopring-sdk'

/**
 * @contactMap is only update
 */
export type ContactStates = {
  contactMap: any | undefined
} & StateBase
