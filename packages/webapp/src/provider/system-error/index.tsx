import React from 'react'
import styled from '@emotion/styled/macro'
import { useSystem } from '../../stores/system';


const SystermError = styled.div`
  color: #ffffff;
  min-height: 600px;
`

const SystemError = ({ children }:  { children: React.ReactNode }) => {
  const sys = useSystem()

  return (
    <React.Fragment>
      {
        sys.status !== 'ERROR'? (<>{children}</>) :
          (<SystermError>
            System Error Show Page
          </SystermError>)
      }
    </React.Fragment>
  )

}

export default SystemError
