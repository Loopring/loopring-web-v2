import React from 'react'
import { AccountStatus, SagaStatus } from '@loopring-web/common-resources'
import {
  useWalletLayer1,
  useWalletLayer2,
  useAccount,
  useUserRewards,
  useConnect,
  useWalletLayer2NFT,
  useWalletL2NFTCollection,
  useWalletL2Collection,
  useVaultLayer2,
  redPacketHistory,
  offFaitService,
  store,
  useContacts,
  useNotify,
  useSocket,
  useVaultTicker,
} from '@loopring-web/core'

export function useAccountInit({ state }: { state: keyof typeof SagaStatus }) {
  useConnect({ state })
  const { sendSocketTopic, socketUserEnd } = useSocket()
  const {
    updateWalletLayer1,
    status: walletLayer1Status,
    statusUnset: wallet1statusUnset,
  } = useWalletLayer1()

  const {
    updateVaultLayer2,
    status: vaultLayer2Status,
    statusUnset: vaultsLayer2Unset,
  } = useVaultLayer2()
  const { status: vaultTickerStatus, statusUnset: vaultTickerUnset } = useVaultTicker()

  const {
    resetLayer2NFT,
    status: wallet2statusNFTStatus,
    statusUnset: wallet2statusNFTUnset,
  } = useWalletLayer2NFT()
  const {
    getUserRewards,
    status: userRewardsStatus,
    statusUnset: userRewardsUnset,
  } = useUserRewards()
  const {
    updateWalletLayer2,
    status: walletLayer2Status,
    statusUnset: wallet2statusUnset,
  } = useWalletLayer2()
  const { updateContacts, status: contactsStatus, statusUnset: contactsUnset } = useContacts()
  const { getUserNotify, restUerNotify } = useNotify()

  const {
    updateWalletL2Collection,
    updateLegacyContracts,
    resetL2Collection,
    status: walletL2CollectionStatus,
    statusUnset: walletL2CollectionstatusUnset,
  } = useWalletL2Collection()

  const {
    updateWalletL2NFTCollection,
    resetL2NFTCollection,
    status: walletL2NFTCollectionStatus,
    statusUnset: walletL2NFTCollectionstatusUnset,
  } = useWalletL2NFTCollection()
  const { clearRedPacketHash } = redPacketHistory.useRedPacketHistory()
  const { account, status: accountStatus } = useAccount()

  React.useEffect(() => {
    if (accountStatus === SagaStatus.UNSET && state === SagaStatus.DONE) {
      offFaitService.banxaEnd()
      const account = store.getState().account
      switch (account.readyState) {
        case AccountStatus.UN_CONNECT:
        case AccountStatus.ERROR_NETWORK:
          socketUserEnd()
          break
        case AccountStatus.DEPOSITING:
        case AccountStatus.NOT_ACTIVE:
        case AccountStatus.LOCKED:
        case AccountStatus.NO_ACCOUNT:
          if (walletLayer1Status !== SagaStatus.PENDING) {
            updateWalletLayer1()
          }
          if (walletLayer2Status !== SagaStatus.PENDING) {
            updateWalletLayer2()
            resetLayer2NFT()
            resetL2NFTCollection()
            resetL2Collection()
            restUerNotify()
          }
          socketUserEnd()
          break
        case AccountStatus.ACTIVATED:
          getUserRewards()
          clearRedPacketHash()
          offFaitService.backendCheckStart()
          if (walletLayer1Status !== SagaStatus.PENDING) {
            updateWalletLayer1()
          }
          if (walletLayer2Status !== SagaStatus.PENDING) {
            updateWalletLayer2()
            updateVaultLayer2({})
            updateWalletL2NFTCollection({ page: 1 })
            updateWalletL2Collection({ page: 1 })
          }
          sendSocketTopic({})
          updateLegacyContracts()
          updateContacts()
          getUserNotify()
          break
      }
    }
  }, [accountStatus, state, account.readyState])
  React.useEffect(() => {
    switch (walletLayer1Status) {
      case SagaStatus.ERROR:
        wallet1statusUnset()
        break
      case SagaStatus.DONE:
        wallet1statusUnset()
        break
      default:
        break
    }
  }, [walletLayer1Status])
  React.useEffect(() => {
    switch (walletLayer2Status) {
      case SagaStatus.ERROR:
        wallet2statusUnset()
        break
      case SagaStatus.DONE:
        wallet2statusUnset()
        break
      default:
        break
    }
  }, [walletLayer2Status])

  React.useEffect(() => {
    switch (vaultLayer2Status) {
      case SagaStatus.ERROR:
        vaultsLayer2Unset()
        break
      case SagaStatus.DONE:
        vaultsLayer2Unset()
        break
      default:
        break
    }
  }, [vaultLayer2Status])
  React.useEffect(() => {
    switch (vaultTickerStatus) {
      case SagaStatus.ERROR:
        vaultTickerUnset()
        break
      case SagaStatus.DONE:
        vaultTickerUnset()
        break
      default:
        break
    }
  }, [vaultTickerStatus])

  React.useEffect(() => {
    switch (walletL2CollectionStatus) {
      case SagaStatus.ERROR:
        walletL2CollectionstatusUnset()
        break
      case SagaStatus.DONE:
        walletL2CollectionstatusUnset()
        break
      default:
        break
    }
  }, [walletL2CollectionStatus])
  React.useEffect(() => {
    switch (walletL2NFTCollectionStatus) {
      case SagaStatus.ERROR:
        walletL2NFTCollectionstatusUnset()
        break
      case SagaStatus.DONE:
        walletL2NFTCollectionstatusUnset()
        break
      default:
        break
    }
  }, [walletL2NFTCollectionStatus])
  React.useEffect(() => {
    switch (wallet2statusNFTStatus) {
      case SagaStatus.ERROR:
        wallet2statusNFTUnset()
        break
      case SagaStatus.DONE:
        wallet2statusNFTUnset()
        break
      default:
        break
    }
  }, [wallet2statusNFTStatus])
  React.useEffect(() => {
    switch (userRewardsStatus) {
      case SagaStatus.ERROR:
        console.log('Network ERROR::', 'ammpoolAPI getAmmPoolUserRewards')
        userRewardsUnset()
        break
      case SagaStatus.DONE:
        userRewardsUnset()
        break
      default:
        break
    }
  }, [userRewardsStatus])
  React.useEffect(() => {
    switch (contactsStatus) {
      case SagaStatus.ERROR:
        contactsUnset()
        break
      case SagaStatus.DONE:
        contactsUnset()
        break
      default:
        break
    }
  }, [contactsStatus])
}
