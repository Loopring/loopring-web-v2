import React from 'react'

import { connectProvides } from '@loopring-web/web3-provider'
import { AddressError } from 'defs/common_defs'
import { checkAddr } from 'utils/web3_tools'
import { LoopringAPI } from 'api_wrapper'

export const useAddressCheck = () => {

    const [address, setAddress,] = React.useState<string>('')

    const [realAddr, setRealAddr,] = React.useState<string>('')

    const [addrStatus, setAddrStatus,] = React.useState<AddressError>(AddressError.NoError)

    const [isAddressCheckLoading, setIsAddressCheckLoading] = React.useState(false)

    const [isLoopringAddress, setIsLoopringAddress] = React.useState(true)

    const check = React.useCallback(async(address: any, web3: any) => {

        const { realAddr, addressErr, } = await checkAddr(address, web3)

        setRealAddr(realAddr)

        setAddrStatus(addressErr)

        return {
            lastAddress: realAddr || address,
            addressErr,
        }

    }, [setRealAddr, setAddrStatus, ])

    const debounceCheck = async() => {
        setIsAddressCheckLoading(true)
        const {addressErr, lastAddress} = await check(address, connectProvides.usedWeb3)
        // check whether the address belongs to loopring layer2
        if (LoopringAPI && LoopringAPI.exchangeAPI && addressErr === AddressError.NoError && lastAddress) {
            const res = await LoopringAPI.exchangeAPI?.getAccount({ owner: lastAddress }) // ENS or address
            if (res && !res.error) {
                setIsLoopringAddress(true)
            } else {
                setIsLoopringAddress(false)
            }
        }
        setIsAddressCheckLoading(false)
    }

    React.useEffect(() => {
        debounceCheck()
    }, [address, connectProvides.usedWeb3, ])

    return {
        address,
        realAddr,
        setAddress,
        addrStatus,
        isAddressCheckLoading,
        isLoopringAddress,
    }

}