import { useRouteMatch } from 'react-router-dom'

import { Box } from '@mui/material'

import React from 'react'
import { useVaultLayer2, useVaultMap } from '@loopring-web/core'

import {
  ProfileIndex,
  MapChainId,
  RouterPath,
  VaultKey,
  SagaStatus,
  SoursURL,
} from '@loopring-web/common-resources'
import { Button, EmptyDefault, useSettings } from '@loopring-web/component-lib'
import { VaultDashBoardPanel } from './DashBoardPanel'
import { VaultHomePanel } from './HomePanel'
import { useTranslation } from 'react-i18next'
import { ModalWrap } from './components/ModalWrap'

export const VaultPage = () => {
  let match: any = useRouteMatch(`/${RouterPath.vault}/:item`)
  const selected = match?.params.item ?? VaultKey.VAULT_HOME
  const { defaultNetwork } = useSettings()
  const { t } = useTranslation()
  const { status: vaultStatus, marketArray, getVaultMap } = useVaultMap()

  const [error, setError] = React.useState(false)
  React.useEffect(() => {
    if (vaultStatus === SagaStatus.UNSET && marketArray.length) {
      setError(false)
    } else if (vaultStatus === SagaStatus.ERROR) {
      setError(true)
    }
  }, [vaultStatus])
  const router = React.useMemo(() => {
    let _selected
    const network = MapChainId[defaultNetwork] ?? MapChainId[1]
    if (ProfileIndex[network]?.includes(selected)) {
      _selected = selected
    } else {
      _selected = ''
    }
    switch (_selected?.toLowerCase()) {
      case VaultKey.VAULT_DASHBOARD.toLowerCase():
        return <VaultDashBoardPanel />
      case VaultKey.VAULT_HOME.toLowerCase():
      default:
        return <VaultHomePanel />
    }
  }, [selected])

  return (
    <Box flex={1} display={'flex'} flexDirection={'column'}>
      {marketArray.length ? (
        <>
          {router}
          <ModalWrap />
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
