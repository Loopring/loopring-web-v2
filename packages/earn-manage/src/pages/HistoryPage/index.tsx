import React from 'react'
import { useData, RecordIndex } from './hook'
import { Box, Pagination, Tab, Tabs, Divider } from '@mui/material'
import { RowConfig, UNIX_TIMESTAMP_FORMAT } from '@loopring-web/common-resources'
import { DualProductTable, DualTxTable } from '../../compontent'

import * as sdk from '@loopring-web/loopring-sdk'
import { Button, DateRangePicker } from '@loopring-web/component-lib'
import { DateRange } from '@mui/lab'
import moment from 'moment/moment'

export const RecordPage = () => {
  const container = React.useRef<HTMLElement>(null)
  const [pageSize, setPageSize] = React.useState(1)
  const [value, setValue] = React.useState(RecordIndex.Transactions)
  const [filterDate, setFilterDate] = React.useState<DateRange<string | Date>>([null, null])
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
    onExport,
    txTotal,
  } = useData()

  const onPageChange = React.useCallback(
    (page: number, filterData = filterDate) => {
      let start, end
      if (filterData && filterData[0] !== null && filterData[1] !== null) {
        start = Number(moment(filterDate[0]).format(UNIX_TIMESTAMP_FORMAT))
        end = Number(moment(filterDate[1]).format(UNIX_TIMESTAMP_FORMAT))
      }
      getProduct({
        page,
        limit: pageSize,
        investmentStatuses: [sdk.Layer1DualInvestmentStatus.DUAL_SETTLED],
        filter: {
          start,
          end,
        },
      })
    },
    [filterDate],
  )
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
    <Box flex={1} marginX={3} display={'flex'} flexDirection={'column'} position={'relative'}>
      <Tabs
        value={value}
        onChange={(_, value) => handleTab(value)}
        sx={{ zIndex: 99, position: 'relative', width: '50%' }}
      >
        <Tab value={RecordIndex.Transactions} label={'Transactions'} />
        <Tab value={RecordIndex.DualInvestment} label={'Dual Investment'} />
      </Tabs>
      <Divider />

      <Box
        ref={container}
        borderRadius={1}
        padding={2}
        flex={1}
        paddingTop={'52px'}
        marginTop={'-52px'}
        position={'relative'}
        zIndex={30}
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
            <Box
              position={'absolute'}
              right={0}
              top={0}
              height={52}
              zIndex={101}
              display={'flex'}
              flexDirection={'row'}
              alignItems={'center'}
            >
              <DateRangePicker
                value={filterDate}
                onChange={(date: any) => {
                  setFilterDate(date)
                  onPageChange(1, date)
                }}
              />
              <Button
                variant={'outlined'}
                size={'medium'}
                color={'primary'}
                sx={{ marginLeft: 1 }}
                onClick={() => {
                  setFilterDate([null, null])
                  onPageChange(1, [null, null])
                }}
              >
                Reset
              </Button>
            </Box>
            <DualProductTable isDelivering={true} rawData={product} showloading={productLoading} />
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
            <Box display={'flex'} justifyContent={'flex-end'}>
              <Button
                variant={'text'}
                size={'medium'}
                color={'primary'}
                sx={{ marginLeft: 1 }}
                onClick={onExport}
              >
                Export order details
              </Button>
            </Box>
          </>
        )}
      </Box>
    </Box>
  )
}
