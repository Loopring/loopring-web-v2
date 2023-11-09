import { Trans, useTranslation } from 'react-i18next'
import {
  ACTIVITY,
  Layer2RouterID,
  NOTIFICATION_ITEM,
  NOTIFICATIONHEADER,
  RouterPath,
  SoursURL,
} from '@loopring-web/common-resources'
import { Box, Divider, Grid, Link, Typography } from '@mui/material'
import { EmptyDefault, ListItemActivity, NotificationListItem } from '../basic-lib'
import styled from '@emotion/styled'
import { NotificationItem } from '@loopring-web/core'
import { useHistory } from 'react-router-dom'

const BoxStyle = styled(Box)`
  background: var(--color-pop-bg);
  box-shadow: var(--shadow);
  .MuiInputBase-root {
    background: var(--opacity);
    text-align: right;
  }
` as typeof Box
export const NotificationPanel = ({
  notification: { myNotifyMap, notifyMap, chainId, account },
  onClickExclusiveredPacket,
  showExclusiveRedpacket,
  exclusiveRedpacketCount,
}: {
  notification: NOTIFICATIONHEADER<any> & { chainId: number; account }
  onClickExclusiveredPacket: () => void
  showExclusiveRedpacket: boolean
  exclusiveRedpacketCount: number
}) => {
  const { t } = useTranslation()
  const history = useHistory()
  const notifications = notifyMap?.notifications?.reduce((prev, item) => {
    if (item.endShow >= Date.now() && item.startShow <= Date.now() && item.webFlag) {
      prev.push(item)
    }
    return prev
  }, [] as NOTIFICATION_ITEM[])
  let activities = notifyMap?.activities?.reduce((prev, item) => {
    if (item.endShow >= Date.now() && item.startShow <= Date.now() && item.webFlag) {
      prev.push(item)
    }
    return prev
  }, [] as ACTIVITY[])

  activities = notifyMap?.activitiesInvest?.reduce((prev, item) => {
    if (item.endShow >= Date.now() && item.startShow <= Date.now() && item.webFlag) {
      prev.push(item)
    }
    return prev
  }, activities)

  const hasActivities = activities && activities?.length
  const hasNotifications = notifications && notifications?.length

  return (
    <BoxStyle
      display={'flex'}
      flexDirection={'column'}
      maxHeight={600}
      sx={{ overflowY: 'scroll' }}
      alignItems={'center'}
      // paddingBottom={1}
    >
      {myNotifyMap && (
        <>
          <Typography
            alignSelf={'stretch'}
            sx={{ background: 'var(--field-opacity)' }}
            borderRadius={1 / 2}
            padding={1}
            display={'inline-flex'}
            alignItems={'center'}
            justifyContent={'space-between'}
          >
            <Typography component={'span'}>
              {t('labelTotalUnRead', { total: myNotifyMap?.unReads ?? 0 })}
            </Typography>
            <Link href={`/#${RouterPath.layer2}/${Layer2RouterID.notification}`} color={'primary'}>
              {t('labelReadAll')}
            </Link>
          </Typography>
          {myNotifyMap?.total ? (
            <Box paddingX={1} display={'flex'} width={330} alignItems={'center'}>
              <Grid container spacing={1 / 2} margin={0}>
                {myNotifyMap?.items?.reduce((prev, ele, index) => {
                  if (index < 3) {
                    prev.push(
                      <Grid item key={ele?.id} xs={12}>
                        <NotificationItem
                          {...ele}
                          size={'small'}
                          className={'headerItem'}
                          index={index}
                          onReadClick={() => {
                            history.push(`${RouterPath.layer2}/${Layer2RouterID.notification}`)
                          }}
                        />
                        <Divider sx={{ marginY: 1 }} />
                      </Grid>,
                    )
                  }
                  return prev
                }, [])}
              </Grid>
            </Box>
          ) : (
            <Divider
              sx={{ paddingY: showExclusiveRedpacket || hasActivities || hasNotifications ? 1 : 0 }}
            />
          )}
        </>
      )}

      {showExclusiveRedpacket || hasActivities || hasNotifications ? (
        <>
          <Box
            component={'section'}
            display={'flex'}
            flexDirection={'column'}
            marginX={1}
            marginBottom={1}
          >
            {showExclusiveRedpacket && (
              <Box
                onClick={() => onClickExclusiveredPacket()}
                sx={{
                  backgroundImage: `url(${SoursURL + 'images/target_pop_bg.png'})`,
                  backgroundSize: 'contain',
                  width: '330px',
                  height: '77px',
                  borderRadius: 2,
                  paddingLeft: 3.5,
                  paddingTop: 2.5,
                  cursor: 'pointer',
                  marginTop: 1,
                  marginBottom: !!hasActivities ? 1 : 0,
                }}
              >
                <Typography color={'black'}>Congratulations!</Typography>
                <Typography variant={'body2'} color={'black'}>
                  You've received {exclusiveRedpacketCount} exclusive Red Packet!
                </Typography>
              </Box>
            )}
            {!!hasActivities &&
              activities.map((activity, index) => (
                <ListItemActivity
                  key={activity.type + index}
                  {...activity}
                  chainId={chainId}
                  account={account}
                />
              ))}
          </Box>
          {!!hasNotifications && (
            <>
              {!!hasActivities && <Divider />}
              <Box component={'section'} display={'flex'} flexDirection={'column'}>
                {notifications?.map((notify, index) => (
                  <NotificationListItem
                    key={notify.name.toString() + index}
                    {...notify}
                    chainId={chainId}
                    account={account}
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
