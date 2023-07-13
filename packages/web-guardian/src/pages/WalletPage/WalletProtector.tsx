import { Box, Typography } from '@mui/material'
import { Button, EmptyDefault, GuardianStep, useSettings } from '@loopring-web/component-lib'
import React from 'react'
import { useTranslation } from 'react-i18next'
import {
  Layer1Action,
  LoadingIcon,
  LockIcon,
  MapChainId,
  myLog,
  SDK_ERROR_MAP_TO_UI,
} from '@loopring-web/common-resources'
import { layer1Store, LoopringAPI, useAccount, useSystem } from '@loopring-web/core'
import { connectProvides } from '@loopring-web/web3-provider'
import * as sdk from '@loopring-web/loopring-sdk'

const useHebaoProtector = <T extends sdk.Protector>({
  guardianConfig,
  handleOpenModal,
  loadData,
}: {
  guardianConfig: any
  // isContractAddress: boolean;
  handleOpenModal: (props: { step: GuardianStep; options?: any }) => void
  loadData: () => Promise<void>
}) => {
  const { account } = useAccount()
  const { chainId, gasPrice } = useSystem()
  const { t } = useTranslation(['error'])
  const { setOneItem } = layer1Store.useLayer1Store()
  const { defaultNetwork } = useSettings()
  const network = MapChainId[defaultNetwork] ?? MapChainId[1]
  const networkName: sdk.NetworkWallet = ['ETHEREUM', 'GOERLI'].includes(network)
    ? sdk.NetworkWallet.ETHEREUM
    : sdk.NetworkWallet[network]
  // const network = sdk.NetworkWallet[MapChainId[[1, 5].includes(Number(chainId) ?? 1) ? 1 : chainId]]
  // myLog("network", network);
  const onLock = React.useCallback(
    async (item: T) => {
      //
      const config = guardianConfig.actionGasSettings.find(
        (item: any) => item.action === 'META_TX_LOCK_WALLET_WA',
      )
      const guardianModule = guardianConfig.supportContracts.find(
        (ele: any) => ele.contractName.toUpperCase() === 'GUARDIAN_MODULE',
      ).contractAddress

      if (LoopringAPI?.walletAPI) {
        const [isVersion1, nonce] = await Promise.all([
          LoopringAPI.walletAPI
            .getWalletType({
              wallet: item.address, //account.accAddress,
              network: networkName,
            })
            .then(({ walletType }) => {
              if (walletType && walletType.loopringWalletContractVersion?.startsWith('V1_')) {
                return true
              } else {
                return false
              }
            }),
          sdk.getNonce(connectProvides.usedWeb3 as any, account.accAddress),
        ])
        const params: sdk.LockHebaoHebaoParam = {
          web3: connectProvides.usedWeb3 as any,
          from: account.accAddress,
          contractAddress: isVersion1 ? guardianModule : item.address,
          wallet: item.address,
          gasPrice,
          gasLimit: config.gasLimit ?? 15000,
          chainId: chainId as any,
          isVersion1,
          nonce,
          sendByMetaMask: true,
        }
        myLog('LockHebaoHebaoParam params', params)
        try {
          const { error } = await LoopringAPI.walletAPI.lockHebaoWallet(params)
          const errorItem = SDK_ERROR_MAP_TO_UI[error?.code ?? 700001]
          if (error) {
            handleOpenModal({
              step: GuardianStep.LockAccount_Failed,
              options: {
                error: errorItem ? t(errorItem.messageKey) : error.message,
              },
            })
          } else {
            setOneItem({
              chainId: chainId as sdk.ChainId,
              uniqueId: item.address,
              domain: Layer1Action.GuardianLock,
            })
            handleOpenModal({
              step: GuardianStep.LockAccount_Success,
            })
            loadData()
          }
        } catch (reason: any) {
          // result.code = ActionResultCode.ApproveFailed;
          // result.data = reason;
          sdk.dumpError400(reason)
          handleOpenModal({
            step: GuardianStep.LockAccount_User_Denied,
            options: { error: reason.message },
          })
        }
      }
    },
    [
      guardianConfig.actionGasSettings,
      guardianConfig.supportContracts,
      account.accAddress,
      gasPrice,
      chainId,
      handleOpenModal,
      t,
      setOneItem,
      loadData,
    ],
  )
  return {
    onLock,
  }
}

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
