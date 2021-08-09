import { SHORT_INTERVAL } from 'defs/common_defs'
import { debounce } from 'lodash'
import React, { useEffect } from 'react'
import { UserStorage } from 'storage'

enum WindowEvent {
  Click = 'click',
  Scroll = 'scroll',
  Mouseover = 'mouseover',
}

const events = [WindowEvent.Click, WindowEvent.Scroll]

const forceReset = debounce(() => { UserStorage.checkTimeout(true) }, SHORT_INTERVAL)

export const GlobalProvider = ({ children }: { children: React.ReactNode }) => {

  useEffect(() => {

    events.forEach((event: string) => {
      document.addEventListener(event, forceReset)
    })

    return () => {

      events.forEach((event: string) => {
        document.removeEventListener(event, forceReset)
      })
    }

  }, [])

  return (
    <React.Fragment>
      { children}
    </React.Fragment>
  )

}
