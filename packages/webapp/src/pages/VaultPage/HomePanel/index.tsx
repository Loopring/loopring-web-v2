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
import { useJoinVault } from '../useOpenVault'

export const VaultHomePanel = () => {
  const { joinBtnStatus, joinOnBtnClick, joinBtnLabel } = useJoinVault()
  return <Box flex={1} display={'flex'} flexDirection={'column'}></Box>
}
