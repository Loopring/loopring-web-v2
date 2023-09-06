import { useHistory, useRouteMatch } from 'react-router-dom'

import { Box, Typography } from '@mui/material'
import React from 'react'
import { TradeBtnStatus } from '@loopring-web/common-resources'
import { Button, useSettings } from '@loopring-web/component-lib'
import { useTranslation } from 'react-i18next'
import { useAccountInfo } from '@loopring-web/core'
import * as sdk from '@loopring-web/loopring-sdk'

export const VaultDashBoardPanel = () => {
  const { t } = useTranslation()
  const history = useHistory()
  const { isMobile } = useSettings()

  const {
    joinBtnStatus,
    onJoinPop,
    joinBtnLabel,
    vaultAccountInfo,
    swapBtnStatus,
    onSwapPop,
    swapBtnLabel,
    redeemBtnStatus,
    onRedeemPop,
    redeemBtnLabel,
  } = useAccountInfo()
  return (
    <Box flex={1} display={'flex'} flexDirection={'column'}>
      <Box component={'header'}>
        <Typography component={'h2'}>{t('labelTotalBalance')}</Typography>
        <Box marginLeft={1}>
          <Button
            variant={'outlined'}
            color={'primary'}
            onClick={() => history.push('/vault/transaction')}
          >
            {t('labelTransaction')}
          </Button>
        </Box>
      </Box>
      <Box>
        <Typography>TODO: description</Typography>
        <Box width={isMobile ? '100%' : '65%'}>
          <Box marginY={2}>
            <Button
              size={'medium'}
              onClick={onJoinPop}
              loading={'false'}
              variant={'contained'}
              sx={{ minWidth: 'var(--walletconnect-width)' }}
              disabled={
                joinBtnStatus === TradeBtnStatus.DISABLED ||
                joinBtnStatus === TradeBtnStatus.LOADING
              }
            >
              {joinBtnLabel}
            </Button>
            {[sdk.VaultAccountStatus.IN_STAKING].includes(
              (vaultAccountInfo?.accountStatus ?? '') as sdk.VaultAccountStatus,
            ) && (
              <Button
                size={'medium'}
                onClick={onSwapPop}
                loading={'false'}
                variant={'contained'}
                sx={{ minWidth: 'var(--walletconnect-width)' }}
                disabled={
                  swapBtnStatus === TradeBtnStatus.DISABLED ||
                  swapBtnStatus === TradeBtnStatus.LOADING
                }
              >
                {swapBtnLabel}
              </Button>
            )}
            {[sdk.VaultAccountStatus.IN_STAKING].includes(
              (vaultAccountInfo?.accountStatus ?? '') as sdk.VaultAccountStatus,
            ) && (
              <Button
                size={'medium'}
                onClick={onRedeemPop}
                loading={'false'}
                variant={'contained'}
                sx={{ minWidth: 'var(--walletconnect-width)' }}
                disabled={
                  redeemBtnStatus === TradeBtnStatus.DISABLED ||
                  redeemBtnStatus === TradeBtnStatus.LOADING
                }
              >
                {redeemBtnLabel}
              </Button>
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  )
}
