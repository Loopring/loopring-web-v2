import React from 'react'

import { utils } from 'ethers'

export enum AddressError {
    NoError,
    InvalidAddr,
}

export const useAddressCheck = () => {

    const [address, setAddress,] = React.useState<string>('')

    const [addrStatus, setAddrStatus,] = React.useState<AddressError>(AddressError.NoError)

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