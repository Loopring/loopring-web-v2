import { useHistory } from 'react-router-dom'

import { Box, Container, Typography, Grid } from '@mui/material'
import React from 'react'
import { MarginLevelIcon, TradeBtnStatus } from '@loopring-web/common-resources'
import { Button, useSettings } from '@loopring-web/component-lib'
import { useTranslation } from 'react-i18next'
import { VaultAccountInfoStatus } from '@loopring-web/core'
import * as sdk from '@loopring-web/loopring-sdk'

export const VaultDashBoardPanel = ({
  vaultAccountInfo: {
    joinBtnStatus,
    joinBtnLabel,
    onJoinPop,
    vaultAccountInfo,
    swapBtnStatus,
    swapBtnLabel,
    onSwapPop,
    redeemBtnStatus,
    onRedeemPop,
    redeemBtnLabel,
    borrowBtnStatus,
    onBorrowPop,
    borrowBtnLabel,
    repayBtnStatus,
    onRepayPop,
    repayBtnLabel,
  },
}: {
  vaultAccountInfo: VaultAccountInfoStatus
}) => {
  const { t } = useTranslation()
  const history = useHistory()
  const { isMobile } = useSettings()

  return (
    <Box flex={1} display={'flex'} flexDirection={'column'}>
      <Container
        maxWidth='lg'
        style={{
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
        }}
      >
        <Grid container spacing={2} display={'flex'} alignContent={'stretch'}>
          <Grid item md={8} xs={12}>
            <Grid
              border={'var(--color-border)'}
              borderRadius={1.5}
              display={'flex'}
              flexDirection={'column'}
            >
              <Box display={'flex'} flexDirection={'row'} justifyContent={'space-between'}>
                <Box>
                  <Typography component={'h4'} variant={'body1'} color={'textSecondary'}>
                    {t('labelVaultTotalBalance')}
                  </Typography>
                  <Typography component={'span'} variant={'h4'} color={'textSecondary'}>
                    {}
                  </Typography>
                </Box>
                <Box>
                  <Typography component={'h4'} variant={'body1'} color={'textSecondary'}>
                    {t('labelVaultOpenDate')}
                  </Typography>
                  <Typography component={'span'} variant={'h4'} color={'textSecondary'}>
                    {}
                  </Typography>
                </Box>
              </Box>
              <Box
                display={'flex'}
                flexWrap={'nowrap'}
                flexDirection={'row'}
                justifyContent={'space-between'}
              >
                <Box>
                  <Typography component={'h4'} variant={'body1'} color={'textSecondary'}>
                    {t('labelVaultMarginLevel')}
                  </Typography>
                  <Typography component={'span'} variant={'h4'} color={'textSecondary'}>
                    <MarginLevelIcon />
                  </Typography>
                </Box>
                <Box>
                  <Typography component={'h4'} variant={'body1'} color={'textSecondary'}>
                    {t('labelVaultTotalCollateral')}
                  </Typography>
                  <Typography
                    component={'span'}
                    variant={'h4'}
                    color={'textSecondary'}
                  ></Typography>
                </Box>
                <Box>
                  <Typography component={'h4'} variant={'body1'} color={'textSecondary'}>
                    {t('labelVaultTotalDebt')}
                  </Typography>
                  <Typography
                    component={'span'}
                    variant={'h4'}
                    color={'textSecondary'}
                  ></Typography>
                </Box>
                <Box>
                  <Typography component={'h4'} variant={'body1'} color={'textSecondary'}>
                    {t('labelVaultTotalEquity')}
                  </Typography>
                  <Typography
                    component={'span'}
                    variant={'h4'}
                    color={'textSecondary'}
                  ></Typography>
                </Box>
                <Box>
                  <Typography component={'h4'} variant={'body1'} color={'textSecondary'}>
                    {t('labelVaultProfit')}
                  </Typography>
                  <Typography
                    component={'span'}
                    variant={'h4'}
                    color={'textSecondary'}
                  ></Typography>
                </Box>
              </Box>
            </Grid>
            <Grid item md={4} xs={12}>
              <Box border={'var(--color-border)'} borderRadius={1.5}></Box>
            </Grid>
          </Grid>
        </Grid>
        <Box component={'header'}>
          <Typography component={'h2'}>{t('labelTotalBalance')}</Typography>
          <Box marginLeft={1}>
            <Button
              variant={'outlined'}
              color={'primary'}
              onClick={() => history.push('/vaultLayer2/transaction')}
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
            <Box marginX={1} marginY={1}>
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
            <Box marginX={1} marginY={1}>
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
            <Box marginX={1} marginY={1}>
              {[sdk.VaultAccountStatus.IN_STAKING].includes(
                (vaultAccountInfo?.accountStatus ?? '') as sdk.VaultAccountStatus,
              ) && (
                <Button
                  size={'medium'}
                  onClick={onBorrowPop}
                  loading={'false'}
                  variant={'contained'}
                  sx={{ minWidth: 'var(--walletconnect-width)' }}
                  disabled={
                    borrowBtnStatus === TradeBtnStatus.DISABLED ||
                    borrowBtnStatus === TradeBtnStatus.LOADING
                  }
                >
                  {borrowBtnLabel}
                </Button>
              )}
            </Box>
            <Box marginX={1} marginY={1}>
              {[sdk.VaultAccountStatus.IN_STAKING].includes(
                (vaultAccountInfo?.accountStatus ?? '') as sdk.VaultAccountStatus,
              ) && (
                <Button
                  size={'medium'}
                  onClick={onRepayPop}
                  loading={'false'}
                  variant={'contained'}
                  sx={{ minWidth: 'var(--walletconnect-width)' }}
                  disabled={
                    repayBtnStatus === TradeBtnStatus.DISABLED ||
                    repayBtnStatus === TradeBtnStatus.LOADING
                  }
                >
                  {repayBtnLabel}
                </Button>
              )}
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
  )
}
