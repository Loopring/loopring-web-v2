// import { useHistory, useRouteMatch } from 'react-router-dom'
// import React from 'react'
// import {
//   confirmation,
//   store,
//   useAccountInfo,
//   useVaultMap,
// } from '@loopring-web/core'
// import {
//   RouterPath,
//   VaultKey,
//   SagaStatus,
//   RecordTabIndex,
// } from '@loopring-web/common-resources'
// import { useOpenModals } from '@loopring-web/component-lib'
// import { useConfirmation } from '@loopring-web/core/src/stores/localStore/confirmation'

// export const useVaultPage = () => {
//   const VaultPath = `${RouterPath.vault}/:item`
//   let match: any = useRouteMatch(VaultPath)
//   const history = useHistory()
//   const vaultAccountInfo = useAccountInfo()
//   const { status: vaultStatus, getVaultMap, marketArray } = useVaultMap()
//   const [tabIndex, setTabIndex] = React.useState<VaultKey>(() => {
//     return (
//       Object.values(VaultKey).find(
//         (item) => item.toLowerCase() == match?.params?.item?.toLowerCase(),
//       ) ?? VaultKey.VAULT_HOME
//     )
//   })

//   const {
//     setShowVaultJoin,
//     setShowConfirmedVault,
//     modals: { isShowConfirmedVault },
//   } = useOpenModals()
//   const { setConfirmedOpenVaultPosition } = useConfirmation()

//   const [error, setError] = React.useState(false)
//   const [showLeverage, setShowLeverage] = React.useState({ show: false, closeAfterChange: false })

//   React.useEffect(() => {
//     const { marketArray } = store.getState().invest.vaultMap
//     if (vaultStatus === SagaStatus.UNSET && marketArray?.length) {
//       setError(false)
//     } else if (vaultStatus === SagaStatus.ERROR) {
//       setError(true)
//     }
//   }, [vaultStatus])

//   React.useEffect(() => {
//     const item = Object.values(VaultKey).find(
//       (item) => item.toLowerCase() == match?.params?.item?.toLowerCase(),
//     )
//     setTabIndex(item ? item : VaultKey.VAULT_HOME)
//   }, [match?.params?.item])

//   const handleTabChange = (_e: any, value: VaultKey) => {
//     history.push(`${RouterPath.vault}/${value}`)
//   }

//   const handleConfirmVaultRiskClose = (_e: any, isAgree: boolean) => {
//     if (!isAgree) {
//       history.push(`${RouterPath.vault}/${VaultKey.VAULT_HOME}`)
//       setShowConfirmedVault({ isShow: false })
//     } else {
//       setConfirmedOpenVaultPosition()
//       setShowVaultJoin({ isShow: true, info: { isActiveAccount: true } })
//       setShowConfirmedVault({ isShow: false })
//     }
//   }

//   const toggleLeverage = () => {
//     setShowLeverage({ show: !showLeverage.show, closeAfterChange: true })
//   }

//   const closeLeverage = () => {
//     setShowLeverage({ show: false, closeAfterChange: false })
//   }

//   const handleRecordClick = () => {
//     history.push(`${RouterPath.l2records}/${RecordTabIndex.VaultRecords}`)
//   }

//   const handleTutorialClick = () => {
//     window.open(`${LOOPRING_DOCUMENT}vault_tutorial_en.md`, '_blank')
//     window.opener = null
//   }

//   return {
//     tabIndex,
//     error,
//     showLeverage,
//     isShowConfirmedVault,
//     vaultAccountInfo,
//     marketArray,
//     getVaultMap,
//     handleTabChange,
//     handleConfirmVaultRiskClose,
//     toggleLeverage,
//     closeLeverage,
//     handleRecordClick,
//     handleTutorialClick,
//   }
// }
