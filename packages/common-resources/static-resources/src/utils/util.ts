import { toBig } from '@loopring-web/loopring-sdk'
import BigNumber from 'bignumber.js'

export const DOT = '.'

export function abbreviateNumber(value: number, precision?: number) {
  let newValue = value,
    result: string
  const suffixes = ['', 'K', 'M', 'B', 'T', 'Qa', 'Qi']
  let suffixNum = 0
  while (newValue >= 1000) {
    newValue /= 1000
    suffixNum++
  }

  if (precision) {
    result = newValue.toFixed(precision)
  } else {
    result = newValue.toPrecision(3)
  }

  result += suffixes[suffixNum]
  return result
}

export const getAbbreviateNumber = (value: number | string) => {
  let newValue: any = value
  value = parseInt(toBig(value).toString())
  const formattedValue = toBig(value).toNumber()
  if (formattedValue >= 1000) {
    let suffixes = ['', 'K', 'M', 'B', 'T']
    let suffixNum = Math.floor(('' + formattedValue).length / 3)
    let shortValue: string | number = 0
    for (let precision = 3; precision >= 1; precision--) {
      shortValue = parseFloat(
        (suffixNum !== 0
          ? formattedValue / 1000 ** suffixNum //(Math.pow(1000, suffixNum))
          : formattedValue
        ).toPrecision(precision),
      )
      const dotLessShortValue = (shortValue + '').replace(/[^a-zA-Z 0-9]+/g, '')
      if (dotLessShortValue.length <= 3) {
        break
      }
    }
    if (shortValue && toBig(shortValue).toNumber() % 1 !== 0) {
      shortValue = toBig(shortValue).toNumber()
    }
    newValue = shortValue + suffixes[suffixNum]
  }
  return newValue
}

export const getFormattedHash = (hash?: string) => {
  if (!hash) return hash
  const firstSix = hash.slice(0, 6)
  const lastFour = hash.slice(hash.length - 4)
  return `${firstSix}****${lastFour}`
}

export function getShortAddr(address: string, isMobile?: boolean): string | '' {
  if (!address || address.trim() === '') {
    return ''
  }
  return (isMobile ? '0x' : address.substr(0, 6)) + '...' + address.substr(address.length - 4)
}

const getFloatFloor = (value: number | string | undefined, precision: number) => {
  if (
    (!value || !Number.isFinite(Number(value)) || Number(value) === 0) &&
    !BigNumber.isBigNumber(value)
  ) {
    return '0.00'
  }
  const result = Math.floor(Number(value) * 10 ** precision) // Math.pow(10, precision));
  return result / 10 ** precision //Math.pow(10, precision);
}

const getFloatCeil = (value: number | string | undefined, precision: number) => {
  if (
    (!value || !Number.isFinite(Number(value)) || Number(value) === 0) &&
    !BigNumber.isBigNumber(value)
  ) {
    return '0.00'
  }
  let result = Math.ceil(Number(value) * 10 ** precision) //  Math.pow(10, precision)
  return result / 10 ** precision //Math.pow(10, precision);
}

const addZeroAfterDot = (value: string) => {
  let [_init, _dot] = value.split(DOT)
  if (_dot) {
    _dot = _dot.replace(/0+?$/, '')
    if (_dot) {
      value = _init + DOT + _dot
    } else {
      value = _init
    }
    return value
  }
  return value
}

/**
 * @param value
 * @param minDigit  default = 6
 * @param precision  default = 2
 * @param fixed default = undefined
 * @param notRemoveEndZero default will remove after dot end 0
 * @param option { floor?: boolean, isFait?: boolean, isTrade?: boolean }
 */
export const getValuePrecisionThousand = (
  value: number | string | BigNumber | undefined | BigNumber,
  minDigit = 6,
  precision = 2,
  fixed?: number,
  notRemoveEndZero?: boolean,
  option?: {
    floor?: boolean
    isFait?: boolean
    isTrade?: boolean
    isExponential?: boolean
    isPrice?: boolean
    abbreviate?: 3 | 6 | 9 | 12 | 15 | 18
    isAbbreviate?: true
  },
) => {
  const floor = option?.floor
  const isFait = option?.isFait
  const isTrade = option?.isTrade
  const isExponential = option?.isExponential
  const isPrice = option?.isPrice
  const isAbbreviate = option?.isAbbreviate
  const abbreviate = option?.abbreviate ?? 6
  if (
    (!value || !Number.isFinite(Number(value)) || Number(value) === 0) &&
    !BigNumber.isBigNumber(value)
  ) {
    return '0.00'
  }
  let result: any = value

  if (!BigNumber.isBigNumber(result)) {
    result = toBig(value)
  }

  // integer part exceed 6 digits abbreaviate, otherwise toLocaleString
  if (isAbbreviate === true) {
    let [_init, _dot] = result.toString().split(DOT)
    const integerPartLength = _init.length
    if (integerPartLength > abbreviate) {
      // return getAbbreviateNumber(result)
      return abbreviateNumber(result.toString())
    }
  }

  // remove exponential
  if (isExponential === true) {
    result = toBig(toBig(value).toFixed(20))
  }

  if (isPrice === true) {
    return toBig(toBig(result).toFixed(fixed || 6))
      .toNumber()
      .toLocaleString('en-US', { minimumFractionDigits: fixed || 6 })
  }

  // fait price
  if (isFait === true) {
    if (toBig(result).isGreaterThanOrEqualTo(1)) {
      if (floor === true) {
        result = getFloatFloor(result, 2)
      }
      if (floor === false) {
        result = getFloatCeil(result, 2)
      }
      // fixed 2 decimals
      return toBig(result.toFixed(2))
        .toNumber()
        .toLocaleString('en-US', { minimumFractionDigits: 2 })
    } else {
      if (floor === true) {
        result = getFloatFloor(result, 6)
      }
      if (floor === false) {
        result = getFloatCeil(result, 6)
      }
      return toBig(result).toNumber().toLocaleString('en-US', { minimumFractionDigits: 6 })
    }
  }
  if (isTrade === true) {
    let [_init, _dot] = result.toString().split('.')
    if (_dot && _dot.length > 3) {
      return result.toNumber().toLocaleString('en-US', { minimumFractionDigits: _dot.length })
    } else {
      return result.toNumber().toLocaleString('en-US')
    }
  }
  if (result.isGreaterThan(1)) {
    let formattedValue: any = null
    if (floor === true) {
      formattedValue = getFloatFloor(result, fixed || minDigit)
    }
    if (floor === false) {
      formattedValue = getFloatCeil(result, fixed || minDigit)
    }
    if (floor === undefined) {
      formattedValue = result.toFixed(fixed || minDigit)
    }
    // remain string-number zero
    result = toBig(formattedValue)
      .toNumber()
      .toLocaleString('en-US', { minimumFractionDigits: fixed || minDigit })
  } else if (result.isLessThanOrEqualTo(1)) {
    if (floor === false) {
      result = getFloatCeil(result, fixed || precision).toString()
    } else {
      result = fixed
        ? result.toFixed(fixed)
        : precision
        ? toBig(result).toPrecision(precision)
        : toBig(result).toFixed(0)
    }
  }

  if (result && !notRemoveEndZero) {
    result = addZeroAfterDot(result)
  }

  return result
}

export const IsMobile = {
  Android: function () {
    return navigator.userAgent.match(/Android/i)
  },
  BlackBerry: function () {
    return navigator.userAgent.match(/BlackBerry/i)
  },
  iOS: function () {
    return navigator.userAgent.match(/iPhone|iPad|iPod/i)
  },
  Opera: function () {
    return navigator.userAgent.match(/Opera Mini/i)
  },
  Windows: function () {
    return navigator.userAgent.match(/IEMobile/i) || navigator.userAgent.match(/WPDesktop/i)
  },
  Ethereum: function () {
    // @ts-ignore
    return window?.ethereum && window?.ethereum.isImToken
  },

  any: function () {
    return (
      IsMobile.Android() ||
      IsMobile.BlackBerry() ||
      IsMobile.iOS() ||
      IsMobile.Opera() ||
      IsMobile.Windows() ||
      IsMobile.Ethereum()
    )
  },
}

export const IsWhichWebView = {
  any: function () {
    // @ts-ignore
    if (window?.ethereum.isImToken) {
      return 'isImToken'
    }
    // @ts-ignore
    if (window?.ethereum.isMetaMask) {
      return 'isMetaMask'
    }
  },
}

export function type(value: any) {
  var matches = Object.prototype.toString.call(value).match(/^\[object (\w+?)\]$/) || []

  return (matches[1] || 'undefined').toLowerCase()
}
