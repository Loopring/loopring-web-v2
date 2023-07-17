import { Trans } from 'react-i18next'
import { ACTIVITY, NOTIFICATION, NOTIFICATION_ITEM } from '@loopring-web/common-resources'
import { Box, Divider } from '@mui/material'
import { EmptyDefault, ListItemActivity, NotificationListItem } from '../basic-lib'
import styled from '@emotion/styled'

const BoxStyle = styled(Box)`
  background: var(--color-pop-bg);
  box-shadow: var(--shadow);
  .MuiInputBase-root {
    background: var(--opacity);
    text-align: right;
  }
` as typeof Box
export const NotificationPanel = ({
  notification,
}: //   = {
//   activities: [],
//   activitiesInvest: [],
//   notifications: [],
//   invest: {} as any,
//   chainId: 0 as any,
//   campaignTagConfig: {
//     ORDERBOOK: [],
//     MARKET: [],
//     AMM: [],
//     FIAT: [],
//     SWAP: [],
//   },
// },
{
  notification: NOTIFICATION
}) => {
  // myLog("notifications", notification.notifications);
  notification.notifications = notification.notifications?.reduce((prev, item) => {
    if (item.endShow >= Date.now() && item.startShow <= Date.now() && item.webFlag) {
      prev.push(item)
    }
    return prev
  }, [] as NOTIFICATION_ITEM[])
  notification.activities = notification.activities?.reduce((prev, item) => {
    if (item.endShow >= Date.now() && item.startShow <= Date.now() && item.webFlag) {
      prev.push(item)
    }
    return prev
  }, [] as ACTIVITY[])

  notification.activities = notification?.activitiesInvest?.reduce((prev, item) => {
    if (item.endShow >= Date.now() && item.startShow <= Date.now() && item.webFlag) {
      prev.push(item)
    }
    return prev
  }, notification.activities as ACTIVITY[])

  const hasActivities = notification.activities && notification.activities?.length

  const hasNotifications = notification.notifications && notification.notifications?.length

  return (
    <BoxStyle
      display={'flex'}
      flexDirection={'column'}
      maxHeight={600}
      // minHeight={100}
      // minWidth={100}
      sx={{ overflowY: 'scroll' }}
      // paddingBottom={1}
      paddingTop={hasActivities ? 1 : 0}
    >
      {hasActivities || hasNotifications ? (
        <>
          <Box
            component={'section'}
            display={'flex'}
            flexDirection={'column'}
            marginX={1}
            marginBottom={1}
          >
            {!!hasActivities &&
              notification.activities.map((activity, index) => (
                <ListItemActivity
                  key={activity.type + index}
                  {...activity}
                  chainId={notification.chainId}
                  account={notification.account}
                />
              ))}
          </Box>
          {!!hasNotifications && (
            <>
              {!!hasActivities && <Divider />}
              <Box component={'section'} display={'flex'} flexDirection={'column'}>
                {notification.notifications.map((notify, index) => (
                  <NotificationListItem
                    key={notify.name.toString() + index}
                    {...notify}
                    chainId={notification.chainId}
                    account={notification.account}
                  />
                ))}
              </Box>
            </>
          )}
        </>
      ) : (
        <Box margin={2}>
          <EmptyDefault
            height={`calc(100% - var(--header-row-height))`}
            message={() => <Trans i18nKey='labelEmptyDefault'>Content is Empty</Trans>}
          />
        </Box>
      )}
    </BoxStyle>
  )
}
