import { confirmation, useTaikoLock, useToast } from '@loopring-web/core'
import { useTranslation } from 'react-i18next'

import {
  boxLiner,
  Button,
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
  SoursURL,
  TOAST_TIME,
} from '@loopring-web/common-resources'

import { useHistory } from 'react-router-dom'
import { TaikoLockInput } from './TaikoLockInput'
import styled from '@emotion/styled'
import { ErrorPage } from '../../pages/ErrorPage'
import BannerPage from './BannerPage'

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
  const { t } = useTranslation('common')
  const {
    confirmation: { confirmedLRCStakeInvest },
  } = confirmation.useConfirmation()
  const { toggle } = useToggle()

  const { toastOpen, setToastOpen, closeToast } = useToast()
  const { stakeWrapProps } = useTaikoLock({ setToastOpen, symbol })

  const { isMobile } = useSettings()

  const styles = isMobile ? { flex: 1 } : { width: '450px' }
  React.useEffect(() => {
    setConfirmedLRCStakeInvestInvest({ show: !confirmedLRCStakeInvest, confirmationNeeded: true })
  }, [])
  const history = useHistory()
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
          <MaxWidthContainer
            mt={4}
            background={containerColors[0]}
            sx={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'flex-start',
            }}
          >
            <Box
              sx={{
                backgroundImage: `url("${SoursURL}images/web-earn/taiko_farming_banner.png")`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                width: '100%',
                height: '100px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                borderRadius: '8px',
                cursor: 'pointer',
              }}
              component={'div'}
              onClick={() => {
                history.push('/taiko-farming/banner')
              }}
            >
              <Typography textAlign={'center'} variant='h4'>
                {t('labelTaikoFarmingUnlock')}
              </Typography>
              <Typography mt={1} textAlign={'center'}>
                {t('labelTaikoFarmingMintInfo')}
              </Typography>
            </Box>
          </MaxWidthContainer>
          <MaxWidthContainer
            mt={4}
            background={containerColors[0]}
            sx={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'flex-start',
            }}
          >
            <Box
              width={'25%'}
              marginTop={2}
              borderRadius={2}
              bgcolor={'var(--color-box-third)'}
              paddingY={1.5}
              paddingX={2}
            >
              <Typography variant='h5'>{t('labelTaikoFarming')}</Typography>
              <Typography mt={1.5} color={'var(--color-text-secondary)'}>
                {t('labelTaikoFarmingDescription')}
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
                  <TaikoLockInput isJoin={isJoin} symbol={symbol} {...(stakeWrapProps as any)} />
                </Box>
              ) : (
                <LoadingBlock />
              )}
            </StyleWrapper>
            <Box width={'25%'} />
          </MaxWidthContainer>
        </Box>
      ) : (
        <ErrorPage messageKey={'errorBase'} />
      )}
    </>
  )
}

export { BannerPage as TaikoLockBannerPage }
