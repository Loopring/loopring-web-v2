import Decimal from "decimal.js";

export const isNumberStr = (str: string): boolean => {
  return !isNaN(Number(str)) && !isNaN(parseFloat(str));
}
export const strNumDecimalPlacesLessThan = (str: string, length: number): boolean => {
  return isNumberStr(str) && new Decimal(str).decimalPlaces() < length;
}
