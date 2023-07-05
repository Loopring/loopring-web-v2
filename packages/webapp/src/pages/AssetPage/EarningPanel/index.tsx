import { WithTranslation, withTranslation } from 'react-i18next'
import { EarningsTable, Toast, ToastType } from '@loopring-web/component-lib'
import React from 'react'
import { TOAST_TIME } from '@loopring-web/common-resources'
import { StylePaper, useAccount, useSystem, useToast } from '@loopring-web/core'

import { useEarningsTable } from './hook'
import { Box } from '@mui/material'

const EarningsPanel = withTranslation('common')((rest: WithTranslation<'common'>) => {
  const { forexMap } = useSystem()
  const { toastOpen, setToastOpen, closeToast } = useToast()
  const { claimList, showLoading, getEarningsTableList } = useEarningsTable(setToastOpen)
  const {
    account: { accAddress, accountId },
  } = useAccount()

  const { t } = rest
  const container = React.useRef<HTMLDivElement>(null)

  return (
    <StylePaper ref={container} flex={1}>
      <Toast
        alertText={toastOpen?.content ?? ''}
        severity={toastOpen?.type ?? ToastType.success}
        open={toastOpen?.open ?? false}
        autoHideDuration={TOAST_TIME}
        onClose={closeToast}
      />

      <Box className='tableWrapper table-divide-short'>
        <EarningsTable
          forexMap={forexMap}
          rawData={claimList}
          onItemClick={(item) => {
          }}
          onDetail={(item) => {
          }}
          getList={getEarningsTableList}
          showloading={showLoading}
        />
      </Box>
    </StylePaper>
  )
})

export default EarningsPanel
