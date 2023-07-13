import { Box, Modal, Typography } from '@mui/material'
import * as sdk from '@loopring-web/loopring-sdk'
import { Trans, useTranslation } from 'react-i18next'
import React from 'react'
import {
  Button,
  EmptyDefault,
  GuardianStep,
  InputCode,
  ModalCloseButton,
  SwitchPanelStyled,
  useSettings,
} from '@loopring-web/component-lib'
import { LoopringAPI, useAccount, useSystem } from '@loopring-web/core'

import { connectProvides } from '@loopring-web/web3-provider'
import { MapChainId, SDK_ERROR_MAP_TO_UI } from '@loopring-web/common-resources'

const VCODE_UNIT = 6
export const WalletValidationInfo = ({
  guardiansList,
  loadData,
  guardianConfig,
  isContractAddress,
  handleOpenModal,
}: {
  guardiansList: sdk.Guardian[]
  guardianConfig: any
  isContractAddress: boolean
  loadData: () => Promise<void>
  handleOpenModal: (props: { step: GuardianStep; options?: any }) => void
}) => {
  const { t } = useTranslation()
  const { account } = useAccount()
  const { chainId } = useSystem()
  const [isFirstTime, setIsFirstTime] = React.useState<boolean>(true)
  const [selected, setSelected] = React.useState<sdk.Guardian | undefined>()
  const [openCode, setOpenCode] = React.useState(false)

  const { defaultNetwork } = useSettings()
  const network = MapChainId[defaultNetwork] ?? MapChainId[1]
  const networkName: sdk.NetworkWallet = ['ETHEREUM', 'GOERLI'].includes(network)
    ? sdk.NetworkWallet.ETHEREUM
    : sdk.NetworkWallet[network]

  const submitApprove = async (code: string, selected: sdk.Guardian) => {
    setOpenCode(false)
    handleOpenModal({
      step: GuardianStep.Approve_WaitForAuth,
      options: {
        approveRetry: () => {
          submitApprove(code, selected)
        },
      },
    })
    if (LoopringAPI.walletAPI && selected) {
      const { contractType } = await LoopringAPI.walletAPI.getContractType({
        wallet: selected.address,
        network: networkName,
      })
      let isContract1XAddress = undefined,
        guardianModuleAddress = undefined,
        guardians = undefined
      if (contractType && contractType.contractVersion?.startsWith('V1_')) {
        isContract1XAddress = true
        const walletModule = guardianConfig?.supportContracts?.find((item: any) => {
          return item.contractName === 'GUARDIAN_MODULE'
        })
        guardianModuleAddress = walletModule?.contractAddress
      } else if (contractType && contractType.walletType === 0) {
        guardians = []
      }
      const request: sdk.ApproveSignatureRequest = {
        approveRecordId: selected.id,
        txAwareHash: selected.messageHash,
        securityNumber: code,
        signer: account.accAddress,
        signature: '',
        network: networkName,
      }
      LoopringAPI.walletAPI
        .submitApproveSignature(
          {
            request: request,
            guardian: selected,
            web3: connectProvides.usedWeb3 as any,
            chainId: chainId as any,
            eddsaKey: '',
            apiKey: '',
            isHWAddr: !isFirstTime,
            walletType: account.connectName as any,
          },
          guardians,
          isContract1XAddress,
          contractType?.masterCopy ?? undefined,
          guardianModuleAddress ?? undefined,
        )
        .then((response) => {
          if ((response as sdk.RESULT_INFO).code !== 0) {
            handleOpenModal({
              step: GuardianStep.Approve_Failed,
              options: {
                error: response,
              },
            })
          } else {
            handleOpenModal({
              step: GuardianStep.Approve_Success,
            })
            loadData()
          }
        })
        .catch((error: any) => {
          setIsFirstTime((state) => !state)
          const errorItem = SDK_ERROR_MAP_TO_UI[error?.code ?? 700001]
          handleOpenModal({
            step: GuardianStep.Approve_Failed,
            options: {
              error: errorItem ? t(errorItem.messageKey, { ns: 'error' }) : error.message,
            },
          })
        })
    }
  }
  const handleReject = (guardian: sdk.Guardian) => {
    handleOpenModal({
      step: GuardianStep.Reject_WaitForAuth,
      options: {
        approveRetry: () => {
          handleReject(guardian)
        },
      },
    })
    if (LoopringAPI.walletAPI && guardian) {
      const request = {
        approveRecordId: guardian.id,
        signer: account.accAddress,
        network: networkName,
      }
      LoopringAPI.walletAPI
        .rejectHebao({
          request,
          web3: connectProvides.usedWeb3 as any,
          address: account.accAddress,
          chainId: chainId as any,
          guardiaContractAddress: guardian.address,
          walletType: account.connectName as any,
        })
        .then((response) => {
          if ((response as sdk.RESULT_INFO).code || (response as sdk.RESULT_INFO).message) {
            handleOpenModal({
              step: GuardianStep.Reject_Failed,
              options: {
                error: response,
              },
            })
          } else {
            handleOpenModal({
              step: GuardianStep.Approve_Success,
            })
            loadData()
          }
        })
        .catch((error: any) => {
          const errorItem = SDK_ERROR_MAP_TO_UI[error?.code ?? 700001]
          handleOpenModal({
            step: GuardianStep.Approve_Failed,
            options: {
              error: errorItem ? t(errorItem.messageKey, { ns: 'error' }) : error.message,
            },
          })
        })
    }
  }
  const handleOpenApprove = (guardian: sdk.Guardian) => {
    if (isContractAddress && guardian.type !== 'recovery') {
      // setNotSupportOpen(true)
      return
    }
    setOpenCode(true)
    setSelected(guardian)
  }
  return (
    <>
      <Modal open={openCode} onClose={() => setOpenCode(false)}>
        <SwitchPanelStyled>
          <Box display={'flex'} flexDirection={'column'}>
            <ModalCloseButton onClose={() => setOpenCode(false)} t={t as any} />
            <Typography component={'p'} textAlign={'center'} marginBottom={2} paddingX={2}>
              <Typography
                color={'var(--color-text-primary)'}
                component={'p'}
                variant={'h4'}
                marginBottom={2}
              >
                {t('labelWalletInputGuardianCode')}
              </Typography>
              <Typography
                color={'var(--color-text-secondary)'}
                component={'p'}
                variant={'body1'}
                marginBottom={2}
              >
                {t('labelWalletInputGuardianCodeDes')}
              </Typography>
            </Typography>
            <Box paddingBottom={3}>
              <Box display={'flex'} alignItems={'center'} justifyContent={'center'}>
                <InputCode
                  length={VCODE_UNIT}
                  onComplete={(code) => submitApprove(code, selected!)}
                  loading={false}
                />
              </Box>
              <Box display={'flex'} marginTop={4} marginX={2} justifyContent={'center'}>
                <Button
                  fullWidth
                  variant={'contained'}
                  size={'small'}
                  color={'primary'}
                  onClick={() => setOpenCode(false)}
                >
                  <Typography paddingX={2}> {t('labelCancel')}</Typography>
                </Button>
              </Box>
            </Box>
          </Box>
        </SwitchPanelStyled>
      </Modal>
      {guardiansList.length !== 0 ? (
        <Box height={'320px'} overflow='scroll'>
          {guardiansList.map((guardian, index) => {
            return (
              <Box
                key={guardian.address + index}
                display={'flex'}
                alignItems={'center'}
                justifyContent={'space-between'}
                marginBottom={2}
              >
                <Box>
                  <Typography variant={'body1'}>
                    <Trans
                      i18nKey={'labelWalletSignType'}
                      tOptions={{ type: t('labelTxGuardian_' + guardian.type) }}
                    >
                      Request for {guardian.type?.replace('_', ' ').toUpperCase() ?? 'Unknown'}
                    </Trans>
                  </Typography>
                  <Typography variant={'body1'}>
                    {guardian.ens ? `${guardian.ens} /` : ''}
                    <Typography
                      title={guardian.address}
                      component={'span'}
                      color={'var(--color-text-third)'}
                    >
                      {guardian.address &&
                        `${guardian.address.slice(0, 6)}...${guardian.address.slice(
                          guardian.address.length - 4,
                        )}`}
                    </Typography>
                  </Typography>
                </Box>
                <Box>
                  <Box display={'inline-block'} marginRight={2}>
                    <Button
                      variant={'outlined'}
                      size={'medium'}
                      onClick={() => {
                        handleOpenApprove(guardian)
                      }}
                    >
                      {t('labelApprove')}
                    </Button>
                  </Box>
                  <Button
                    onClick={() => handleReject(guardian)}
                    variant={'outlined'}
                    size={'medium'}
                  >
                    Reject
                  </Button>
                </Box>
              </Box>
            )
          })}
        </Box>
      ) : (
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
      )}
    </>
  )
}
