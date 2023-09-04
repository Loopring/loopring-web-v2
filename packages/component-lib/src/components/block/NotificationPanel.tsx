import { Trans } from 'react-i18next'
import { ACTIVITY, NOTIFICATION, NOTIFICATION_ITEM, SoursURL } from '@loopring-web/common-resources'
import { Box, Divider, Typography } from '@mui/material'
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
  onClickExclusiveredPacket,
  showExclusiveRedpacket,
  exclusiveRedpacketCount
}: {
  notification: NOTIFICATION,
  onClickExclusiveredPacket: () => void
  showExclusiveRedpacket: boolean
  exclusiveRedpacketCount: number
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

  // const showExclusiveRedpacket = true
  console.log('exclusiveRedpacketCount', exclusiveRedpacketCount) 

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
      {showExclusiveRedpacket || hasActivities || hasNotifications ? (
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
              {showExclusiveRedpacket && <Box onClick={() => onClickExclusiveredPacket()} sx={{
                  backgroundImage: `url(${SoursURL + 'images/target_pop_bg.png'})`,  
                  backgroundSize: 'contain',
                  width: '330px',
                  height: '77px',
                  borderRadius: 2,
                  paddingLeft: 3.5,
                  paddingTop: 2.5,
                  cursor: 'pointer'
                  
                }} >
                  <Typography color={'black'}>
                    Congratulations!
                  </Typography>
                  <Typography variant={'body2'} color={'black'}>
                    You've received {exclusiveRedpacketCount} exclusive Red Packet!
                  </Typography>
                </Box>
              }
              
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
