import { useMemo, useState, useEffect, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { Web3Provider } from '@ethersproject/providers'
import { Web3ReactContextInterface } from '@web3-react/core/dist/types'

import { useWeb3React } from '@web3-react/core'

import { isMobile } from 'react-device-detect'

import { injected } from 'networks/web3_connectors'

import { ChainId, ConnectorNames, NetworkContextName } from 'loopring-sdk'
import { myLog } from 'utils/log_tools'
import { setConnectName } from 'stores/account/reducer'
import { UserStorage } from 'storage'

export function useActiveWeb3React(): Web3ReactContextInterface<Web3Provider> & { chainId?: ChainId } {
  const context = useWeb3React<Web3Provider>()
  const contextNetwork = useWeb3React<Web3Provider>(NetworkContextName)
  return context.active ? context : contextNetwork
}

export function useEtherscan() {
  const { chainId } = useActiveWeb3React()

  const [etherscanUrl, setEtherscanUrl] = useState<string>('')

  useEffect(() => {
    switch(chainId) {
      case ChainId.MAINNET:
        setEtherscanUrl('https://etherscan.io/address/')
        break
      default:
        setEtherscanUrl('https://goerli.etherscan.io/address/')
    }
  }, [chainId])

  return {
    etherscanUrl,
  }
}

export function useEagerConnect() {

  const { activate, active } = useWeb3React()

  const [tried, setTried] = useState(false)

  const dispatch = useDispatch()

  useEffect(() => {
    injected.isAuthorized().then((isAuthorized: boolean) => {
      if (isAuthorized) {
        myLog('useEagerConnect isAuthorized')
        activate(injected, undefined, true).then(() => {
          myLog('-------------------->>>>>>>dispatch 1')
          UserStorage.setConnectorName(ConnectorNames.Injected)
        }).catch(() => {
          setTried(true)
        })
      } else {
        if (isMobile && window.ethereum) {
          activate(injected, undefined, true).then(() => {
            myLog('-------------------->>>>>>>dispatch 2')
            UserStorage.setConnectorName(ConnectorNames.Injected)
          }).catch(() => {
            setTried(true)
          })
        } else {
          setTried(true)
        }
      }
    })
  }, [activate, dispatch]) // intentionally only running on mount (make sure it's only mounted once :))

  // if the connection worked, wait until we get confirmation of that to flip the flag
  useEffect(() => {
    if (active) {
      setTried(true)
    }
  }, [active])

  return tried
}

export function useInactiveListener(onReConnectInjected: any = undefined, suppress: boolean = false) {
  const { active, error, activate, } = useWeb3React()

  useEffect((): any => {
    const { ethereum } = window as any

    const reConnectInjected = () => {
      activate(injected)
      if (onReConnectInjected) {
        onReConnectInjected()
      }
    }

    if (ethereum && ethereum.on && !active && !error && !suppress) {

      const handleChainChanged = (chainId: string | number) => {
        myLog('Handling \'chainChanged\' event with payload', chainId)
        reConnectInjected()
      }
      const handleAccountsChanged = (accounts: string[]) => {
        myLog('---------------------------------------------')
        myLog('Handling \'accountsChanged\' event with payload', accounts)
        if (accounts.length > 0) {
          reConnectInjected()
        }
      }

      ethereum.on('chainChanged', handleChainChanged)
      ethereum.on('accountsChanged', handleAccountsChanged)

      return () => {
        if (ethereum.removeListener) {
          ethereum.removeListener('chainChanged', handleChainChanged)
          ethereum.removeListener('accountsChanged', handleAccountsChanged)
        }
      }
    }
  }, [active, error, suppress, activate, onReConnectInjected])
}

export function useBlockNumber() {
  const { library, chainId } = useActiveWeb3React()

  const [blockNumber, setBlockNumber] = useState<number>()

  useEffect((): any => {
      if (!!library) {
          let stale = false

          library
              .getBlockNumber()
              .then((blockNumber: number) => {
                  if (!stale) {
                      setBlockNumber(blockNumber)
                  }
              })
              .catch(() => {
                  if (!stale) {
                      setBlockNumber(-1)
                  }
              })

          const updateBlockNumber = (blockNumber: number) => {
              setBlockNumber(blockNumber)
          }
          library.on('block', updateBlockNumber)

          return () => {
              stale = true
              library.removeListener('block', updateBlockNumber)
              setBlockNumber(undefined)
          }
      }
  }, [library, chainId])

  return {
      blockNumber,
  }
}

export function useBalance() {
  const { account, library, chainId } = useActiveWeb3React()

  const [balance, setBalance] = useState<number>()
  useEffect((): any => {
      if (!!account && !!library) {
          let stale = false

          library
              .getBalance(account)
              .then((balance: any) => {
                  if (!stale) {
                      setBalance(balance)
                  }
              })
              .catch(() => {
                  if (!stale) {
                      setBalance(0)
                  }
              })

          return () => {
              stale = true
              setBalance(0)
          }
      }
  }, [account, library, chainId]) // ensures refresh if referential identity of library doesn't change across chainIds

  return {
      balance,
  }
}
