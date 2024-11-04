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
import { CloseIcon, hexToRGB, SoursURL, TOAST_TIME } from '@loopring-web/common-resources'

import { useHistory } from 'react-router-dom'
import { TaikoLockInput } from './TaikoLockInput'
import styled from '@emotion/styled'
import { ErrorPage } from '../../pages/ErrorPage'
import BannerPage from './BannerPage'
import { useTheme } from '@emotion/react'
import { MintModal } from './MintModal'

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
    confirmation: { confirmedLRCStakeInvest, showTaikoLockDescription },
    setShowTaikoLockDescription,
  } = confirmation.useConfirmation()
  const { toggle } = useToggle()

  const { toastOpen, setToastOpen, closeToast } = useToast()
  const { stakeWrapProps } = useTaikoLock({ setToastOpen, symbol })

  const { isMobile } = useSettings()

  const styles = isMobile ? { flex: 1 } : { width: '450px' }
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
          <Box
            width={'100%'}
            height={'48px'}
            bgcolor={hexToRGB('#EB2FAC', 0.15)}
            justifyContent={'center'}
            alignItems={'center'}
            display={'flex'}
            mt={4}
          >
            <Box
              component={'img'}
              height={'28px'}
              src={
                SoursURL +
                (theme.mode === 'dark'
                  ? 'earn/taiko_farming_banner_wording.png'
                  : 'earn/taiko_farming_banner_wording_light.png')
              }
              mb={'2px'}
            />
          </Box>
          <MaxWidthContainer
            mt={4}
            background={containerColors[0]}
            sx={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'flex-start',
            }}
          >
            <Box width={'26%'} />
            <StyleWrapper
              display={'flex'}
              flexDirection={'column'}
              justifyContent={'center'}
              alignItems={'center'}
              flex={1}
            >
              {stakeWrapProps.deFiSideCalcData ? (
                // <Box
                //   display={'flex'}
                //   style={styles}
                //   justifyContent={'center'}
                //   paddingX={3}
                //   paddingTop={3}
                //   paddingBottom={3}
                //   bgcolor={'var(--color-box-third)'}
                //   border={'1px solid var(--color-border)'}
                //   borderRadius={2}
                // >
                <TaikoLockInput isJoin={isJoin} symbol={symbol} {...(stakeWrapProps as any)} />
              ) : (
                // </Box>
                <LoadingBlock />
              )}
            </StyleWrapper>
            <Box width={'26%'}>
              <Box
                p={2}
                borderRadius={'8px'}
                bgcolor={'var(--color-box-third)'}
                display={'flex'}
                flexDirection={'column'}
                justifyContent={'space-between'}
                position={'relative'}
                mb={6}
                sx={{
                  backgroundImage: `url('${SoursURL}earn/taiko_farming_des_bg${theme.mode === 'light' ? '_light' : ''}.png')`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'center',
                  backgroundSize: 'cover',
                }}
              >
                <Typography color={'var(--color-white)'}>
                  Enjoy complete control over your locking duration by choosing any period that
                  suits you. Trailblazer points will be awarded linearly based on the length of your
                  lock. Plus, your locked TAIKO remains usable within Loopring’s DeFi ecosystem! Use
                  it as collateral to continue trading and earning, maximizing your capital
                  efficiency even while it’s locked.
                </Typography>
              </Box>

              <Box
                p={2}
                borderRadius={'8px'}
                sx={{
                  backgroundImage: `url(${SoursURL + (theme.mode === 'dark' ? 'earn/taiko_farming_banner_bg.png' : 'earn/taiko_farming_banner_bg_light.png')})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat',
                }}
                display={'flex'}
                flexDirection={'column'}
                justifyContent={'space-between'}
              >
                <Typography variant={'h5'} color={theme.colorBase.white}>
                  {t('labelTaikoFarmingUnlockValue')}
                </Typography>
                <Box
                  mt={2}
                  height={'32px'}
                  width={'115.2px'}
                  component={'img'}
                  sx={{
                    cursor: 'pointer',
                  }}
                  src={SoursURL + 'earn/taiko_farming_banner_button.png'}
                  alignSelf={'end'}
                  onClick={() => {
                    window.open('/#/taiko-farming/banner', '_blank')
                  }}
                />
              </Box>
            </Box>
          </MaxWidthContainer>
        </Box>
      ) : (
        <ErrorPage messageKey={'errorBase'} />
      )}
      <MintModal
        // open={stakeWrapProps.mintModal.open}
        // // ={localState.modalStatus === 'collateralDetails' && !showLeverage.show}
        // onClose={stakeWrapProps.mintModal.onClose}
        // onClickMax={}
        // mintWarningChecked={true}
        // // mintWarningText={t('labelTaikoFarmingMintWarningText')}
        // onWarningCheckBoxChange={() => {

        // }}
        // onConfirmBtnClicked={() => {

        // }}
        // onInput={(str) => {

        // }}

        // inputValue='1'
        // confirmBtnDisabled={false}
        // tokenAvailableAmount='10'
        {...stakeWrapProps.mintModal}
        logoCoinJSON={stakeWrapProps.taikoCoinJSON}
      />
    </>
  )
}

export { BannerPage as TaikoLockBannerPage }
