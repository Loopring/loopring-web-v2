import { utils } from "ethers"

export const isNumberStr = (str: string): boolean => {
  return !isNaN(Number(str)) && !isNaN(parseFloat(str));
}
