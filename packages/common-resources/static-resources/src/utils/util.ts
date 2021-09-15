import { BigNumber } from 'bignumber.js'
import { toBig } from 'loopring-sdk'


export function abbreviateNumber(value: number) {
    let newValue = value, result: string;
    const suffixes = ["", "K", "M", "B", "T"];
    let suffixNum = 0;
    while (newValue >= 1000) {
        newValue /= 1000;
        suffixNum++;
    }

    result = newValue.toPrecision(3);

    result += suffixes[ suffixNum ];
    return result;
}

export const getFormattedHash = (hash?: string) => {
    if (!hash) return hash
    const firstSix = hash.slice(0, 6)
    const lastFour = hash.slice(hash.length - 4)
    return `${firstSix}****${lastFour}`
}

export function getShortAddr(address: string):string|'' {
    if (!address || address.trim() === '') {
        // console.log('getShortAddr got empty!')
        return ''
    }
    return address.substr(0, 6) + '...' + address.substr(address.length - 4)
}

/**
 * 
 * @param rawValue 
 * @param precision 
 * @returns 
 */
export const getValuePrecision = (rawValue?: number | string, precision = 6) => {
    if (!rawValue) return '--'
    if (typeof rawValue === 'string') {
        rawValue = Number(rawValue)
    }
    if (rawValue === 0) return 0.00
    if (rawValue >= 1) {
        return rawValue.toFixed(precision)
    }
    return new BigNumber(rawValue).toPrecision(2) as string
}

const getFloatFloor = (value: number | string | undefined, precision: number) => {
    if ((!value  || !Number.isFinite(Number(value)) || Number(value) === 0 ) && !BigNumber.isBigNumber(value)) {
        return '0.00'
    }
    const result = Math.floor(Number(value) * Math.pow(10, precision))
    return result / Math.pow(10, precision)
}

const getFloatCeil = (value: number | string | undefined, precision: number) => {
    if ((!value  || !Number.isFinite(Number(value)) || Number(value) === 0 ) && !BigNumber.isBigNumber(value)) {
        return '0.00'
    }
    let result = Math.ceil(Number(value) * Math.pow(10, precision))
    return result / Math.pow(10, precision)
}

/**
 * @param value
 * @param minDigit  default = 6
 * @param precision  default = 2
 * @param fixed
 * @param notRemoveEndZero default will remove after dot end 0
 * @param floor default .toFixed
 */
export const getValuePrecisionThousand = (value: number | string | BigNumber | undefined, minDigit = 6, precision = 2, fixed?: number, notRemoveEndZero?: boolean, floor?: boolean) => {
    if ((!value  || !Number.isFinite(Number(value)) || Number(value) === 0 ) && !BigNumber.isBigNumber(value)) {
        return  '0.00'
    }
    let result: any = value;
    if (!BigNumber.isBigNumber(result)){
        result = toBig(value);
    }
    if (result.isGreaterThan(1)) {
        // if (minDigit < 3) {
        // } else {
        //     result = Number(value).toLocaleString('en', {
        //         minimumFractionDigits: minDigit
        //     })
        // }
        let formattedValue = null
        if (floor === true) {
            formattedValue = getFloatFloor(result, minDigit)
        }
        if (floor === false) {
            formattedValue = getFloatCeil(result, minDigit)
        }
        if (floor === undefined) {
            formattedValue = result.toFixed(minDigit)
        }

        // result = Number(result.toFixed(minDigit)).toLocaleString('en',{minimumFractionDigits:minDigit})
        result = Number(formattedValue).toLocaleString('en', {minimumFractionDigits: minDigit})
    } else if (result.isLessThanOrEqualTo(1) && fixed ){
        result = result.toFixed(fixed)
    } else if (result.isLessThanOrEqualTo(1)) {
        result = result.toPrecision(precision)
    }
    
    if(result && !notRemoveEndZero ) {
        let [_init, _dot] = result.split('.');
        if (_dot) {
            _dot = _dot.replace(/0+?$/, '');
            if (_dot) {
                result = _init + '.' + _dot ;
            } else {
                result = _init
            }
        }
    }

    return result
}
