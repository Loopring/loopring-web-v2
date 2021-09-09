import { BigNumber } from 'bignumber.js'
/**
 *
 * @param value
 * @param minFractionDigits default = 6
 * @returns
 */
export const getThousandFormattedNumbers = (value: undefined | number, minFractionDigits: number = 6, option?: { isAbbreviate: boolean }) => {
    if (!Number.isFinite(value)) return value
    let result = value !== undefined ? value.toLocaleString('en', {
        minimumFractionDigits: minFractionDigits
    }).replace(/(\.\d+?)0*$/, '$1') : undefined
    return value == undefined ? undefined : option && option.isAbbreviate ? abbreviateNumber(value) : result;


}

export function abbreviateNumber(value: number) {
    let newValue = value, result: string = '';
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
    if (!address || address === undefined || address === null || address.trim() === '') {
        // console.log('getShortAddr got empty!')
        return ''
    }
    const convertAddr = address.substr(0, 6) + '...' + address.substr(address.length - 4)
    return convertAddr
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

/**
 * 
 * @param value 
 * @param precision default = 6
 * @param digit default = 2
 * @returns string
 */
export const getValuePrecisionThousand = (value?: number | string, minDigit = 6, precision = 2) => {
    let result = undefined
    if (!value || !Number.isFinite(Number(value))) {
       return  '0.00'
    }
    if (Number(value) > 1) {
        if (minDigit < 3) {
            result = Number(Number(value).toFixed(minDigit)).toLocaleString('en')
        } else {
            result = Number(value).toLocaleString('en', {
                minimumFractionDigits: minDigit
            })
        }
    }

    if (Number(value) === 0) {
        result = '0.00'
    } else if (Number(value) < 1) {
        result = Number(value).toPrecision(precision)
    } else if( result ) {
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
