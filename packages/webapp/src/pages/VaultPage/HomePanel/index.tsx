import { Box, Container } from '@mui/material'
import React from 'react'
import { SoursURL, TradeBtnStatus } from '@loopring-web/common-resources'
import { BoxBannerStyle, Button, useSettings } from '@loopring-web/component-lib'
import { useTranslation } from 'react-i18next'
import * as sdk from '@loopring-web/loopring-sdk'
import { useAccountInfo } from '@loopring-web/core'

export const VaultHomePanel = () => {
  const { isMobile } = useSettings()
  const { t } = useTranslation()
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
    borrowBtnStatus,
    onBorrowPop,
    borrowBtnLabel,
    repayBtnStatus,
    onRepayPop,
    repayBtnLabel,
  } = useAccountInfo()

  return (
    <Box flex={1} display={'flex'} flexDirection={'column'}>
      <BoxBannerStyle
        className={isMobile ? 'mobile' : ''}
        backGroundUrl={SoursURL + '/images/any.webp'}
        direction={'right'}
      >
        <Container
          maxWidth='lg'
          style={{
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
          }}
        >
          <Box className={'bg'} marginY={3} display={'flex'}>
            <Box width={isMobile ? '100%' : '65%'}>
              <Box marginY={2} display={'flex'} flexDirection={'ro'}>
                <Box marginX={1} marginY={1}>
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
                </Box>
                <Box marginX={1} marginY={1}>
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
          </Box>
        </Container>
      </BoxBannerStyle>
    </Box>
  )
}
