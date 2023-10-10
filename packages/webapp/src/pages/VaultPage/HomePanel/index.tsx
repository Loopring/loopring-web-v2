import { Box, Container, Typography } from '@mui/material'
import React from 'react'
import {
  RouterPath,
  SoursURL,
  TradeBtnStatus,
  VaultIcon,
  VaultKey,
} from '@loopring-web/common-resources'
import { BoxBannerStyle, Button, useSettings } from '@loopring-web/component-lib'
import { useTranslation } from 'react-i18next'
import * as sdk from '@loopring-web/loopring-sdk'
import { useVaultLayer2, VaultAccountInfoStatus } from '@loopring-web/core'
import { useHistory } from 'react-router-dom'
import { useTheme } from '@emotion/react'

export const VaultHomePanel = ({
  vaultAccountInfo: { joinBtnLabel, joinBtnStatus, onJoinPop },
}: {
  vaultAccountInfo: VaultAccountInfoStatus
}) => {
  const { isMobile } = useSettings()
  const theme = useTheme()
  const { t } = useTranslation()
  const { vaultAccountInfo, activeInfo } = useVaultLayer2()
  const history = useHistory()

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
          <Box marginY={3} display={'flex'} justifyContent={'space-between'}>
            <Box flex={1} maxWidth={440}>
              <Typography compontent={'h2'} variant={'h3'}>
                {t('labelTitleVault')}
              </Typography>

              <Typography compontent={'p'} variant={'body1'}>
                {t('labelTitleVaultDes')}
              </Typography>
              <Box marginY={2} display={'flex'} flexDirection={'row'}>
                <Box marginX={1} marginY={1}>
                  {(vaultAccountInfo &&
                    [sdk.VaultAccountStatus.IN_STAKING].includes(
                      vaultAccountInfo?.accountStatus,
                    )) ||
                  activeInfo?.hash ? (
                    <Button
                      size={'medium'}
                      onClick={() => {
                        history.push(`${RouterPath.vault}/${VaultKey.VAULT_DASHBOARD}`)
                      }}
                      loading={'false'}
                      variant={'contained'}
                      sx={{ minWidth: 'var(--walletconnect-width)' }}
                    >
                      {
                        //TODO go trade
                        t('labelGoVaultDashBoard')
                      }
                    </Button>
                  ) : (
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
                  )}
                </Box>

                <Box></Box>
                {/*//TODO market*/}

                {/*<Box marginX={1} marginY={1}>*/}
                {/*  {[sdk.VaultAccountStatus.IN_STAKING].includes(*/}
                {/*    (vaultAccountInfo?.accountStatus ?? '') as sdk.VaultAccountStatus,*/}
                {/*  ) && (*/}
                {/*    <Button*/}
                {/*      size={'medium'}*/}
                {/*      onClick={onSwapPop}*/}
                {/*      loading={'false'}*/}
                {/*      variant={'contained'}*/}
                {/*      sx={{ minWidth: 'var(--walletconnect-width)' }}*/}
                {/*      disabled={*/}
                {/*        swapBtnStatus === TradeBtnStatus.DISABLED ||*/}
                {/*        swapBtnStatus === TradeBtnStatus.LOADING*/}
                {/*      }*/}
                {/*    >*/}
                {/*      {swapBtnLabel}*/}
                {/*    </Button>*/}
                {/*  )}*/}
                {/*</Box>*/}
              </Box>
            </Box>
            {!isMobile && (
              <Box>
                <VaultIcon
                  style={{
                    width: 180,
                    height: 180,
                  }}
                  primary={theme.colorBase.textPrimary}
                  secondary={theme.colorBase.textSecondary}
                  fill={theme.colorBase.textPrimary}
                />
              </Box>
            )}
          </Box>
        </Container>
      </BoxBannerStyle>
    </Box>
  )
}
