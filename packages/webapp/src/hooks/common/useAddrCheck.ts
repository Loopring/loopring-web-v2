import React from 'react'

import { utils } from 'ethers'
import { myError, myLog } from '@loopring-web/common-resources'
import { connectProvides } from '@loopring-web/web3-provider'

export enum AddressError {
    NoError,
    InvalidAddr,
}

export const useAddressCheck = () => {

    const [address, setAddress,] = React.useState<string>('')

    const [realAddr, setRealAddr,] = React.useState<string>('')

    const [addrStatus, setAddrStatus,] = React.useState<AddressError>(AddressError.NoError)

    React.useEffect(() => {

        myLog('addr:', address)

        if (address) {
            try {
                const addr = utils.getAddress(address)
                myLog('utils.getAddress:', addr)
                setRealAddr('')
                setAddrStatus(AddressError.NoError)
            } catch (reason) {
                try {
                    connectProvides.usedWeb3?.eth.ens.getAddress(address).then((addressResovled) => {
                        myLog('addressResovled:', addressResovled)
                        setRealAddr(addressResovled)
                        setAddrStatus(AddressError.NoError)
                    }).catch((reason3) => {
                        if (reason3) {
                            // myError(reason3)
                            setAddrStatus(AddressError.InvalidAddr)
                            setRealAddr('')
                            return
                        }
                    })
                } catch (reason2) {
                    // myLog('reason2:', reason2)
                    setAddrStatus(AddressError.InvalidAddr)
                    setRealAddr('')
                }

            }
        } else {
            setAddrStatus(AddressError.InvalidAddr)
        }

    }, [address, setAddrStatus])

    return {
        address,
        realAddr,
        setAddress,
        addrStatus,
    }

}