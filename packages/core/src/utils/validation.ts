import Decimal from 'decimal.js'
import { BigNumber } from 'ethers'
import { formatUnits, parseUnits } from 'ethers/lib/utils'
import { range } from 'lodash'
const containsLowercase = (str: string) => /^(?=.*[a-z]).*$/.test(str)
const containsLowercaseOnly = (str: string) => /^[a-z]+$/.test(str)
const containsUppercase = (str: string) => /^(?=.*[A-Z]).*$/.test(str)
const containsUppercaseOnly = (str: string) => /^[A-Z]+$/.test(str)
const isValidPasswordLength = (str: string) => /^.{6,20}$/.test(str)
const containsSymbol = (str: string) => /^(?=.*[~`!@#$%^&*()--+={}]).*$/.test(str)
const containsSymbolOnly = (str: string) => /^[~`!@#$%^&*()--+={}]+$/.test(str)
const containsNumber = (str: string) => /^(?=.*[0-9]).*$/.test(str)
const containsNumberOnly = (str: string) => /^[0-9]+$/.test(str)

export const containsRegularCharOnly = (str: string) => {
  return range(str.length).every((index) => {
    const char = str.charAt(index)
    return (
      containsNumberOnly(char) ||
      containsSymbolOnly(char) ||
      containsUppercaseOnly(char) ||
      containsLowercaseOnly(char)
    )
  })
} 

export enum ValidatePasswordErrEnum {
  PASSWORD_LENGTH_ERR = 0,
  NO_LOWERCASE,
  NO_NUMBER,
  CONTAINS_IRREGULAR_CHAR,
}
export const isValid6DigitPasscode = (str: string) => containsNumberOnly(str) && str.length === 6

export const validatePassword = (
  str: string,
): { securityLevel: 'invalid' | 'weak' | 'normal' | 'strong'; err?: ValidatePasswordErrEnum } => {
  if (!isValidPasswordLength(str)) {
    return {
      securityLevel: 'invalid',
      err: ValidatePasswordErrEnum.PASSWORD_LENGTH_ERR,
    }
  }
  if (!containsLowercase(str)) {
    return {
      securityLevel: 'invalid',
      err: ValidatePasswordErrEnum.NO_LOWERCASE,
    }
  }
  if (!containsNumber(str)) {
    return {
      securityLevel: 'invalid',
      err: ValidatePasswordErrEnum.NO_NUMBER,
    }
  }
  if (!containsRegularCharOnly(str)) {
    return {
      securityLevel: 'invalid',
      err: ValidatePasswordErrEnum.CONTAINS_IRREGULAR_CHAR,
    }
  }
  if (!containsUppercase(str) && !containsSymbol(str)) {
    return {
      securityLevel: 'weak',
    }
  } else if (containsUppercase(str) && containsSymbol(str)) {
    return {
      securityLevel: 'strong',
    }
  } else {
    return {
      securityLevel: 'normal',
    }
  }
}

export const isValidateNumberStr = (str:string, decimals: number) => {
  try {
    parseUnits(str, decimals)
    return true
  } catch{
    return false
  }
}