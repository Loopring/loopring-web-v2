import { toBig } from 'loopring-sdk'

export enum OrderHandling {
    processed = 'processed',
    no_such_order = 'no_such_order',
    too_many_times = 'too_many_times',
}

export const BIG0 = toBig(0)

export const BIG1 = toBig(1)

export const BIG10 = toBig(10)

export const BIG10K = toBig(10000)
