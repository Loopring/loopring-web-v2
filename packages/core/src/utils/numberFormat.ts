import Decimal from "decimal.js"

import { BigNumber, utils } from "ethers"
import { CurrencyToTag, PriceTag } from "@loopring-web/common-resources"

export const numberFormat = (number: string | number, format?: {
  fixed?: number,
  fixedRound?: Decimal.Rounding
  thousandthPlace?: boolean,
  showInPercent?: boolean,
  currency?: CurrencyToTag,
  locale?: Intl.LocalesArgument
  tokenSymbol?: string
  removeTrailingZero?: boolean
}) => {
  const numberStr1 = typeof number === 'number' ? number.toFixed() : number
  const numberStr2 =
    format?.fixed !== undefined
      ? format.fixedRound
        ? new Decimal(numberStr1).toFixed(format?.fixed, format.fixedRound)
        : new Decimal(numberStr1).toFixed(format?.fixed)
      : numberStr1
  const numberStr4 = format?.removeTrailingZero
    ? new Decimal(numberStr2).toFixed()
    : numberStr2
  const numberStr5 = format?.thousandthPlace
    ? numberStr4.replace(/(?<!\..*)(\d)(?=(?:\d{3})+(?:\.|$))/g, '$1,')
    : numberStr4
  const suffix = format?.showInPercent ? '%' : format?.tokenSymbol ? ' ' + format.tokenSymbol : ''
  const prefix = format?.currency ? PriceTag[CurrencyToTag[format.currency]] : ''
  return `${prefix}${numberStr5}${suffix}`
}

export const numberFormatThousandthPlace = (number: string | number, format?: {
  fixed?: number,
  showInPercent?: boolean,
  currency?: CurrencyToTag,
  locale?: Intl.LocalesArgument
  tokenSymbol?: string
  removeTrailingZero?: boolean,
  fixedRound?: Decimal.Rounding
}) => {
  return numberFormat(number, {thousandthPlace: true, ...format})
}

export const numberFormatShowInPercent = (number: string | number, format?: {
  fixed?: number,
  thousandthPlace?: boolean,
  currency?: CurrencyToTag,
  locale?: Intl.LocalesArgument
  tokenSymbol?: string
  removeTrailingZero?: boolean,
  fixedRound?: Decimal.Rounding
}) => {
  return numberFormat(number, {showInPercent: true, fixed: 2, ...format})
}

export const fiatNumberDisplay = (number: string | number, currency: CurrencyToTag) => {
  const numberStr = typeof number === 'number' ? number.toString() : number
  const fixed = new Decimal(numberStr).lessThan('1') && new Decimal(numberStr).greaterThan('0') ? 6 : 2
  return numberFormatThousandthPlace(number, {
    fixed,
    currency
  })
}

export const fiatNumberDisplaySafe = (number: string | number, currency: CurrencyToTag) => {
  if (number === undefined || number === null) return undefined
  const numberStr = typeof number === 'number' ? number.toString() : number
  const fixed = new Decimal(numberStr).lessThan('1') && new Decimal(numberStr).greaterThan('0') ? 6 : 2
  return numberFormatThousandthPlace(number, {
    fixed,
    currency
  })
}

export const bigNumberFormat = (number: BigNumber | string, decimals: number, format?: {
  fixed?: number,
  thousandthPlace?: boolean,
  showInPercent?: boolean,
  currency?: CurrencyToTag,
  locale?: Intl.LocalesArgument
  tokenSymbol?: string
  removeTrailingZero?: boolean
}) => {
  const bn = typeof number === 'string' ? BigNumber.from(number) : number
  return numberFormat(utils.formatUnits(bn, decimals), format)
}

export const toPercent = (number: string | number, fixed: number) => {
  return numberFormat(number, {showInPercent: true, fixed: fixed})
}

export const bignumberFix = (number: BigNumber, decimals: number, fix: number, fixRound?: 'FLOOR' | 'CEIL') => {
  const oneUnit = utils.parseUnits('1', decimals - fix)
  const floor = number
    .div(oneUnit)
    .mul(oneUnit)
  const ceil = floor.add(oneUnit)
  const nearCeil = ceil.sub(number).gte(number.sub(floor))
  return fixRound === 'CEIL' ? ceil : fixRound === 'FLOOR' ? floor : nearCeil ? ceil : floor
}