import { StateBase } from '@loopring-web/common-resources'
import * as sdk from '@loopring-web/loopring-sdk'

export type ContactType = Pick<sdk.GetContactsResponse, 'contacts'>['contacts'][0]
export type ContactsState = Pick<sdk.GetContactsResponse, 'contacts'> & { __timer__: NodeJS.Timeout | -1 } & StateBase

