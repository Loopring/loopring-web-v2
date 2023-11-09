import * as sdk from '@loopring-web/loopring-sdk'
import { RecordTabIndex, RouterPath } from '@loopring-web/common-resources'
import { useHistory } from 'react-router-dom'
export const useNotification = ({
  onReadClick,
  index,
  ...rest
}: sdk.UserNotification & {
  index: number
  onReadClick: (index: number, rest: any) => void
}) => {
  const history = useHistory()
  const { messageType } = rest
  let ele: any = {
    i18nKey: '',
    active: undefined,
  }

  switch (messageType) {
    case sdk.NotificationMessageType.L1_CREATED:
      ele.i18nKey = 'labelActiveL1successfulNote' //Active L1 Account successful
      ele.active = undefined
      break
    case sdk.NotificationMessageType.L2_CREATED:
      ele.i18nKey = 'labelActiveL2successfulNote' //Active L2 Account successful
      ele.active = () => {
        onReadClick(index, rest)
        history.push(`${RouterPath.l2assetsDetail}`)
      }
      break
    case 12: //sdk.NotificationMessageType.L1_CREATING:
      ele.i18nKey = 'labelActivatingL1AccountNote' //Active L2 Account successful
      ele.active = undefined
      break
    case sdk.NotificationMessageType.L1_RECEIVE:
      ele.i18nKey = 'labelL1ReceiveNote'
      ele.active = undefined
      break
    case sdk.NotificationMessageType.L1_SEND:
      ele.i18nKey = 'labelL1SendNote'
      ele.active = undefined
      break
    case sdk.NotificationMessageType.L2_RECEIVE:
      ele.i18nKey = 'labelL2ReceiveNote'
      ele.active = () => {
        onReadClick(index, rest)
        history.push(`${RouterPath.l2records}/${RecordTabIndex.Transactions}`)
      }
      break
    case sdk.NotificationMessageType.L2_SEND:
      ele.i18nKey = 'labelL2SendNote'
      ele.active = undefined
      ele.active = () => {
        onReadClick(index, rest)
        history.push(`${RouterPath.l2records}/${RecordTabIndex.Transactions}`)
      }
      break
    case sdk.NotificationMessageType.DEPOSIT:
      ele.i18nKey = 'labelL2DepositNote'
      ele.active = () => {
        onReadClick(index, rest)
        history.push(`${RouterPath.l2records}/${RecordTabIndex.Transactions}`)
      }
      break
    case sdk.NotificationMessageType.WITHDRAW:
      ele.i18nKey = 'labelL2WithdrawNote'
      ele.active = () => {
        onReadClick(index, rest)
        history.push(`${RouterPath.l2records}/${RecordTabIndex.Transactions}`)
      }
      break
    default:
      ele.i18nKey = 'labelNotificationLabel'
      ele.active = undefined
      break
  }
  return ele
}
