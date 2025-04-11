import { Box, Button, Container, Divider, Tab, Tabs, Typography } from '@mui/material'
import React from 'react'
import { HelpIcon, LOOPRING_DOCUMENT, OrderListIcon, SoursURL, VaultKey } from '@loopring-web/common-resources'
import {
  Button as LoopringButton,
  ConfirmVaultRisk,
  EmptyDefault,
  useSettings,
} from '@loopring-web/component-lib'
import { VaultDashBoardPanel } from '../components/DashBoardPanel'
import { VaultHomePanel } from './HoimePanel'
import { ModalVaultWrap } from '../components/ModalWrap'
import { useTranslation } from 'react-i18next'
import { VaultTradePanel } from '../components/TradePanel'


export interface VaultPageUIProps {
  tabIndex: VaultKey
  error: boolean
  showLeverage: { show: boolean; closeAfterChange: boolean }
  isShowConfirmedVault: { isShow: boolean }
  vaultAccountInfo: any
  marketArray: any[]
  handleTabChange: (event: any, value: VaultKey) => void
  handleConfirmVaultRiskClose: (event: any, isAgree: boolean) => void
  toggleLeverage: () => void
  closeLeverage: () => void
  handleRecordClick: () => void
  handleTutorialClick: () => void
  getVaultMap: () => void
}

export const VaultPageUI: React.FC<VaultPageUIProps> = ({
  tabIndex,
  error,
  showLeverage,
  isShowConfirmedVault,
  vaultAccountInfo,
  marketArray,
  handleTabChange,
  handleConfirmVaultRiskClose,
  toggleLeverage,
  closeLeverage,
  handleRecordClick,
  handleTutorialClick,
  getVaultMap,
}) => {
  const { t } = useTranslation()
  const { isMobile } = useSettings()

  return (
    <Box flex={1} display={'flex'} flexDirection={'column'}>
      <Container
        maxWidth='lg'
        style={{
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Box
          display={'flex'}
          justifyContent={'space-between'}
          alignItems={'center'}
          flexDirection={'row'}
        >
          <Tabs
            variant={'scrollable'}
            value={tabIndex}
            sx={{
              marginLeft: -2,
            }}
            onChange={handleTabChange}
          >
            <Tab
              value={VaultKey.VAULT_DASHBOARD}
              label={
                <Typography display={'inline-flex'} alignItems={'center'}>
                  <Typography
                    component={'span'}
                    variant={'h5'}
                    whiteSpace={'pre'}
                    marginRight={1}
                    className={'invest-Overview-Title'}
                    color={
                      tabIndex === VaultKey.VAULT_DASHBOARD
                        ? 'var(--color-text-primary)'
                        : 'var(--color-text-secondary)'
                    }
                  >
                    {t('labelVaultHomeTitle')}
                  </Typography>
                </Typography>
              }
            />
            <Tab
              value={VaultKey.VAULT_HOME}
              label={
                <Typography display={'inline-flex'} alignItems={'center'}>
                  <Typography
                    component={'span'}
                    variant={'h5'}
                    whiteSpace={'pre'}
                    marginRight={1}
                    className={'invest-Balance-Title'}
                    color={
                      tabIndex === VaultKey.VAULT_HOME
                        ? 'var(--color-text-primary)'
                        : 'var(--color-text-secondary)'
                    }
                  >
                    {t('labelVaultMarketTitle')}
                  </Typography>
                </Typography>
              }
            />
            <Tab
              value={VaultKey.VAULT_TRADE}
              label={
                <Typography display={'inline-flex'} alignItems={'center'}>
                  <Typography
                    component={'span'}
                    variant={'h5'}
                    whiteSpace={'pre'}
                    marginRight={1}
                    className={'invest-Trade-Title'}
                    color={
                      tabIndex === VaultKey.VAULT_TRADE
                        ? 'var(--color-text-primary)'
                        : 'var(--color-text-secondary)'
                    }
                  >
                    Trade
                  </Typography>
                </Typography>
              }
            />
          </Tabs>
          <Box
            display={'flex'}
            flexDirection={'row'}
            marginTop={isMobile ? 2 : 'inherit'}
            justifyContent={'space-between'}
          >
            <Button
              startIcon={<HelpIcon fontSize={'inherit'} color={'inherit'} />}
              variant={'text'}
              onClick={() => {
                window.open(`${LOOPRING_DOCUMENT}vault_tutorial_en.md`, '_blank')
                window.opener = null
              }}
              sx={{ marginLeft: 2, color: 'var(--color-text-primary)' }}
            >
              {t('labelVaultTutorial')}
            </Button>
          </Box>
        </Box>
      </Container>
      <Divider />
      {!error && marketArray?.length ? (
        <>
          <ModalVaultWrap onClickLeverage={toggleLeverage} />
          {tabIndex === VaultKey.VAULT_DASHBOARD && (
            <VaultDashBoardPanel
              vaultAccountInfo={vaultAccountInfo}
              closeShowLeverage={closeLeverage}
              showLeverage={showLeverage}
            />
          )}
          {tabIndex === VaultKey.VAULT_HOME && (
            <VaultHomePanel vaultAccountInfo={vaultAccountInfo} />
          )}
          {tabIndex === VaultKey.VAULT_TRADE && (
            <VaultTradePanel vaultAccountInfo={vaultAccountInfo} />
          )}
        </>
      ) : (
        <Box
          key={'empty'}
          flexDirection={'column'}
          display={'flex'}
          justifyContent={'center'}
          flex={1}
          alignItems={'center'}
        >
          <EmptyDefault
            emptyPic={
              <img className='loading-gif' width='36' src={`${SoursURL}images/loading-line.gif`} />
            }
            message={() => {
              return error ? (
                <LoopringButton onClick={getVaultMap} variant={'contained'}>
                  {t('labelVaultRefresh')}
                </LoopringButton>
              ) : (
                <></>
              )
            }}
          />
        </Box>
      )}
      <ConfirmVaultRisk
        open={isShowConfirmedVault.isShow}
        handleClose={handleConfirmVaultRiskClose}
      />
    </Box>
  )
}
