import React from 'react'
import {
  useSystem,
  useAmmMap,
  useTokenMap,
  useAccount,
  useTicker,
  useAmmActivityMap,
  useTokenPrices,
  useAmount,
  useSocket,
  useNotify,
  layer1Store,
  useDefiMap,
  useInvestTokenTypeMap,
  useDualMap,
  useStakingMap,
  useBtradeMap,
  useVaultMap,
} from '@loopring-web/core'
import { ChainId } from '@loopring-web/loopring-sdk'
import { myLog, SagaStatus, SUPPORTING_NETWORKS, ThemeType } from '@loopring-web/common-resources'
import {
  ConnectProviders,
  ConnectProvides,
  connectProvides,
  walletServices,
} from '@loopring-web/web3-provider'
import { useAccountInit } from './hookAccountInit'
import { useSettings } from '@loopring-web/component-lib'
import { useTheme } from '@emotion/react'
import { useWeb3Modal, useWeb3ModalAccount } from '@web3modal/ethers5/react'

/**
 * @description
 * @step1 subscribe Connect hook
 * @step2 check the session storage ? choose the provider : none provider
 * @step3 decide china ID by step2
 * @step4 prepare the static date (tokenMap, ammMap, faitPrice, gasPrice, Activities ...)
 * @step5 launch the page
 */
export function useInit() {
  const [, search] = window.location?.hash.split('?') ?? []
  const searchParams = new URLSearchParams(search)
  const [, pathname1] = window.location.hash.match(/#\/([\w\d\-]+)\??/) ?? []
  const isNoServer: boolean =
    searchParams.has('noheader') && ['notification', 'document'].includes(pathname1)
  const [state, setState] = React.useState<keyof typeof SagaStatus>(() => {
    if (isNoServer) {
      return SagaStatus.DONE
    } else {
      return SagaStatus.PENDING
    }
  })
  const { isMobile, defaultNetwork } = useSettings()
  const theme = useTheme()

  const {
    account,
    updateAccount,
    resetAccount,
    status: accountStatus,
    statusUnset: accountStatusUnset,
  } = useAccount()
  const { status: tokenMapStatus, statusUnset: tokenMapStatusUnset } = useTokenMap()
  const { status: ammMapStatus, statusUnset: ammMapStatusUnset } = useAmmMap()
  const {
    status: tokenPricesStatus,
    getTokenPrices,
    statusUnset: tokenPricesUnset,
  } = useTokenPrices()
  const { status: defiMapStatus, statusUnset: defiMapStatusUnset } = useDefiMap()
  const { status: dualMapStatus, statusUnset: dualMapStatusUnset } = useDualMap()
  const { status: stakingMapStatus, statusUnset: stakingMapStatusUnset } = useStakingMap()
  const { status: btradeMapStatus, statusUnset: btradeMapStatusUnset } = useBtradeMap()
  const { status: investTokenTypeMapStatus, statusUnset: investTokenTypeMapStatusUnset } =
    useInvestTokenTypeMap()

  const { updateSystem, status: systemStatus, statusUnset: systemStatusUnset } = useSystem()
  const { status: ammActivityMapStatus, statusUnset: ammActivityMapStatusUnset } =
    useAmmActivityMap()
  const { status: tickerStatus, statusUnset: tickerStatusUnset } = useTicker()
  const { status: amountStatus, statusUnset: amountStatusUnset } = useAmount()
  const { status: socketStatus, statusUnset: socketUnset } = useSocket()
  const { circleUpdateLayer1ActionHistory } = layer1Store.useLayer1Store()
  const { status: notifyStatus, statusUnset: notifyStatusUnset } = useNotify()
  const { status: vaultStatus, statusUnset: vaultStatusUnset } = useVaultMap()
  const { chainId } =  useWeb3ModalAccount()
  React.useEffect(() => {
    ConnectProvides.walletConnectClientMeta = {
      ...ConnectProvides.walletConnectClientMeta,
      url:
        process?.env?.REACT_APP_WALLETCONNECTCLIENTMETA_URL ??
        ConnectProvides.walletConnectClientMeta.url,
      name:
        process?.env?.REACT_APP_WALLETCONNECTCLIENTMETA_NAME ??
        ConnectProvides.walletConnectClientMeta.name,
      description:
        process?.env?.REACT_APP_WALLETCONNECTCLIENTMETA_DESCRIPTION ??
        ConnectProvides.walletConnectClientMeta.description,
    }
    ;(async (account) => {
      if (
        account.accAddress !== ''
      ) {
        try {
          ConnectProvides.IsMobile = isMobile
          if (chainId) {
            updateAccount({})
            const _chainId = !SUPPORTING_NETWORKS
            .includes(chainId.toString())
              ? account._chainId && account._chainId !== 'unknown'
                ? account._chainId
                : ChainId.MAINNET
              : chainId
            circleUpdateLayer1ActionHistory({ chainId: _chainId })

            if (!isNoServer) {
              updateSystem({ chainId: _chainId as any })
            }
            return
          }
        } catch (error: any) {
          walletServices.sendDisconnect('', `error at init loading  ${error}, disconnect`)
          const chainId =
            account._chainId && account._chainId !== 'unknown' ? account._chainId : ChainId.MAINNET
          if (!isNoServer) {
            updateSystem({ chainId })
          }
        }
      } else {
        if (account.accAddress === '') {
          resetAccount()
        }
        const chainId = defaultNetwork
        if (!isNoServer) {
          updateSystem({ chainId })
        }
      }
    })(account)
  }, [chainId])
  React.useEffect(() => {
    switch (accountStatus) {
      case SagaStatus.ERROR:
        accountStatusUnset()
        setState('ERROR')
        break
      case SagaStatus.DONE:
        accountStatusUnset()
        break
      default:
        break
    }
  }, [accountStatus])
  React.useEffect(() => {
    switch (systemStatus) {
      case SagaStatus.PENDING:
        if (!searchParams.has('noheader') && state !== SagaStatus.PENDING) {
          setState(SagaStatus.PENDING)
        }
        break
      case SagaStatus.ERROR:
        systemStatusUnset()
        setState('ERROR')
        break
      case SagaStatus.DONE:
        systemStatusUnset()
        break
      default:
        break
    }
  }, [systemStatus])
  React.useEffect(() => {
    if (
      tokenMapStatus === SagaStatus.UNSET &&
      ammMapStatus === SagaStatus.UNSET &&
      tokenPricesStatus === SagaStatus.UNSET
    ) {
      setState('DONE')
    }
  }, [tokenMapStatus, ammMapStatus, tokenPricesStatus])
  React.useEffect(() => {
    switch (tokenMapStatus) {
      case SagaStatus.ERROR:
        tokenMapStatusUnset()
        setState('ERROR')
        break
      case SagaStatus.DONE:
        tokenMapStatusUnset()
        break
      default:
        break
    }
  }, [tokenMapStatus])
  React.useEffect(() => {
    switch (ammMapStatus) {
      case SagaStatus.ERROR:
        ammMapStatusUnset()
        setState('ERROR')
        break
      case SagaStatus.DONE:
        ammMapStatusUnset()
        break
      default:
        break
    }
  }, [ammMapStatus])

  React.useEffect(() => {
    switch (tokenPricesStatus) {
      case SagaStatus.ERROR:
        tokenPricesUnset()
        setState('ERROR')
        getTokenPrices()
        break
      case SagaStatus.DONE:
        tokenPricesUnset()
        break
      default:
        break
    }
  }, [tokenPricesStatus])
  React.useEffect(() => {
    switch (ammActivityMapStatus) {
      case SagaStatus.ERROR:
        console.log('Network ERROR::', 'getAmmPoolActivityRules')
        ammActivityMapStatusUnset()
        break
      case SagaStatus.DONE:
        ammActivityMapStatusUnset()
        break
      default:
        break
    }
  }, [ammActivityMapStatus])
  React.useEffect(() => {
    switch (tickerStatus) {
      case SagaStatus.ERROR:
        console.log('Network ERROR::', 'getMixTicker')
        tickerStatusUnset()
        break
      case SagaStatus.DONE:
        tickerStatusUnset()
        break
      default:
        break
    }
  }, [tickerStatus])
  React.useEffect(() => {
    switch (amountStatus) {
      case SagaStatus.ERROR:
        console.log('Network ERROR::', 'userAPI getMinimumTokenAmt')
        amountStatusUnset()
        break
      case SagaStatus.DONE:
        amountStatusUnset()
        break
      default:
        break
    }
  }, [amountStatus])
  React.useEffect(() => {
    switch (socketStatus) {
      case SagaStatus.ERROR:
        socketUnset()
        break
      case SagaStatus.DONE:
        socketUnset()
        break
      default:
        break
    }
  }, [socketStatus])
  React.useEffect(() => {
    switch (notifyStatus) {
      case SagaStatus.ERROR:
        notifyStatusUnset()
        break
      case SagaStatus.DONE:
        notifyStatusUnset()
        break
      default:
        break
    }
  }, [notifyStatus])

  React.useEffect(() => {
    switch (vaultStatus) {
      case SagaStatus.ERROR:
        vaultStatusUnset()
        break
      case SagaStatus.DONE:
        vaultStatusUnset()
        break
      default:
        break
    }
  }, [vaultStatus])

  // vaultStatus
  React.useEffect(() => {
    switch (defiMapStatus) {
      case SagaStatus.ERROR:
        defiMapStatusUnset()
        // setState("ERROR");
        break
      case SagaStatus.DONE:
        defiMapStatusUnset()
        break
      default:
        break
    }
  }, [defiMapStatus])

  React.useEffect(() => {
    switch (dualMapStatus) {
      case SagaStatus.ERROR:
        dualMapStatusUnset()
        // setState("ERROR");
        break
      case SagaStatus.DONE:
        dualMapStatusUnset()
        break
      default:
        break
    }
  }, [dualMapStatus])
  React.useEffect(() => {
    switch (stakingMapStatus) {
      case SagaStatus.ERROR:
        stakingMapStatusUnset()
        // setState("ERROR");
        break
      case SagaStatus.DONE:
        stakingMapStatusUnset()
        break
      default:
        break
    }
  }, [stakingMapStatus])
  React.useEffect(() => {
    switch (btradeMapStatus) {
      case SagaStatus.ERROR:
        btradeMapStatusUnset()
        // setState("ERROR");
        break
      case SagaStatus.DONE:
        btradeMapStatusUnset()
        break
      default:
        break
    }
  }, [btradeMapStatus])

  React.useEffect(() => {
    switch (investTokenTypeMapStatus) {
      case SagaStatus.ERROR:
        investTokenTypeMapStatusUnset()
        // setState("ERROR");
        break
      case SagaStatus.DONE:
        investTokenTypeMapStatusUnset()
        break
      default:
        break
    }
  }, [investTokenTypeMapStatus])

  useAccountInit({ state })
  return {
    state,
  }
}
