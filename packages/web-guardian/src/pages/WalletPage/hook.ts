import React from 'react'
import { layer1Store, LoopringAPI, store, useAccount, useSystem } from '@loopring-web/core'

import { Layer1Action, MapChainId, myLog, SagaStatus } from '@loopring-web/common-resources'

import * as sdk from '@loopring-web/loopring-sdk'

import { GuardianStep, useSettings } from '@loopring-web/component-lib'
import { AvaiableNetwork } from '@loopring-web/web3-provider'

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
  CALL_CONTRACT_WA = 62,
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
  const [loopringSmartContractWallet, setLoopringSmartContractWallet] =
    React.useState<boolean | undefined>(undefined)
  const [nonLoopringSmartContractWallet, setNonLoopringSmartContractWallet] =
    React.useState<boolean | undefined>(undefined)

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
  const [openHebao, setOpenHebao] = React.useState<{
    isShow: boolean
    step: GuardianStep
    options?: any
  }>({
    isShow: false,
    step: GuardianStep.LockAccount_WaitForAuth,
    options: undefined,
  })
  const { clearOneItem } = layer1Store.useLayer1Store()
  // const { chainId } = useSystem()
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
              protector.protectorArray.map((props) => {
                if (
                  layer1ActionHistory[defaultNetwork] &&
                  layer1ActionHistory[defaultNetwork][Layer1Action.GuardianLock] &&
                  layer1ActionHistory[defaultNetwork][Layer1Action.GuardianLock][props.address] &&
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
              return protector
            }),
          // api/wallet/v3/operationLogs
          LoopringAPI.walletAPI
            .getGuardianApproveList({
              guardian: account.accAddress,
              network: networkName,
            })
            .then((guardian) => {
              guardian?.guardiansArray.map((ele) => {
                ele.businessDataJson = JSON.parse(ele.businessDataJson ?? '')
                return ele
              })
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
            myLog(error)
            setIsLoading(false)
          })
          .finally(() => {
            setIsLoading(false)
          })

      const _guardiansList: G[] = guardian?.guardiansArray
        ? guardian.guardiansArray.reduce((prev: G[], approve: G) => {
            const _protector = protector.protectorArray?.find(
              ({ address: pAddress }: any) => pAddress === approve.address,
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
    openHebao,
    operationLogList,
    setOpenHebao,
    isLoading,
    setIsLoading,
    loadData,
  }
}
