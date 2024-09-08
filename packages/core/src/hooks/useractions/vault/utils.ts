import Decimal from 'decimal.js'

export const calcMarinLevel = (
  originMarginLevel: string,
  borrowedAmountInUSD: string,
  moreToBorrowInUSD: string,
) => {
  const originMarginLevelDecimal = new Decimal(originMarginLevel)
  const borrowedAmountDecimal = new Decimal(borrowedAmountInUSD)
  const borrowingAmountDecimal = new Decimal(moreToBorrowInUSD)
  return originMarginLevelDecimal
    .mul(borrowedAmountDecimal)
    .div(new Decimal(borrowedAmountDecimal).add(borrowingAmountDecimal))
    .toString()
}

export const marginLevelType: (marginLevel: string) => 'danger' | 'safe' | 'warning' = (marginLevel: string) => {
  const marginLevelDecimal = new Decimal(marginLevel)
  if (marginLevelDecimal.gte('1.5')) {
    return 'safe'
  } else if (marginLevelDecimal.gte('1.15')) {
    return 'warning'
  } else {
    return 'danger'
  }
}
