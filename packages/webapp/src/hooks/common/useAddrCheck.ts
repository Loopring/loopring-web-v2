import React from 'react'

import { utils } from 'ethers'
import { dumpError400 } from 'loopring-sdk'
import { myLog } from 'utils/log_tools'

export enum AddressError {
    NoError,
    InvalidAddr,
}

export const useAddressCheck = () => {

    const [address, setAddress, ] = React.useState<string>('')

    const [addrStatus, setAddrStatus, ] = React.useState<AddressError>(AddressError.NoError)

    React.useEffect(() => {

        if (address) {
            try {
                const addr = utils.getAddress(address)
                setAddrStatus(AddressError.NoError)
                return
            } catch (reason) {
            }
        }
        
        setAddrStatus(AddressError.InvalidAddr)

    }, [address, setAddrStatus])

    return {
        address,
        setAddress,
        addrStatus,
    }

}