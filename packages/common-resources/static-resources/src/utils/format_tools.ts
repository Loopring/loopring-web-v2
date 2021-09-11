import * as sdk from 'loopring-sdk'

export function getShowStr(rawVal: string | number | undefined, fixed: number = 2, precision: number = 4) {
    if (rawVal === '0' || rawVal === 0)
        return '0'
    let newVal: any = undefined
    if (rawVal) {
        newVal = typeof (rawVal) === 'number' ? rawVal : parseFloat(rawVal)
        if (newVal > 10) {
            newVal = newVal.toFixed(fixed)
        } else {
            newVal = sdk.toBig(newVal).toPrecision(precision)
        }
    }
    return newVal
}
