import { useMemo } from 'react'

import { Contract } from '@ethersproject/contracts'
import { exchange_abi, erc20_abi, deposit_abi } from 'loopring-sdk'

import { useActiveWeb3React } from 'hooks/web3/useWeb3'
import { getContract } from 'utils/web3_tools'

// returns null on errors
function useContract(address: string | undefined, ABI: any, withSignerIfPossible = true): Contract | null {
  const { library, account } = useActiveWeb3React()

  return useMemo(() => {
    if (!address || !ABI || !library) return null
    try {
      return getContract(address, ABI, library, withSignerIfPossible && account ? account : undefined)
    } catch (error) {
      console.error('Failed to get contract', error)
      return null
    }
  }, [address, ABI, library, withSignerIfPossible, account])
}

export function useExchangeContract(exchangeAddress: string) {
  const { chainId } = useActiveWeb3React()
  const contract = useContract(chainId && exchangeAddress, exchange_abi, false)
  return {
    contract,
  }
}

export function useDepositContract(depositAddress: string) {
  const { chainId } = useActiveWeb3React()
  const contract = useContract(chainId && depositAddress, deposit_abi, false)

  const deposit = () => {
    if (contract) {
    }
  }

  return {
    contract,
    deposit,
  }
}

export function useERC20Contract(address: string) {
  const contract = useContract(address, erc20_abi, false)
  return {
    contract,
  }
}
