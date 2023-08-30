import { useRouteMatch } from 'react-router-dom'

import { Box, Container } from '@mui/material'

import React from 'react'
import { ViewAccountTemplate } from '@loopring-web/core'

import {
  ProfileKey,
  ProfileIndex,
  MapChainId,
  RouterPath,
  VaultKey,
} from '@loopring-web/common-resources'
import { useSettings } from '@loopring-web/component-lib'
import { VaultDashBoardPanel } from './DashBoardPanel'
import { VaultHomePanel } from './HomePanel'

export const VaultPage = () => {
  let match: any = useRouteMatch(`/${RouterPath.vault}/:item`)
  const selected = match?.params.item ?? VaultKey.VAULT_HOME
  const { defaultNetwork } = useSettings()

  const layer2Router = React.useMemo(() => {
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
      <ViewAccountTemplate activeViewTemplate={layer2Router} />
    </Box>
  )
  // <>{viewTemplate}</>;
}
