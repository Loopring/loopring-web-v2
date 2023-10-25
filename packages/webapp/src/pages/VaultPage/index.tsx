import { useHistory, useRouteMatch } from 'react-router-dom'

import { Box, Container, Divider, Tab, Tabs, Typography } from '@mui/material'

import React from 'react'
import { confirmation, store, useAccountInfo, usePopup, useVaultMap } from '@loopring-web/core'

import {
  RouterPath,
  VaultKey,
  SagaStatus,
  SoursURL,
  HelpIcon,
  LOOPRING_DOCUMENT,
  RecordTabIndex,
  OrderListIcon,
  InvestMainRouter,
} from '@loopring-web/common-resources'
import {
  Button,
  ConfirmInvestDefiRisk,
  ConfirmVaultRisk,
  EmptyDefault,
  useSettings,
} from '@loopring-web/component-lib'
import { VaultDashBoardPanel } from './DashBoardPanel'
import { VaultHomePanel } from './HomePanel'
import { useTranslation } from 'react-i18next'
import { ModalVaultWrap } from './components/ModalWrap'

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
const VaultPath = `${RouterPath.vault}/:item`
export const VaultPage = () => {
  let match: any = useRouteMatch(VaultPath)
  const { isMobile } = useSettings()
  const { t } = useTranslation()
  const history = useHistory()
  const vaultAccountInfo = useAccountInfo()
  const { status: vaultStatus, getVaultMap, marketArray } = useVaultMap()
  const [tabIndex, setTabIndex] = React.useState<VaultKey>(() => {
    return (
      Object.values(VaultKey).find(
        (item) => item.toLowerCase() == match?.params?.item?.toLowerCase(),
      ) ?? VaultKey.VAULT_HOME
    )
  })
  const [confirmed, setConfirmed] = React.useState<boolean>(false)
  React.useEffect(() => {
    setConfirmed(true)
  }, [])
  const {
    confirmedVault,
    confirmation: { confirmedVault: confirmedVaultShow },
  } = confirmation.useConfirmation()
  const [error, setError] = React.useState(false)
  React.useEffect(() => {
    const { marketArray } = store.getState().invest.vaultMap
    if (vaultStatus === SagaStatus.UNSET && marketArray?.length) {
      setError(false)
    } else if (vaultStatus === SagaStatus.ERROR) {
      setError(true)
    }
  }, [vaultStatus])
  React.useEffect(() => {
    const item = Object.values(VaultKey).find(
      (item) => item.toLowerCase() == match?.params?.item?.toLowerCase(),
    )
    setTabIndex(item ? item : VaultKey.VAULT_HOME)
  }, [match?.params?.item])

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
            onChange={(_e, value) => {
              history.push(`${RouterPath.vault}/${value}`)
            }}
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
              onClick={() => history.push(`${RouterPath.l2records}/${RecordTabIndex.VaultRecords}`)}
            >
              {t('labelVaultRecord')}
            </Button>
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
          <ModalVaultWrap />
          {tabIndex == VaultKey.VAULT_DASHBOARD && (
            <VaultDashBoardPanel vaultAccountInfo={vaultAccountInfo} />
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
                <Button onClick={getVaultMap} variant={'contained'}>
                  {t('labelVaultRefresh')}
                </Button>
              ) : (
                <></>
              )
            }}
          />
        </Box>
      )}
      <ConfirmVaultRisk
        open={!confirmedVaultShow && confirmed}
        handleClose={(_e, isAgree) => {
          if (!isAgree) {
            setConfirmed(false)
            // confirmedVault({ isShow: false })
            history.push(`${RouterPath.layer2}`)
          } else {
            setConfirmed(false)
            confirmedVault()
          }
        }}
      />
    </Box>
  )
  // <>{viewTemplate}</>;
}
