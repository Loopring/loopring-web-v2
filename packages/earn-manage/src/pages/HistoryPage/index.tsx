import React from 'react'
import { useData, RecordIndex } from './hook'
import { Box, Pagination, Tab, Tabs } from '@mui/material'
import { RowConfig } from '@loopring-web/common-resources'
import { DualTxTable } from './DualTxTable'
import { DualInvestTable } from './DualInvestTable'
import * as sdk from '@loopring-web/loopring-sdk'

export const RecordPage = () => {
  const container = React.useRef(null)
  const [pageSize, setPageSize] = React.useState(1)
  // const [pageSize, setPageSize] = React.useState()

  const [value, setValue] = React.useState(RecordIndex.Transactions)
  const {
    product,
    productTotal,
    getProduct,
    productLoading,
    productPage,
    getTxRowData,
    txRowData,
    txLoading,
    pageTxPage,
    txTotal,
  } = useData()

  const onPageChange = (page: number, fiter = {}) => {
    getProduct({
      page,
      limit: pageSize,
      investmentStatuses: [
        // sdk.Layer1DualInvestmentStatus.DUAL_CANCELED_L1,
        // sdk.Layer1DualInvestmentStatus.DUAL_CANCELED_L2,
        // sdk.Layer1DualInvestmentStatus.DUAL_CONFIRMED,
        sdk.Layer1DualInvestmentStatus.DUAL_RECEIVED,
        sdk.Layer1DualInvestmentStatus.DUAL_SETTLED,
      ],
    })
  }
  const onPageTxChange = (page: number, fiter = {}) => {
    getTxRowData({
      page,
      limit: pageSize,
    })
  }
  const handleTab = (value) => {
    setValue(value)
    switch (value) {
      case RecordIndex.Transactions:
        onPageTxChange(1)
        break
      case RecordIndex.DualInvestment:
        onPageChange(1)
        break
    }
  }
  React.useEffect(() => {
    let height = container?.current?.offsetHeight
    if (height) {
      const pageSize = Math.floor((height - 120) / RowConfig.rowHeight) - 3
      setPageSize(pageSize)
      onPageChange(1)
      onPageTxChange(1)
    }
  }, [container?.current?.offsetHeight])
  return (
    <Box flex={1} marginX={3} display={'flex'} flexDirection={'column'}>
      <Tabs value={value} onChange={(_, value) => handleTab(value)}>
        <Tab value={RecordIndex.Transactions} label={'Transactions'} />
        <Tab value={RecordIndex.DualInvestment} label={'Dual Investment'} />
      </Tabs>
      <Box
        ref={container}
        borderTop={'1px solid var(--color-border)'}
        borderRadius={1}
        padding={2}
        flex={1}
      >
        {value === RecordIndex.Transactions && (
          <>
            <DualTxTable rawData={txRowData} showloading={txLoading} />
            {txTotal > pageSize && onPageTxChange && (
              <Pagination
                color={'primary'}
                count={parseInt(String(txTotal / pageSize)) + (txTotal % pageSize > 0 ? 1 : 0)}
                page={pageTxPage}
                onChange={(_event, value) => {
                  onPageTxChange(Number(value))
                }}
              />
            )}
          </>
        )}
        {value === RecordIndex.DualInvestment && (
          <>
            <DualInvestTable rawData={product} showloading={productLoading} />
            {productTotal > pageSize && onPageChange && (
              <Pagination
                color={'primary'}
                count={
                  parseInt(String(productTotal / pageSize)) + (productTotal % pageSize > 0 ? 1 : 0)
                }
                page={productPage}
                onChange={(_event, value) => {
                  onPageChange(Number(value))
                }}
              />
            )}
          </>
        )}
      </Box>
    </Box>
  )
}
