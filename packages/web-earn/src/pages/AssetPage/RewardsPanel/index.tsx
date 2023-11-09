import { useTranslation, WithTranslation, withTranslation } from 'react-i18next'
import {
  Button,
  EarningsRow,
  RewardsTable,
  Toast,
  ToastType,
  useOpenModals,
} from '@loopring-web/component-lib'
import React from 'react'
import { CLAIM_TYPE, TOAST_TIME, TRADE_TYPE } from '@loopring-web/common-resources'

import { StylePaper, useModalData, useSystem, useToast } from '@loopring-web/core'

import { useRewardsTable } from './hook'
import { Box } from '@mui/material'
import * as sdk from '@loopring-web/loopring-sdk'

const RewardsPanel = withTranslation('common')(
  ({
    hideAssets,
  }: WithTranslation<'common'> & {
    hideAssets?: boolean
  }) => {
    const { forexMap } = useSystem()
    const { t } = useTranslation('common')
    const { toastOpen, setToastOpen, closeToast } = useToast()
    const { updateClaimData } = useModalData()
    const { setShowClaimWithdraw } = useOpenModals()
    const { claimList, showLoading, errorMessage, getUserRewards } = useRewardsTable(setToastOpen)
    const container = React.useRef<HTMLDivElement>(null)

    return (
      <StylePaper ref={container} flex={1} marginTop={2}>
        <Toast
          alertText={toastOpen?.content ?? ''}
          severity={toastOpen?.type ?? ToastType.success}
          open={toastOpen?.open ?? false}
          autoHideDuration={TOAST_TIME}
          onClose={closeToast}
        />

        <Box className='tableWrapper table-divide-short'>
          {errorMessage ? (
            <Box
              key={'empty'}
              flexDirection={'column'}
              display={'flex'}
              justifyContent={'center'}
              height={'100%'}
              width={'100%'}
              alignItems={'center'}
            >
              <Button
                onClick={() => {
                  getUserRewards()
                }}
                variant={'contained'}
              >
                {t('labelRewardRefresh')}
              </Button>
            </Box>
          ) : (
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
          )}
        </Box>
      </StylePaper>
    )
  },
)

export default RewardsPanel
