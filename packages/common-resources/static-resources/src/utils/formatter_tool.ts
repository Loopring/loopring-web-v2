import * as sdk from 'loopring-sdk'

export function getShowStr(rawVal: string | number | undefined, fixed: number = 2, precision: number = 4) {
    if (rawVal === '0' || rawVal === 0)
        return '0'
    let minimumReceived: any = undefined
    if (rawVal) {
        minimumReceived = typeof (rawVal) === 'number' ? rawVal : parseFloat(rawVal)
        if (minimumReceived > 10) {
            minimumReceived = minimumReceived.toFixed(fixed)
        } else {
            minimumReceived = sdk.toBig(minimumReceived).toPrecision(precision)
        }
    }
    return minimumReceived
}
