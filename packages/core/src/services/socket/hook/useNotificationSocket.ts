import React from 'react'
import { notificationService } from '../../../index'
import { BasicListItem } from '@loopring-web/component-lib'
import * as _ from 'lodash'
import { globalSetup } from '@loopring-web/common-resources'

export const useNotificationSocket = ({
  notificationCallback,
  throttleWait = globalSetup.throttleWait,
}: {
  notificationCallback?: (notification: BasicListItem) => void
  throttleWait?: number
}) => {
  const socketUpdate = _.throttle(({ notification }) => {
    notificationCallback && notificationCallback(notification)
  }, throttleWait)
  const subject = React.useMemo(() => notificationService.onSocket(), [])
  React.useEffect(() => {
    const subscription = subject.subscribe(({ notification }: { notification: BasicListItem }) => {
      socketUpdate({ notification })
    })
    return () => subscription.unsubscribe()
  }, [subject])
}
