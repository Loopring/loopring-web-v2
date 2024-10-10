import { confirmation, useStakeTradeJOIN, useTaikoLock, useToast } from '@loopring-web/core'

import {
  boxLiner,
  Button,
  DeFiSideWrap,
  LoadingBlock,
  MaxWidthContainer,
  Toast,
  ToastType,
  useSettings,
  useToggle,
} from '@loopring-web/component-lib'
import { Box, Grid, Typography } from '@mui/material'
import React from 'react'
import {
  BackIcon,
  L1L2_NAME_DEFINED,
  MapChainId,
  TOAST_TIME,
  hexToRGB,
} from '@loopring-web/common-resources'
import { Trans, useTranslation } from 'react-i18next'
import { useHistory } from 'react-router-dom'
// import { MaxWidthContainer, containerColors } from '..'
// MaxWidthContainer
import { TaikoLockInput } from './TaikoLockInput'
import { useTheme } from '@emotion/react'
import styled from '@emotion/styled'
import { ErrorPage } from '../../pages/ErrorPage'
// import { ErrorPage } from '../../ErrorPage'
const containerColors = ['var(--color-global-bg)', 'var(--color-pop-bg)']
const StyleWrapper = styled(Box)`
  position: relative;
  border-radius: ${({ theme }) => theme.unit}px;

  .loading-block {
    background: initial;
  }

  .hasLinerBg {
    ${({ theme }) => boxLiner({ theme })}
  }

  border-radius: ${({ theme }) => theme.unit}px;
` as typeof Grid
const ButtonStyled = styled(Button)`
  background-color: var(--color-button-outlined);
  color: var(--color-text-primary);
  :hover {
    background-color: var(--color-button-outlined);
    ::before {
      border-radius: 4px;
    }
  }
`

export const TaikoLockPage = ({
  setConfirmedLRCStakeInvestInvest,
  isJoin = true,
  symbol,
}: {
  symbol: string
  setConfirmedLRCStakeInvestInvest: (state: {
    isShow: boolean
    confirmationNeeded: boolean
  }) => void
  isJoin?: boolean
}) => {
  const {
    setShowLRCStakePopup,
    confirmation: { confirmedLRCStakeInvest },
  } = confirmation.useConfirmation()
  const { toggle } = useToggle()

  const { toastOpen, setToastOpen, closeToast } = useToast()
  const { t } = useTranslation()
  const history = useHistory()
  const { stakeWrapProps } = useTaikoLock({ setToastOpen, symbol })

  const { isMobile } = useSettings()

  const styles = isMobile ? { flex: 1 } : { width: '500px' }
  React.useEffect(() => {
    setConfirmedLRCStakeInvestInvest({ show: !confirmedLRCStakeInvest, confirmationNeeded: true })
  }, [])
  const theme = useTheme()
  const { defaultNetwork } = useSettings()
  const network = MapChainId[defaultNetwork] ?? MapChainId[1]
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
          <MaxWidthContainer mt={5} background={containerColors[0]} paddingY={3} sx={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'flex-start',
            }}
          >
            <Box width={'25%'} marginTop={2}
              borderRadius={2}
              bgcolor={'var(--color-box-third)'}
              paddingY={1.5}
              paddingX={2}>
            <Typography
            variant='h5'
            >
              Taiko Farming
            </Typography>
            <Typography
            mt={1.5}
            color={'var(--color-text-secondary)'}
            >
              Lock your Taiko through Taiko Farming to earn points, which helps you get Taiko airdrops.
              The locked Taiko cannot be used for other purposes. Once locked, It cannot be unlocked before the unlock date.
            </Typography>
            <Typography
            mt={1.5}
            color={'var(--color-text-secondary)'}
            >
              Unlock Date: 2025-03-15 16:00
            </Typography>

            </Box>
            

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
                  paddingX={3}
                  paddingTop={3}
                  paddingBottom={3}
                  bgcolor={'var(--color-box-third)'}
                  border={'1px solid var(--color-border)'}
                  borderRadius={2}
                >
                  <TaikoLockInput
                    isJoin={isJoin}
                    symbol={symbol}
                    {...(stakeWrapProps as any)}
                  />
                </Box>
              ) : (
                <LoadingBlock />
              )}
            </StyleWrapper>
            <Box width={'25%'}/>
          </MaxWidthContainer>
        </Box>
      ) : (
        <ErrorPage messageKey={'errorBase'} />
      )}
    </>
  )
}
