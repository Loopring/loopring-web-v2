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
import {
  BackIcon,
  L1L2_NAME_DEFINED,
  MapChainId,
  TOAST_TIME,
  hexToRGB,
} from '@loopring-web/common-resources'
import { Trans, useTranslation } from 'react-i18next'
import { useHistory } from 'react-router-dom'
import { StyleWrapper } from '../DeFiPanel'
import { MaxWidthContainer, containerColors } from '..'
import { useTheme } from '@emotion/react'
import styled from '@emotion/styled'
import { ErrorPage } from '../../ErrorPage'

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
    setShowLRCStakePopup,
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
          <MaxWidthContainer
            display={'flex'}
            background={containerColors[0]}
            alignItems={'center'}
            flexDirection={'column'}
            containerProps={{
              borderBottom: `1px solid ${hexToRGB(theme.colorBase.border, 0.5)}`,
            }}
          >
            <Box
              width={'100%'}
              display={'flex'}
              alignItems={'center'}
              justifyItems={'center'}
              flexDirection={'row'}
              justifyContent={'space-between'}
              height={6 * theme.unit}
            >
              <Button
                startIcon={<BackIcon htmlColor={'var(--color-text-primary)'} fontSize={'small'} />}
                variant={'text'}
                size={'medium'}
                sx={{ color: 'var(--color-text-primary)' }}
                color={'inherit'}
                onClick={() => history.push(`/invest/overview`)}
              >
                {t('labelBack')}
              </Button>
              <Button onClick={() => history.push('/invest/balance')} variant={'text'}>
                {t('labelMyInvestLRCStaking')}{' '}
                {<BackIcon sx={{ marginLeft: 0.5, transform: 'rotate(180deg)' }} />}
              </Button>
            </Box>
          </MaxWidthContainer>
          <MaxWidthContainer>
            <Typography
              marginTop={2}
              borderRadius={2}
              bgcolor={'var(--color-box-third)'}
              paddingY={1.5}
              paddingX={2}
            >
              <Trans
                i18nKey={'labelLRCStakeRiskDes'}
                tOptions={{
                  loopringL2: L1L2_NAME_DEFINED[network].loopringL2,
                  l2Symbol: L1L2_NAME_DEFINED[network].l2Symbol,
                  l1Symbol: L1L2_NAME_DEFINED[network].l1Symbol,
                  ethereumL1: L1L2_NAME_DEFINED[network].ethereumL1,
                }}
              >
                The staked LRC is locked in Loopring L2 and won't be able to used for other purpose
                although it can be redeemed any time; while if the staking is redeemed before 90
                days, the accumulated reward will be dismissed.
              </Trans>
            </Typography>
          </MaxWidthContainer>
          <MaxWidthContainer background={containerColors[0]} paddingY={3}>
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
                  <DeFiSideWrap
                    setShowLRCStakePopup={setShowLRCStakePopup}
                    isJoin={isJoin}
                    symbol={'LRC'}
                    {...(stakeWrapProps as any)}
                  />
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
