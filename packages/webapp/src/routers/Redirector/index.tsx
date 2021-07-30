import React from 'react'
import {
  Redirect,
} from 'react-router-dom'
import { AccountStatus, useAccount } from '../../stores/account';

// import { useWeb3Account } from 'stores/account/hook'

const Redirector = ({ children }: { children: React.ReactNode }) => {

  // const lv1Acc = useWeb3Account()
  const {account:{readyState,accAddress,accountId}}  = useAccount()

  return (
    <React.Fragment>
      {
        accountId!==-1 ? (
          <>
          {children}
          </>
        ) : <Redirect to="/" />
      }
    </React.Fragment>
  )

}

export default Redirector
