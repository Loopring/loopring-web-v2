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
import { BackIcon, SatkingLogo, SoursURL, TOAST_TIME } from '@loopring-web/common-resources'
import { useTranslation } from 'react-i18next'
import { useHistory } from 'react-router-dom'
import { StyleWrapper } from '../DeFiPanel/'
import { ErrorPage } from '@loopring-web/web-bridge/src/pages/ErrorPage'
import { MaxWidthContainer, containerColors } from '..'
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

  const styles = isMobile ? { flex: 1 } : { width: '500px' }
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
            background={containerColors[0]}
            height={isMobile ? 34 * theme.unit : 25 * theme.unit}
            alignItems={'center'}
          >
            <Box
              paddingY={7}
              width={'100%'}
              display={'flex'}
              alignItems={'center'}
              flexDirection={'column'}
            >
              <Typography marginBottom={2} fontSize={isMobile ? '30px' : '48px'} variant={'h1'}>
                {t('labelInvestLRCTitle')}
              </Typography>
              <Button
                onClick={() => history.push('/invest/balance')}
                sx={{
                  width: isMobile ? 36 * theme.unit : 18 * theme.unit,
                  bgcolor: 'var(--color-button-outlined)',
                }}
                variant={'contained'}
              >
                {t('labelMyInvestLRCStaking')}
              </Button>
            </Box>
          </MaxWidthContainer>
          <MaxWidthContainer minHeight={'80vh'} background={containerColors[1]} paddingY={5}>
            <StyleWrapper
              display={'flex'}
              flexDirection={'column'}
              justifyContent={'center'}
              alignItems={'center'}
              flex={1}
            >
              {stakeWrapProps.deFiSideCalcData ? (
                <Box
                  display={'flex'}
                  style={styles}
                  justifyContent={'center'}
                  paddingX={4}
                  paddingTop={3}
                  paddingBottom={5}
                  bgcolor={'var(--color-box-secondary)'}
                  border={'1px solid var(--color-border)'}
                  borderRadius={2}
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
