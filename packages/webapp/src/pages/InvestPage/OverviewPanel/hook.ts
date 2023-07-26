import { makeInvestRow, useInvestTokenTypeMap, useWalletLayer2 } from '@loopring-web/core'
import { RowInvest, useToggle } from '@loopring-web/component-lib'
import { SagaStatus } from '@loopring-web/common-resources'
import React from 'react'

export function useOverview<R extends RowInvest>() {
  const { investTokenTypeMap, status: investTokenTypeMapStatus } = useInvestTokenTypeMap()

  const { status: walletLayer2Status, walletLayer2 } = useWalletLayer2()
  const [filterValue, setFilterValue] = React.useState<string>('')
  const [rawData, setRawData] = React.useState<R[]>([])
  const [filteredData, setFilteredData] = React.useState<R[]>(rawData)
  const [myMapLoading, setMyMapLoading] = React.useState(false)

  const [myRawData, setMyRawData] = React.useState<R[]>([])
  const filterData = (rawData: R[], value: string) => {
    return rawData.filter((item) => {
      const regx = new RegExp(value.toLowerCase(), 'ig')
      return regx.test(item?.token?.symbol ?? '')
    })
  }
  const getFilteredData = React.useCallback(
    (value: string) => {
      setFilterValue(value)
      if (value) {
        const _rawData = [...filterData(rawData, value)]
        setFilteredData(_rawData)
      } else {
        setFilteredData(rawData)
      }
    },
    [filterData, myRawData, rawData, walletLayer2],
  )

  React.useEffect(() => {
    if (investTokenTypeMapStatus === SagaStatus.UNSET) {
      const _rawData = investTokenTypeMap
        ? Object.keys(investTokenTypeMap)
            .reduce((prev, key) => {
              prev.push(makeInvestRow(investTokenTypeMap, key) as R)
              return prev
            }, [] as R[])
            .sort((a, b) => {
              return b.apr[1] - a.apr[1]
            })
        : []
      setRawData(_rawData)
      setFilteredData(
        _rawData.filter((a) => {
          return !!a.apr[1]
        }),
      )
    }
  }, [investTokenTypeMapStatus, investTokenTypeMap])
  const getMyInvestTokenMap = React.useCallback(() => {
    if (walletLayer2 && walletLayer2 !== {}) {
      const _rawData = Object.keys(walletLayer2)
        .reduce((prev, key) => {
          if (investTokenTypeMap && investTokenTypeMap[key]) {
            prev.push(makeInvestRow(investTokenTypeMap, key) as R)
          }
          return prev
        }, [] as R[])
        .sort((a, b) => {
          return b.apr[1] - a.apr[1]
        })
      setMyRawData(_rawData)
    } else {
      setMyRawData([])
    }
    setMyMapLoading(false)
  }, [walletLayer2, investTokenTypeMap])
  React.useEffect(() => {
    if (walletLayer2Status === 'UNSET' && investTokenTypeMapStatus === 'UNSET') {
      setMyMapLoading(true)
      getMyInvestTokenMap()
    }
  }, [walletLayer2Status, investTokenTypeMapStatus])
  return {
    filteredData,
    filterValue,
    getFilteredData,
    myRawData,
    // myFilteredData,
    myMapLoading,
    rawData,
  }
}
