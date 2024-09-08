// import Decimal from 'decimal.js'

// export const calcMarinLevel = (
//   originMarginLevel: string,
//   borrowedAmountInUSD: string,
//   moreToBorrowInUSD: string,
// ) => {
//   const originMarginLevelDecimal = new Decimal(originMarginLevel)
//   const borrowedAmountDecimal = new Decimal(borrowedAmountInUSD)
//   const borrowingAmountDecimal = new Decimal(moreToBorrowInUSD)
//   return originMarginLevelDecimal
//     .mul(borrowedAmountDecimal)
//     .div(new Decimal(borrowedAmountDecimal).add(borrowingAmountDecimal))
//     .toString()
// }
