import { useHistory, useRouteMatch } from 'react-router-dom'

import { Box, Container, Typography } from '@mui/material'

import React from 'react'
import { ViewAccountTemplate } from '@loopring-web/core'

import {
  ProfileKey,
  ProfileIndex,
  MapChainId,
  RouterPath,
  VaultKey,
  TradeBtnStatus,
} from '@loopring-web/common-resources'
import { Button, useSettings } from '@loopring-web/component-lib'
import { useTranslation } from 'react-i18next'
import { useJoinVault } from '../useOpenVault'

export const VaultDashBoardPanel = () => {
  const { t } = useTranslation()
  const history = useHistory()
  const { joinBtnStatus, joinOnBtnClick, joinBtnLabel } = useJoinVault()
  return (
    <Box flex={1} display={'flex'} flexDirection={'column'}>
      <Box component={'header'}>
        <Typography component={'h2'}>{t('labelTotalBalance')}</Typography>
        <Box marginLeft={1}>
          <Button
            variant={'outlined'}
            color={'primary'}
            onClick={() => history.push('/vault/transaction')}
          >
            {t('labelTransaction')}
          </Button>
        </Box>
      </Box>
      <Box>
        <Typography>TODO: discription</Typography>
        <Box>
          <Button
            size={'medium'}
            onClick={joinOnBtnClick}
            loading={'false'}
            variant={'contained'}
            sx={{ minWidth: 'var(--walletconnect-width)' }}
            disabled={
              joinBtnStatus === TradeBtnStatus.DISABLED || joinBtnStatus === TradeBtnStatus.LOADING
            }
          >
            {joinBtnLabel}
          </Button>
        </Box>
      </Box>
    </Box>
  )
}
