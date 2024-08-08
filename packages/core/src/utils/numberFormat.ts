import Decimal from "decimal.js"

import { BigNumber, utils } from "ethers"
import { CurrencyToTag, PriceTag } from "@loopring-web/common-resources"
import {  } from "@loopring-web/loopring-sdk"

export const numberFormat = (number: string | number, format?: {
  fixed?: number,
  thousandthPlace?: boolean,
  showInPercent?: boolean,
  currency?: Currency,
  locale?: Intl.LocalesArgument
  tokenSymbol?: string
  removeTrailingZero?: boolean
}) => {
  const numberStr1 = typeof number === 'number' ? number.toString() : number
  const numberStr3 = format?.fixed !== undefined
    ? new Decimal(numberStr1).toFixed(format?.fixed)
    : numberStr1
  const numberStr4 = format?.removeTrailingZero
    ? new Decimal(numberStr3).toString()
    : numberStr3
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
  currency?: Currency,
  locale?: Intl.LocalesArgument
  tokenSymbol?: string
  removeTrailingZero?: boolean
}) => {
  return numberFormat(number, {thousandthPlace: true, ...format})
}

export const numberFormatShowInPercent = (number: string | number, format?: {
  fixed?: number,
  thousandthPlace?: boolean,
  currency?: Currency,
  locale?: Intl.LocalesArgument
  tokenSymbol?: string
  removeTrailingZero?: boolean
}) => {
  return numberFormat(number, {showInPercent: true, fixed: 2, ...format})
}

export const fiatNumberDisplay = (number: string | number, currency: CurrencyToTag) => {
  const numberStr = typeof number === 'number' ? number.toString() : number
  const fixed = new Decimal(numberStr).lessThan('1') ? 6 : 2
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