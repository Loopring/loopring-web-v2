import React from 'react'
import {
  callSwitchChain,
  layer1Store,
  LoopringAPI,
  store,
  useAccount,
  useSystem,
} from '@loopring-web/core'

import {
  Layer1Action,
  MapChainId,
  myLog,
  SagaStatus,
  SDK_ERROR_MAP_TO_UI,
} from '@loopring-web/common-resources'

import * as sdk from '@loopring-web/loopring-sdk'

import { GuardianStep, useSettings } from '@loopring-web/component-lib'
import { connectProvides,AvaiableNetwork } from '@loopring-web/web3-provider'
import { useTranslation } from 'react-i18next'

export enum TxGuardianHistoryType {
  ADD_GUARDIAN = 51,
  GUARDIAN_CONFIRM_ADDITION = 52,
  GUARDIAN_REJECT_ADDITION = 53,
  GUARDIAN_APPROVE = 54,
  APPROVE_RECOVER = 55, // RECOVER  16
  APPROVE_TRANSFER = 56, // APPROVE TRANSFER 18
  APPROVE_TOKEN_APPROVE = 57, // 23
  ADD_GUARDIAN_WA = 58, // 34
  REMOVE_GUARDIAN_WA = 59, // 35
  UNLOCK_WALLET_WA = 60, // 37
  RESET_GUARDIANS_WA = 61, // 200
  CALL_CONTRACT_WA = 62, //201
}

export enum TxHebaoAction {
  Approve,
  Reject,
}

export const useHebaoMain = <
  T extends sdk.Protector,
  G extends sdk.Guardian,
  H extends sdk.HebaoOperationLog,
>() => {
  const { account, status: accountStatus } = useAccount()
  const [loopringSmartContractWallet, setLoopringSmartContractWallet] = React.useState<
    boolean | undefined
  >(undefined)
  const [nonLoopringSmartContractWallet, setNonLoopringSmartContractWallet] = React.useState<
    boolean | undefined
  >(undefined)

  const [{ guardianConfig, protectList, guardiansList, operationLogList }, setList] =
    React.useState<{
      guardianConfig: any
      protectList: T[]
      guardiansList: G[]
      operationLogList: H[]
    }>({
      protectList: [],
      guardiansList: [],
      operationLogList: [],
      guardianConfig: {},
    })

  const { clearOneItem } = layer1Store.useLayer1Store()
  const [isLoading, setIsLoading] = React.useState(false)
  const { defaultNetwork } = useSettings()
  const network = MapChainId[defaultNetwork] ?? MapChainId[1]
  const networkName: sdk.NetworkWallet = ['ETHEREUM', 'GOERLI'].includes(network)
    ? sdk.NetworkWallet.ETHEREUM
    : sdk.NetworkWallet[network]
  // sdk.NetworkWallet[MapChainId[AvaiableNetwork.includes(chainId.toString()) ? chainId : 1]]
  const loadData = React.useCallback(async () => {
    const layer1ActionHistory = store.getState().localStore.layer1ActionHistory
    if (LoopringAPI.walletAPI && account.accAddress) {
      setIsLoading(true)
      const [{ raw_data: guardianConfig }, protector, guardian, guardianoperationlog]: any =
        await Promise.all([
          LoopringAPI.walletAPI.getHebaoConfig({ network: networkName }),
          LoopringAPI.walletAPI
            .getProtectors(
              {
                guardian: account.accAddress,
                network: networkName,
              },
              account.apiKey,
            )
            .then((protector) => {
              if ((protector as sdk.RESULT_INFO)?.code) {
                throw protector
              }
              try {
                protector?.protectorArray?.map((props) => {
                  if (
                    layer1ActionHistory &&
                    layer1ActionHistory[defaultNetwork] &&
                    layer1ActionHistory[defaultNetwork][Layer1Action?.GuardianLock] &&
                    layer1ActionHistory[defaultNetwork][Layer1Action?.GuardianLock][
                      props.address
                    ] &&
                    props.lockStatus === sdk.HEBAO_LOCK_STATUS.CREATED
                  ) {
                    props.lockStatus = sdk.HEBAO_LOCK_STATUS.LOCK_WAITING
                  } else {
                    clearOneItem({
                      chainId: defaultNetwork as sdk.ChainId,
                      uniqueId: props.address,
                      domain: Layer1Action?.GuardianLock,
                    })
                  }

                  return props
                })
              } catch (error) {
                throw error
              }

              return protector
            }),
          // api/wallet/v3/operationLogs
          LoopringAPI.walletAPI
            .getGuardianApproveList({
              guardian: account.accAddress,
              network: networkName,
            })
            .then((guardian) => {
              if ((guardian as sdk.RESULT_INFO)?.code) {
                throw protector
              }
              try {
                guardian?.guardiansArray?.map((ele) => {
                  ele.businessDataJson = JSON.parse(ele.businessDataJson ?? '')
                  return ele
                })
              } catch (error) {
                throw error
              }
              return guardian
            }),
          LoopringAPI.walletAPI.getHebaoOperationLogs({
            from: account.accAddress,
            fromTime: 0,
            offset: 0,
            limit: 50,
            network: networkName,
          }),
        ])
          .catch((error) => {
            myLog('guardianConfig error', error)
            setIsLoading(false)
          })
          .finally(() => {
            setIsLoading(false)
          })

      const _guardiansList: G[] = guardian?.guardiansArray
        ? guardian.guardiansArray.reduce((prev: G[], approve: G) => {
            const _protector = protector.protectorArray?.find(
              ({ address: pAddress }: any) =>
                pAddress?.toLowerCase() === approve?.address?.toLowerCase(),
            )
            if (_protector) {
              // @ts-ignore
              approve.ens = _protector.ens
              return [...prev, approve] as G[]
            }
            return prev
          }, [] as G[])
        : []

      setList({
        protectList: protector.protectorArray ?? [],
        guardiansList: _guardiansList,
        operationLogList: guardianoperationlog?.operationArray ?? [],
        guardianConfig,
      })
    }
  }, [account.accAddress, account.apiKey, defaultNetwork, clearOneItem])

  React.useEffect(() => {
    if (account.accAddress && accountStatus === SagaStatus.UNSET) {
      loadData()
      LoopringAPI.walletAPI
        ?.getWalletType({
          wallet: account.accAddress,
          network: networkName,
        })
        .then(({ walletType }) => {
          setLoopringSmartContractWallet(
            walletType?.isInCounterFactualStatus ||
              (walletType?.isContract && walletType?.loopringWalletContractVersion !== ''),
          )
          setNonLoopringSmartContractWallet(
            walletType?.isContract && walletType?.loopringWalletContractVersion === '',
          )
        })
        .catch(() => {
          setNonLoopringSmartContractWallet(true)
        })
    }
  }, [accountStatus])
  return {
    loopringSmartContractWallet,
    nonLoopringSmartContractWallet,
    protectList,
    guardiansList,
    guardianConfig,
    // openHebao,
    operationLogList,
    // setOpenHebao,
    isLoading,
    setIsLoading,
    loadData,
  }
}

export const useAction = ({
  setSelected,
  setOpenCode,
  guardianConfig,
  isContractAddress,
  loadData,
  handleOpenModal,
}: {
  setSelected: (state: sdk.Guardian | undefined) => void
  setOpenCode: (state: boolean) => void
  guardianConfig: any
  isContractAddress: boolean
  loadData: () => Promise<void>
  handleOpenModal: (props: { step: GuardianStep; options?: any }) => void
}) => {
  const { t } = useTranslation()
  const { account } = useAccount()
  const { defaultNetwork } = useSettings()
  const network = MapChainId[defaultNetwork] ?? MapChainId[1]
  const [isFirstTime, setIsFirstTime] = React.useState<boolean>(true)

  const networkName: sdk.NetworkWallet = ['ETHEREUM', 'GOERLI'].includes(network)
    ? sdk.NetworkWallet.ETHEREUM
    : sdk.NetworkWallet[network]
  const submitApprove = async (code: string, selected: sdk.Guardian) => {
    setOpenCode(false)
    handleOpenModal({
      step: GuardianStep.Approve_WaitForAuth,
      options: {
        lockRetry: () => {
          submitApprove(code, selected)
        },
      },
    })
    if (LoopringAPI.walletAPI && selected && connectProvides.usedWeb3) {
      try {
        const [{ contractType }, _chainId] = await Promise.all([
          LoopringAPI.walletAPI.getContractType({
            wallet: selected.address,
            network: networkName,
          }),
          connectProvides.usedWeb3.eth.getChainId(),
        ])

        await callSwitchChain(_chainId)
        let isContract1XAddress: any = undefined,
          guardianModuleAddress: any = undefined
        // guardians: any = undefined
        if (contractType && contractType.contractVersion?.startsWith('V1_')) {
          isContract1XAddress = true
          const walletModule = guardianConfig?.supportContracts?.find((item: any) => {
            return item.contractName === 'GUARDIAN_MODULE'
          })
          guardianModuleAddress = walletModule?.contractAddress
        }
        // else if (contractType && contractType.walletType === 0) {
        //   guardians = []
        // }
        const request: sdk.ApproveSignatureRequest = {
          approveRecordId: selected.id,
          txAwareHash: selected.messageHash,
          securityNumber: code,
          signer: account.accAddress,
          signature: '',
          network: networkName,
        }
        const response = await LoopringAPI.walletAPI.submitApproveSignature(
          {
            request: request,
            guardian: { ...selected, type: sdk.HEBAO_META_TYPE[selected.type] as any },
            web3: connectProvides.usedWeb3 as any,
            chainId: _chainId,
            eddsaKey: '',
            apiKey: '',
            isHWAddr: false, // !isFirstTime,
            walletType: account.connectName as any,
          },
          [],
          isContract1XAddress,
          contractType?.masterCopy ?? undefined,
          guardianModuleAddress ?? undefined,
        )
        // .then((response) => {
        if ((response as sdk.RESULT_INFO).code !== 0) {
          handleOpenModal({
            step: GuardianStep.Approve_Failed,
            options: {
              error: response,
              lockRetry: () => {
                submitApprove(code, selected)
              },
            },
          })
        } else {
          handleOpenModal({
            step: GuardianStep.Approve_Success,
          })
          loadData()
        }
      } catch (error: any) {
        setIsFirstTime((state) => !state)
        const errorItem = SDK_ERROR_MAP_TO_UI[error?.code ?? 700001]
        handleOpenModal({
          step: GuardianStep.Approve_Failed,
          options: {
            error: errorItem ? t(errorItem.messageKey, { ns: 'error' }) : error.message,
            lockRetry: () => {
              submitApprove(code, selected)
            },
          },
        })
      }
      // })
      // .catch((error: any) => {

      // })
    }
  }
  const handleReject = async (guardian: sdk.Guardian) => {
    handleOpenModal({
      step: GuardianStep.Reject_WaitForAuth,
      options: {
        lockRetry: () => {
          handleReject(guardian)
        },
      },
    })
    if (LoopringAPI.walletAPI && guardian && connectProvides.usedWeb3) {
      try {
        const _chainId = await connectProvides.usedWeb3.eth.getChainId()
        await callSwitchChain(_chainId)
        const request = {
          approveRecordId: guardian.id,
          signer: account.accAddress,
          network: networkName,
        }
        const response = await LoopringAPI.walletAPI.rejectHebao({
          request,
          web3: connectProvides.usedWeb3 as any,
          address: account.accAddress,
          chainId: _chainId as any,
          guardiaContractAddress: guardian.address,
          walletType: account.connectName as any,
        })
        // .then((response) => {
        if ((response as sdk.RESULT_INFO).code || (response as sdk.RESULT_INFO).message) {
          handleOpenModal({
            step: GuardianStep.Reject_Failed,
            options: {
              error: response,
              lockRetry: () => {
                handleReject(guardian)
              },
            },
          })
        } else {
          handleOpenModal({
            step: GuardianStep.Approve_Success,
          })
          loadData()
        }
        // })
      } catch (error: any) {
        const errorItem = SDK_ERROR_MAP_TO_UI[error?.code ?? 700001]
        handleOpenModal({
          step: GuardianStep.Approve_Failed,
          options: {
            error: errorItem ? t(errorItem.messageKey, { ns: 'error' }) : error.message,
            lockRetry: () => {
              handleReject(guardian)
            },
          },
        })
      }
    }
  }
  const handleOpenApprove = (guardian: sdk.Guardian) => {
    if (isContractAddress) {
      // setNotSupportOpen(true)
      return
    }
    setOpenCode(true)
    setSelected(guardian)
  }
  return {
    submitApprove,
    handleReject,
    handleOpenApprove,
  }
}

export const useHebaoProtector = <T extends sdk.Protector>({
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
  const onLock = React.useCallback(
    async (item: T) => {
      handleOpenModal({
        step: GuardianStep.LockAccount_WaitForAuth,
        options: {
          lockRetry: () => {
            onLock(item)
          },
          lockRetryParams: item,
        },
      })
      const config = guardianConfig.actionGasSettings.find(
        (item: any) => item.action === 'META_TX_LOCK_WALLET_WA',
      )
      const guardianModule = guardianConfig.supportContracts.find(
        (ele: any) => ele.contractName.toUpperCase() === 'GUARDIAN_MODULE',
      ).contractAddress

      if (LoopringAPI?.walletAPI && connectProvides.usedWeb3) {
        try {
          const [isVersion1, nonce, _chainId] = await Promise.all([
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
            await connectProvides.usedWeb3.eth.getChainId(),
          ])
          await callSwitchChain(_chainId)
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
          const { error } = await LoopringAPI.walletAPI.lockHebaoWallet(params)
          const errorItem = SDK_ERROR_MAP_TO_UI[error?.code ?? 700001]
          if (error) {
            handleOpenModal({
              step: GuardianStep.LockAccount_Failed,
              options: {
                error: errorItem ? t(errorItem.messageKey) : error.message,
                lockRetry: () => {
                  onLock(item)
                },
                lockRetryParams: item,
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
            options: {
              error: reason.message,
              lockRetry: () => {
                onLock(item)
              },
              lockRetryParams: item,
            },
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
