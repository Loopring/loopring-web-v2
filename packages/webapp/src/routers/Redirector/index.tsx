import React from 'react'
import {
  Redirect,
} from 'react-router-dom'

import { useWeb3Account } from 'stores/account/hook'

const Redirector = ({ children }: { children: React.ReactNode }) => {

  const { isConnected } = useWeb3Account()

  return (
    <>
      {
        isConnected() ? (
          <>
          {children}
          </>
        ) : <Redirect to="/" />
      }
    </>
  )

}

export default Redirector
