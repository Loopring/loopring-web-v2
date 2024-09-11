import Decimal from 'decimal.js'

export const calcMarinLevel = (
  originMarginInUSD: string,
  originEquityInUSD: string,
  originDebtInUSD: string,
  moreToBorrowInUSD: string,
  moreToCollateralizeInUSD: string,
) => {
  const originMarginDecimal = new Decimal(originMarginInUSD)
  const originEquityDecimal = new Decimal(originEquityInUSD)
  const moreToBorrowDecimal = new Decimal(moreToBorrowInUSD ?? '0')
  const moreToCollateralizeDecimal = new Decimal(moreToCollateralizeInUSD ?? '0')
  const originDebtDecimal = new Decimal(originDebtInUSD ?? '0')
  if (originEquityDecimal.add(originDebtDecimal).add(moreToBorrowDecimal).eq('0')) {
    return '999'
  } else {
    return originMarginDecimal
      .add(moreToCollateralizeDecimal)
      .div(originDebtDecimal.sub(originEquityDecimal).add(moreToBorrowDecimal))
      .add('1')
      .toString()
  }
}

export const marginLevelType: (marginLevel: string) => 'danger' | 'safe' | 'warning' = (
  marginLevel: string,
) => {
  const marginLevelDecimal = new Decimal(marginLevel)
  if (marginLevelDecimal.gte('1.5')) {
    return 'safe'
  } else if (marginLevelDecimal.gte('1.15')) {
    return 'warning'
  } else {
    return 'danger'
  }
}
