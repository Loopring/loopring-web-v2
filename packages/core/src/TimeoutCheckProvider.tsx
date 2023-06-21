import { AccountStatus, myLog } from '@loopring-web/common-resources'
import { debounce } from 'lodash'
import React from 'react'
import { accountServices } from './services/account/accountServices'
import { UserStorage } from './storage'
import { store } from './index'

const WindowEvent = {
  Click: 'click',
  Scroll: 'scroll',
  Mouseover: 'mouseover',
}

const events = [WindowEvent.Click, WindowEvent.Mouseover, WindowEvent.Scroll]

const forceReset = debounce(() => {
  // myLog('active!!!!! reset active time!!!! ')
  UserStorage.checkTimeout(true)
}, 100)

export const TimeoutCheckProvider = ({ children }: { children: React.ReactNode }) => {
  React.useEffect(() => {
    events.forEach((event: string) => {
      document.addEventListener(event, forceReset)
    })

    const handler = setInterval(() => {
      if (UserStorage.checkTimeout()) {
        // timeout
        const account = store.getState().account

        if (account.readyState === AccountStatus.ACTIVATED) {
          myLog('[*****] got timeout! try to lock!!!!!')
          accountServices.sendAccountLock()
        }
      }
    }, 1000)

    return () => {
      events.forEach((event: string) => {
        document.removeEventListener(event, forceReset)
      })
      if (handler) {
        clearInterval(handler)
      }
    }
  }, [])

  return <>{children}</>
}
