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

import { StylePaper, useModalData, useSystem, useToast, volumeToCount } from '@loopring-web/core'

import { useRewardsTable } from './hook'
import { Box } from '@mui/material'
import * as sdk from '@loopring-web/loopring-sdk'

const RewardsPanel = withTranslation('common')(
  ({
    hideAssets,
    ...rest
  }: WithTranslation<'common'> & {
    hideAssets?: boolean
  }) => {
    const { forexMap } = useSystem()
    const { toastOpen, setToastOpen, closeToast } = useToast()
    const { updateClaimData } = useModalData()
    const { setShowClaimWithdraw } = useOpenModals()
    const { claimList, showLoading } = useRewardsTable(setToastOpen)
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
            hideAssets={hideAssets}
            onItemClick={(item: EarningsRow) => {
              // getUserRewards()
              updateClaimData({
                belong: item.token.value,
                tradeValue: item.amountStr?.replaceAll(sdk.SEP, ''),
                balance: item.amountStr?.replaceAll(sdk.SEP, ''),
                volume: item.amount,
                tradeType: TRADE_TYPE.TOKEN,
                claimType: CLAIM_TYPE.allToken,
              })
              setShowClaimWithdraw({
                isShow: true,
                claimType: CLAIM_TYPE.allToken,
              })
            }}
            onDetail={(item) => {}}
            showloading={showLoading}
          />
        </Box>
      </StylePaper>
    )
  },
)

export default RewardsPanel
