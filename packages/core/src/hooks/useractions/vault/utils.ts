import Decimal from 'decimal.js'

export const calcMarinLevel = (
  originMarginInUSD: string,
  originDebtInUSD: string,
  totalBalanceInUSD: string,
  moreToBorrowInUSD: string,
  moreToCollateralizeInUSD: string,
) => {
  const originMarginDecimal = new Decimal(originMarginInUSD)
  const totalBalanceInUSDDecimal = new Decimal(totalBalanceInUSD)
  const moreToBorrowDecimal = new Decimal(moreToBorrowInUSD ?? '0')
  const moreToCollateralizeDecimal = new Decimal(moreToCollateralizeInUSD ?? '0')
  const originDebtDecimal = new Decimal(originDebtInUSD ?? '0')
  if (originDebtDecimal.add(moreToBorrowDecimal).eq('0')) {
    return '999'
  } else {
    return Decimal.min(
      originMarginDecimal
        .add(moreToCollateralizeDecimal)
        .add(totalBalanceInUSDDecimal)
        .add(moreToBorrowDecimal)
        .div(originDebtDecimal.add(moreToBorrowDecimal)),
      '999',
    ).toString()
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
