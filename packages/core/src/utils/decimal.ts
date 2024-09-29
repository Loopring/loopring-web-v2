import Decimal from "decimal.js"

export const getOptionalDecimal = (value: any) => {
  try {
    return new Decimal(value)
  } catch (e) {
    return undefined
  }
}