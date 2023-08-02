import { confirmation, useStakeTradeJOIN, useToast } from '@loopring-web/core'

import {
  Button,
  DeFiSideWrap,
  LoadingBlock,
  Toast,
  ToastType,
  useSettings,
  useToggle,
} from '@loopring-web/component-lib'
import { Box, Typography } from '@mui/material'
import React from 'react'
import { BackIcon, SoursURL, TOAST_TIME } from '@loopring-web/common-resources'
import { useTranslation } from 'react-i18next'
import { useHistory } from 'react-router-dom'
import { StyleWrapper } from '../DeFiPanel/'
import { ErrorPage } from '@loopring-web/web-bridge/src/pages/ErrorPage'
import { MaxWidthContainer } from '..'
import { useTheme } from '@emotion/react'

export const StackTradePanel = ({
  setConfirmedLRCStakeInvestInvest,
  isJoin = true,
  symbol = 'LRC',
}: {
  symbol?: string
  setConfirmedLRCStakeInvestInvest: (state: { show: boolean; confirmationNeeded: boolean }) => void
  isJoin?: boolean
}) => {
  const {
    confirmation: { confirmedLRCStakeInvest },
  } = confirmation.useConfirmation()
  const { toggle } = useToggle()

  const { toastOpen, setToastOpen, closeToast } = useToast()
  const { t } = useTranslation()
  const history = useHistory()
  const { stakeWrapProps } = useStakeTradeJOIN({ setToastOpen, symbol })

  const { isMobile } = useSettings()

  const styles = isMobile ? { flex: 1 } : { width: 'var(--swap-box-width)' }
  React.useEffect(() => {
    setConfirmedLRCStakeInvestInvest({ show: !confirmedLRCStakeInvest, confirmationNeeded: true })
  }, [])
  const theme = useTheme()
  return (
    <>
      <Toast
        alertText={toastOpen?.content ?? ''}
        severity={toastOpen?.type ?? ToastType.success}
        open={toastOpen?.open ?? false}
        autoHideDuration={TOAST_TIME}
        onClose={closeToast}
      />
      {toggle?.LRCStackInvest.enable ? (
        <Box display={'flex'} flexDirection={'column'} flex={1} marginBottom={2}>
          {false && (
            <Box
              marginBottom={2}
              display={'flex'}
              justifyContent={'space-between'}
              alignItems={isMobile ? 'left' : 'center'}
              flexDirection={isMobile ? 'column' : 'row'}
            >
              <Button
                startIcon={<BackIcon fontSize={'small'} />}
                variant={'text'}
                size={'medium'}
                sx={
                  isMobile
                    ? {
                        color: 'var(--color-text-secondary)',
                        justifyContent: 'left',
                      }
                    : { color: 'var(--color-text-secondary)' }
                }
                color={'inherit'}
                onClick={() => history.push('/invest/overview')}
              >
                {t('labelInvestLRCStakingTitle')}
              </Button>
              <Button
                variant={'outlined'}
                size={'medium'}
                onClick={() => history.push('/invest/balance/sideStake')}
                sx={{ color: 'var(--color-text-secondary)' }}
              >
                {t('labelMyInvestLRCStaking')}
              </Button>
            </Box>
          )}
          <MaxWidthContainer
            display={'flex'}
            justifyContent={'space-between'}
            background={theme.colorBase.box}
          >
            <Box paddingY={7}>
              <Typography marginBottom={2} fontSize={'48px'} variant={'h1'}>
                {t("labelInvestLRCTitle")}
              </Typography>
              <Typography marginBottom={3} color={theme.colorBase.textSecondary} variant={'h4'}>
                {t("labelInvestLRCDes")}
              </Typography>
              <Button onClick={() => history.push('/invest/balance')} sx={{ width: 18 * theme.unit }} variant={'contained'}>
                {t("labelMyInvestLRCStaking")}
              </Button>
            </Box>
            <img src={SoursURL + 'images/earn-staking-title.svg'} />
          </MaxWidthContainer>
          <MaxWidthContainer background={theme.colorBase.boxSecondary} marginTop={5}>
            <StyleWrapper
              display={'flex'}
              flexDirection={'column'}
              justifyContent={'center'}
              alignItems={'center'}
              flex={1}
            >
              {stakeWrapProps.deFiSideCalcData ? (
                <Box
                  className={'hasLinerBg'}
                  display={'flex'}
                  style={styles}
                  justifyContent={'center'}
                  padding={5 / 2}
                >
                  <DeFiSideWrap isJoin={isJoin} symbol={'LRC'} {...(stakeWrapProps as any)} />
                </Box>
              ) : (
                <LoadingBlock />
              )}
            </StyleWrapper>
          </MaxWidthContainer>
        </Box>
      ) : (
        <ErrorPage messageKey={'errorBase'} />
      )}
    </>
  )
}
