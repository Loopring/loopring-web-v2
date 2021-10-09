import React from 'react'

import { connectProvides } from '@loopring-web/web3-provider'
import { AddressError } from 'defs/common_defs'
import { checkAddr } from 'utils/web3_tools'

export const useAddressCheck = () => {

    const [address, setAddress,] = React.useState<string>('')

    const [realAddr, setRealAddr,] = React.useState<string>('')

    const [addrStatus, setAddrStatus,] = React.useState<AddressError>(AddressError.NoError)

    const check = React.useCallback(async(address: any, web3: any) => {

        const { realAddr, addressErr, } = await checkAddr(address, web3)

        setRealAddr(realAddr)

        setAddrStatus(addressErr)

    }, [setRealAddr, setAddrStatus, ])

    React.useEffect(() => {
        check(address, connectProvides.usedWeb3)
    }, [address, connectProvides.usedWeb3, setAddrStatus])

    return {
        address,
        realAddr,
        setAddress,
        addrStatus,
    }

}