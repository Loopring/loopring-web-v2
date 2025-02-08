import { Box, Button, Container, Divider, Tab, Tabs, Typography } from '@mui/material'
import React from 'react'
import {
  HelpIcon,
  OrderListIcon,
  SoursURL,
  VaultKey,
} from '@loopring-web/common-resources'
import {
  Button as LoopringButton,
  ConfirmVaultRisk,
  EmptyDefault,
} from '@loopring-web/component-lib'
import { VaultDashBoardPanel } from '../DashBoardPanel'
import { VaultHomePanel } from '../HomePanel'
import { ModalVaultWrap } from '../components/ModalWrap'
import { useTranslation } from 'react-i18next'

const HomeTitle = () => {
  const { t } = useTranslation()
  return (
    <Typography display={'inline-flex'} alignItems={'center'}>
      <Typography
        component={'span'}
        variant={'h5'}
        whiteSpace={'pre'}
        marginRight={1}
        className={'invest-Balance-Title'}
      >
        {t('labelVaultHomeTitle')}
      </Typography>
    </Typography>
  )
}

const DashBoardTitle = () => {
  const { t } = useTranslation()
  return (
    <Typography display={'inline-flex'} alignItems={'center'}>
      <Typography
        component={'span'}
        variant={'h5'}
        whiteSpace={'pre'}
        marginRight={1}
        className={'invest-Overview-Title'}
      >
        {t('labelVaultDashboardTitle')}
      </Typography>
    </Typography>
  )
}

export interface VaultPageUIProps {
  isMobile: boolean
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
  isMobile,
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
          alignItems={isMobile ? 'left' : 'center'}
          flexDirection={isMobile ? 'column' : 'row'}
        >
          <Tabs
            variant={'scrollable'}
            value={tabIndex}
            sx={{
              marginLeft: -2,
            }}
            onChange={handleTabChange}
          >
            <Tab value={VaultKey.VAULT_HOME} label={<HomeTitle />} />
            <Tab value={VaultKey.VAULT_DASHBOARD} label={<DashBoardTitle />} />
          </Tabs>
          <Box
            display={'flex'}
            flexDirection={'row'}
            marginTop={isMobile ? 2 : 'inherit'}
            width={isMobile ? '100%' : 'initial'}
            justifyContent={'space-between'}
          >
            <Button
              variant={'text'}
              startIcon={<OrderListIcon fontSize={'inherit'} color={'inherit'} />}
              sx={{ marginLeft: 2, color: 'var(--color-text-primary)' }}
              onClick={handleRecordClick}
            >
              {t('labelVaultRecord')}
            </Button>
            <Button
              startIcon={<HelpIcon fontSize={'inherit'} color={'inherit'} />}
              variant={'text'}
              onClick={handleTutorialClick}
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
          {tabIndex == VaultKey.VAULT_DASHBOARD && (
            <VaultDashBoardPanel
              vaultAccountInfo={vaultAccountInfo}
              closeShowLeverage={closeLeverage}
              showLeverage={showLeverage}
            />
          )}
          {tabIndex == VaultKey.VAULT_HOME && (
            <VaultHomePanel vaultAccountInfo={vaultAccountInfo} />
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
