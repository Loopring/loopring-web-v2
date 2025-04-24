import { useHistory, useRouteMatch } from 'react-router-dom'
import React from 'react'
import {
  confirmation,
  store,
  useVaultAccountInfo,
  useVaultMap,
} from '@loopring-web/core'
import {
  RouterPath,
  VaultKey,
  SagaStatus,
  RecordTabIndex,
} from '@loopring-web/common-resources'
import { useOpenModals } from '@loopring-web/component-lib'
import { useConfirmation } from '@loopring-web/core/src/stores/localStore/confirmation'
import { VaultAccountStatus } from '@loopring-web/loopring-sdk'

export const useVaultPage = () => {
  const VaultPath = `${RouterPath.vault}/:item`
  let match: any = useRouteMatch(VaultPath)
  const history = useHistory()
  const vaultAccountInfo = useVaultAccountInfo()
  const { status: vaultStatus, getVaultMap, marketArray } = useVaultMap()
  const [tabIndex, setTabIndex] = React.useState<VaultKey | undefined>(() => {
    return (
      Object.values(VaultKey).find(
        (item) => item.toLowerCase() === match?.params?.item?.toLowerCase(),
      ) ?? undefined
    )
  })

  const {
    setShowVaultJoin,
    setShowConfirmedVault,
    modals: { isShowConfirmedVault },
  } = useOpenModals()
  const { setConfirmedOpenVaultPosition } = useConfirmation()

  const [error, setError] = React.useState(false)
  const [showLeverage, setShowLeverage] = React.useState({ show: false, closeAfterChange: false })

  React.useEffect(() => {
    const { marketArray } = store.getState().invest.vaultMap
    if (vaultStatus === SagaStatus.UNSET && marketArray?.length) {
      setError(false)
    } else if (vaultStatus === SagaStatus.ERROR) {
      setError(true)
    }
  }, [vaultStatus])

  const handleTabChange = (_e: any, value: VaultKey) => {
    history.push(`${RouterPath.vault}/${value}`)
  }
  React.useEffect(() => {
    setTabIndex(
      Object.values(VaultKey).find(
        (item) => item.toLowerCase() === match?.params?.item?.toLowerCase(),
      )
    )
  }, [match?.params?.item])

  const handleConfirmVaultRiskClose = (_e: any, isAgree: boolean) => {
    if (!isAgree) {
      history.push(`${RouterPath.vault}/${VaultKey.VAULT_DASHBOARD}`)
      setShowConfirmedVault({ isShow: false })
    } else {
      history.push(`${RouterPath.vault}/${VaultKey.VAULT_DASHBOARD}`)
      setConfirmedOpenVaultPosition()
      setShowVaultJoin({ isShow: true, info: { isActiveAccount: true } })
      setShowConfirmedVault({ isShow: false })
    }
  }

  const toggleLeverage = () => {
    setShowLeverage({ show: !showLeverage.show, closeAfterChange: true })
  }

  const closeLeverage = () => {
    setShowLeverage({ show: false, closeAfterChange: false })
  }

  const handleRecordClick = () => {
    history.push(`${RouterPath.l2records}/${RecordTabIndex.VaultRecords}`)
  }

  const handleTutorialClick = () => {
    window.open(`${LOOPRING_DOCUMENT}vault_tutorial_en.md`, '_blank')
    window.opener = null
  }

  return {
    tabIndex: tabIndex
      ? tabIndex
      : vaultAccountInfo?.vaultAccountInfo?.accountStatus === VaultAccountStatus.IN_STAKING
      ? VaultKey.VAULT_DASHBOARD
      : VaultKey.VAULT_TRADE,
    error,
    showLeverage,
    isShowConfirmedVault,
    vaultAccountInfo,
    marketArray,
    getVaultMap,
    handleTabChange,
    handleConfirmVaultRiskClose,
    toggleLeverage,
    closeLeverage,
    handleRecordClick,
    handleTutorialClick,
  }
}
