import { useHistory, useRouteMatch } from 'react-router-dom'

import { Box, Container, Divider, Tab, Tabs, Typography } from '@mui/material'

import React from 'react'
import { confirmation, store, useAccountInfo, useVaultMap } from '@loopring-web/core'

import {
  RouterPath,
  VaultKey,
  SagaStatus,
  SoursURL,
  HelpIcon,
  LOOPRING_DOCUMENT,
  RecordTabIndex,
  OrderListIcon,
} from '@loopring-web/common-resources'
import {
  Button,
  ConfirmVaultRisk,
  EmptyDefault,
  useOpenModals,
  useSettings,
} from '@loopring-web/component-lib'
import { VaultDashBoardPanel } from './DashBoardPanel'
import { VaultHomePanel } from './HomePanel'
import { useTranslation } from 'react-i18next'
import { ModalVaultWrap } from './components/ModalWrap'
import { useConfirmation } from '@loopring-web/core/src/stores/localStore/confirmation'
import { useVaultPage } from './hook'
import { VaultPageUI } from './components/VaultPageUI'

export const HomeTitle = () => {
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

export const DashBoardTitle = () => {
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

export const VaultPage = () => {
  const { isMobile } = useSettings()
  const {
    tabIndex,
    error,
    showLeverage,
    isShowConfirmedVault,
    vaultAccountInfo,
    marketArray,
    getVaultMap,
    handleTabChange,
    handleConfirmVaultRiskClose,
    toggleLeverage,
    closeLeverage,
    handleRecordClick,
    handleTutorialClick,
  } = useVaultPage()

  return (
    <VaultPageUI
      isMobile={isMobile}
      tabIndex={tabIndex}
      error={error}
      showLeverage={showLeverage}
      isShowConfirmedVault={isShowConfirmedVault}
      vaultAccountInfo={vaultAccountInfo}
      marketArray={marketArray}
      handleTabChange={handleTabChange}
      handleConfirmVaultRiskClose={handleConfirmVaultRiskClose}
      toggleLeverage={toggleLeverage}
      closeLeverage={closeLeverage}
      handleRecordClick={handleRecordClick}
      handleTutorialClick={handleTutorialClick}
      getVaultMap={getVaultMap}
    />
  )
}
