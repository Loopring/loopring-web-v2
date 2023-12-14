import { Box, Container, Modal, Typography } from '@mui/material'
import React from 'react'
import { RouterPath, TradeBtnStatus, VaultIcon, VaultKey } from '@loopring-web/common-resources'
import {
  BoxBannerStyle,
  Button,
  MarketDetail,
  MarketTable,
  ModalCloseButtonPosition,
  useSettings,
} from '@loopring-web/component-lib'
import { useTranslation } from 'react-i18next'
import * as sdk from '@loopring-web/loopring-sdk'
import { useSystem, useVaultLayer2, VaultAccountInfoStatus } from '@loopring-web/core'
import { useHistory } from 'react-router-dom'
import { useTheme } from '@emotion/react'
import { useVaultMarket } from './hook'

export const VaultHomePanel = ({
  vaultAccountInfo: { joinBtnLabel, joinBtnStatus, onJoinPop },
}: {
  vaultAccountInfo: VaultAccountInfoStatus
}) => {
  const { isMobile } = useSettings()
  const { forexMap, etherscanBaseUrl } = useSystem()
  const theme = useTheme()
  const { t } = useTranslation()
  const { vaultAccountInfo, activeInfo } = useVaultLayer2()
  const history = useHistory()
  const tableRef = React.useRef<HTMLDivElement>()
  const { marketProps: vaultMarketProps, detail, setShowDetail } = useVaultMarket({ tableRef })

  return (
    <Box flex={1} display={'flex'} flexDirection={'column'}>
      <BoxBannerStyle className={isMobile ? 'mobile' : ''} direction={'right'}>
        <Container
          maxWidth='lg'
          style={{
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
          }}
        >
          <Box marginY={3} display={'flex'} justifyContent={'space-between'}>
            <Box
              flex={1}
              maxWidth={440}
              display={'flex'}
              flexDirection={'column'}
              justifyContent={'center'}
            >
              <Typography component={'h2'} variant={'h3'}>
                {t('labelTitleVault')}
              </Typography>

              <Typography component={'p'} variant={'body1'}>
                {t('labelTitleVaultDes')}
              </Typography>
              <Box marginY={2} display={'flex'} flexDirection={'row'}>
                {(vaultAccountInfo &&
                  [sdk.VaultAccountStatus.IN_STAKING].includes(vaultAccountInfo?.accountStatus)) ||
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
                    {t('labelGoVaultDashBoard')}
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
      <Box
        flex={1}
        display={'flex'}
        flexDirection={'column'}
        sx={{
          background: 'var(--color-pop-bg)',
        }}
      >
        <Container
          maxWidth='lg'
          style={{
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
          }}
        >
          <MarketTable {...{ ...vaultMarketProps }} hiddenFav={true} />
        </Container>
      </Box>
      <Modal open={detail?.isShow} onClose={() => setShowDetail({ isShow: false })}>
        <Box height={'100%'} display={'flex'} justifyContent={'center'} alignItems={'center'}>
          <Box
            padding={5}
            bgcolor={'var(--color-box)'}
            width={'var(--modal-width)'}
            borderRadius={1}
            display={'flex'}
            alignItems={'center'}
            flexDirection={'column'}
            position={'relative'}
            height={'80vh'}
            overflow={'scroll'}
          >
            <ModalCloseButtonPosition
              right={2}
              top={2}
              t={t}
              onClose={() => setShowDetail({ isShow: false } as any)}
            />

            <MarketDetail
              etherscanBaseUrl={etherscanBaseUrl}
              isShow={detail.isShow}
              forexMap={forexMap}
              isLoading={detail.isLoading}
              {...{ ...detail?.detail }}
            />
          </Box>
        </Box>
      </Modal>
    </Box>
  )
}
