import Decimal from "decimal.js";

export const numberStringListSum = (list: string[]) => 
  list.reduce((pre, cur) => pre.add(cur), new Decimal(0)).toString()