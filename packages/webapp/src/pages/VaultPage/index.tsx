import { useHistory, useRouteMatch } from 'react-router-dom'

import { Box, Container, Tab, Tabs, Typography } from '@mui/material'

import React from 'react'
import { store, useVaultMap } from '@loopring-web/core'

import {
  RouterPath,
  VaultKey,
  SagaStatus,
  SoursURL,
  HelpIcon,
  LOOPRING_DOCUMENT,
  RecordTabIndex,
} from '@loopring-web/common-resources'
import { Button, EmptyDefault, useSettings } from '@loopring-web/component-lib'
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
        {t('labelInvestBalanceTitle')}
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
        {t('labelInvestOverviewTitle')}
      </Typography>
    </Typography>
  )
}
export const VaultPage = () => {
  let match: any = useRouteMatch(`/${RouterPath.vault}/:item`)
  // const selected = match?.params?.item ?? VaultKey.VAULT_HOME
  const { defaultNetwork, isMobile } = useSettings()
  const { t } = useTranslation()
  const history = useHistory()

  const { status: vaultStatus, getVaultMap, marketArray } = useVaultMap()

  // RouterAllowIndex[]
  const [tabIndex, setTabIndex] = React.useState<VaultKey>(
    Object.values(VaultKey)
      .map((item) => item.toLowerCase())
      .includes(match?.params?.item?.toLowerCase())
      ? match?.params?.item
      : VaultKey.VAULT_HOME,
    // InvestType.Overview
  )
  const [error, setError] = React.useState(false)
  React.useEffect(() => {
    const { marketArray } = store.getState().invest.vaultMap
    if (vaultStatus === SagaStatus.UNSET && marketArray?.length) {
      setError(false)
    } else if (vaultStatus === SagaStatus.ERROR) {
      setError(true)
    }
  }, [vaultStatus])

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
          // components={'nav'}
          marginBottom={2}
          display={'flex'}
          justifyContent={'space-between'}
          alignItems={isMobile ? 'left' : 'center'}
          flexDirection={isMobile ? 'column' : 'row'}
        >
          <Tabs
            variant={'scrollable'}
            value={tabIndex}
            onChange={(_e, value) => {
              history.push(`${RouterPath.vault}/${value}`)
              setTabIndex(value)
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
              variant={'outlined'}
              sx={{ marginLeft: 2 }}
              onClick={() =>
                history.push(`/${RouterPath.l2assets}/history/${RecordTabIndex.vaultRecords}`)
              }
            >
              {t('labelVaultRecord')}
            </Button>
            <Button
              startIcon={<HelpIcon fontSize={'large'} />}
              variant={'text'}
              onClick={() => {
                window.open(`${LOOPRING_DOCUMENT}vault_tutorial_en.md`, '_blank')
                window.opener = null
              }}
              sx={{ color: 'var(--color-text-secondary)' }}
            >
              {t('labelVaultTutorial')}
            </Button>
          </Box>
        </Box>
      </Container>
      {!error && marketArray?.length ? (
        <>
          <ModalVaultWrap />
          {tabIndex == VaultKey.VAULT_DASHBOARD && <VaultDashBoardPanel />}
          {tabIndex == VaultKey.VAULT_HOME && <VaultHomePanel />}
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
    </Box>
  )
  // <>{viewTemplate}</>;
}
