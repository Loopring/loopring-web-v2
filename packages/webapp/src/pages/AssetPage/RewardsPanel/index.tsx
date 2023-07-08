import { WithTranslation, withTranslation } from 'react-i18next'
import {
  EarningsRow,
  RewardsTable,
  Toast,
  ToastType,
  useOpenModals,
} from '@loopring-web/component-lib'
import React from 'react'
import { CLAIM_TYPE, TOAST_TIME, TRADE_TYPE } from '@loopring-web/common-resources'

import {
  StylePaper,
  useAccount,
  useModalData,
  useSystem,
  useToast,
  useUserRewards,
  volumeToCount,
} from '@loopring-web/core'

import { useRewardsTable } from './hook'
import { Box } from '@mui/material'

const RewardsPanel = withTranslation('common')((rest: WithTranslation<'common'>) => {
  const { forexMap } = useSystem()
  const { toastOpen, setToastOpen, closeToast } = useToast()
  const { getUserRewards } = useUserRewards()
  const { updateClaimData } = useModalData()
  const { setShowClaimWithdraw } = useOpenModals()

  const { claimList, showLoading, getRewardsTableList } = useRewardsTable(setToastOpen)
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
        <RewardsTable
          forexMap={forexMap}
          rawData={claimList}
          onItemClick={(item: EarningsRow) => {
            // getUserRewards()
            updateClaimData({
              belong: item.token.value,
              tradeValue: volumeToCount(item.token.value, item.amount),
              balance: volumeToCount(item.token.value, item.amount),
              volume: item.amount,
              tradeType: TRADE_TYPE.TOKEN,
              claimType: CLAIM_TYPE.lrcStaking,
            })
            setShowClaimWithdraw({
              isShow: true,
              claimType: CLAIM_TYPE.lrcStaking,
            })
          }}
          onDetail={(item) => {}}
          showloading={showLoading}
        />
      </Box>
    </StylePaper>
  )
})

export default RewardsPanel
