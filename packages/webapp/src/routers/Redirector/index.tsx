import React from 'react'
import { Redirect, } from 'react-router-dom'
import { useAccount } from '../../stores/account'

const Redirector = ({children}: { children: React.ReactNode }) => {

    const { account: { accountId } } = useAccount()

    return (
        <React.Fragment>
            {
                accountId !== -1 ? (
                    <>
                        {children}
                    </>
                ) : <Redirect to="/" />
            }
        </React.Fragment>
    )

}

export default Redirector
