import React from 'react'

export const DevWrapper = ({ children }: { children: React.ReactNode }) => {

  return (
    <React.Fragment>
      {
        process.env.NODE_ENV !== 'production' ? (
          <>
          {children}
          </>
        ) : null
      }
    </React.Fragment>
  )

}

