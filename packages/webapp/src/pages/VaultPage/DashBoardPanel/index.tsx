import { useHistory, useRouteMatch } from 'react-router-dom'

import { Box, Typography } from '@mui/material'

import React from 'react'

import { TradeBtnStatus } from '@loopring-web/common-resources'
import { Button, useSettings } from '@loopring-web/component-lib'
import { useTranslation } from 'react-i18next'
import { VaultAccountStatus } from '@loopring-web/loopring-sdk/src/defs/loopring_defs'
import { useAccountInfo } from '../components/useAccountInfo'

export const VaultDashBoardPanel = () => {
  const { t } = useTranslation()
  const history = useHistory()
  const { btnStatus, onBtnClick, btnLabel, vaultAccountInfo } = useAccountInfo()
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
        <Typography>TODO: description</Typography>
        <Box>
          <Button
            size={'medium'}
            onClick={onBtnClick}
            loading={'false'}
            variant={'contained'}
            sx={{ minWidth: 'var(--walletconnect-width)' }}
            disabled={btnStatus === TradeBtnStatus.DISABLED || btnStatus === TradeBtnStatus.LOADING}
          >
            {btnLabel}
          </Button>
          {vaultAccountInfo?.accountStatus &&
            [VaultAccountStatus.IN_STAKING].includes(vaultAccountInfo.accountStatus) && (
              <Button
                size={'medium'}
                onClick={onBtnClick}
                loading={'false'}
                variant={'contained'}
                sx={{ minWidth: 'var(--walletconnect-width)' }}
                disabled={
                  btnStatus === TradeBtnStatus.DISABLED || btnStatus === TradeBtnStatus.LOADING
                }
              >
                {btnLabel}
              </Button>
            )}
        </Box>
      </Box>
    </Box>
  )
}
