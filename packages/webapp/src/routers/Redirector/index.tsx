import React from 'react'
import {
  Redirect,
} from 'react-router-dom'

import { useWeb3Account } from 'stores/account/hook'

const Redirector = ({ children }: { children: React.ReactNode }) => {

  const lv1Acc = useWeb3Account()

  return (
    <React.Fragment>
      {
        lv1Acc.isConnected ? (
          <>
          {children}
          </>
        ) : <Redirect to="/" />
      }
    </React.Fragment>
  )

}

export default Redirector
