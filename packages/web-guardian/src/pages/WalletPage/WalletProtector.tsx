import { Box, Typography } from '@mui/material'
import { Button, EmptyDefault, GuardianStep, useSettings } from '@loopring-web/component-lib'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { LoadingIcon, LockIcon } from '@loopring-web/common-resources'
import * as sdk from '@loopring-web/loopring-sdk'
import { useHebaoProtector } from './hook'

export const WalletProtector = ({
  protectorList,
  handleOpenModal,
  loadData,
  guardianConfig,
}: {
  protectorList: sdk.Protector[]
  handleOpenModal: (info: { step: GuardianStep; options?: any }) => void
  loadData: () => Promise<void>
  guardianConfig: any
}) => {
  const { t } = useTranslation()
  const { onLock } = useHebaoProtector({
    guardianConfig,
    handleOpenModal,
    loadData,
  })
  const { isMobile } = useSettings()
  if (protectorList.length === 0) {
    return (
      <Box flex={1} height={'100%'} width={'100%'}>
        <EmptyDefault
          style={{ alignSelf: 'center' }}
          height={'100%'}
          message={() => (
            <Box flex={1} display={'flex'} alignItems={'center'} justifyContent={'center'}>
              {t('labelNoContent')}
            </Box>
          )}
        />
      </Box>
    )
  } else {
    const StatusView = ({
      status,
      onClickLock,
    }: {
      status: sdk.HEBAO_LOCK_STATUS
      onClickLock: () => void
    }) => {
      switch (status) {
        case 'UNLOCK_FAILED':
        case 'LOCKED':
          return (
            <Box display={'flex'} alignItems={'center'}>
              <LockIcon htmlColor={'var(--color-text-third)'} fontSize={'medium'} />
              <Typography
                color={'var(--color-text-third)'}
                paddingLeft={1}
                variant={'body1'}
                component={'span'}
                alignItems={'center'}
                display={'inline-flex'}
                lineHeight={'inherit'}
              >
                {'LOCKED'}
              </Typography>
            </Box>
          )
        case 'UNLOCK_WAITING':
          return (
            <Box display={'flex'} alignItems={'center'}>
              <LoadingIcon htmlColor={'var(--color-text-third)'} fontSize={'medium'} />
              <Typography
                color={'var(--color-text-third)'}
                paddingLeft={1}
                variant={'body1'}
                component={'span'}
                alignItems={'center'}
                display={'inline-flex'}
                lineHeight={'inherit'}
              >
                {'UNLOCKING'}
              </Typography>
            </Box>
          )
        case 'LOCK_WAITING':
          return (
            <Box display={'flex'} alignItems={'center'}>
              <LockIcon htmlColor={'var(--color-text-third)'} fontSize={'medium'} />
              <Typography
                color={'var(--color-text-third)'}
                paddingLeft={1}
                height={32}
                variant={'body1'}
                component={'span'}
                alignItems={'center'}
                display={'inline-flex'}
                lineHeight={'inherit'}
              >
                {'LOCKING'}
              </Typography>
            </Box>
          )
        case 'LOCK_FAILED':
        case 'CREATED':
          return (
            <Button
              variant={'contained'}
              size={'small'}
              color={'primary'}
              startIcon={<LockIcon htmlColor={'var(--color-text-button)'} />}
              onClick={() => onClickLock()}
            >
              {t('labelLock')}
            </Button>
          )
        default:
          return <></>
      }
    }

    return (
      <Box height={'320px'} overflow='scroll'>
        {protectorList.map((x) => {
          const { lockStatus } = x
          return (
            <Box
              key={x.address}
              display={'flex'}
              alignItems={'center'}
              justifyContent={'space-between'}
              marginBottom={2}
            >
              <Box>
                <Typography variant={'body1'}>{x.ens ? x.ens : t('labelUnknown')}</Typography>
                <Typography color={'var(--color-text-third)'} title={x.address}>
                  {isMobile
                    ? x.address &&
                      `${x.address.slice(0, 6)}...${x.address.slice(x.address.length - 4)}`
                    : x.address}
                </Typography>
              </Box>
              <StatusView
                status={lockStatus}
                onClickLock={() => {
                  onLock(x)
                  handleOpenModal({
                    step: GuardianStep.LockAccount_WaitForAuth,
                    options: { lockRetry: onLock, lockRetryParams: x },
                  })
                }}
              />
            </Box>
          )
        })}
      </Box>
    )
  }
}
