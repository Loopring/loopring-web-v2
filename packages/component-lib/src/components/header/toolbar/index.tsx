import { Badge, Box, IconButton } from '@mui/material'
import {
  ACTIVITY,
  Account,
  AccountStatus,
  CircleIcon,
  DownloadIcon,
  NOTIFICATION_ITEM,
  NotificationIcon,
  Notify,
  ProfileIcon,
  SettingIcon,
} from '@loopring-web/common-resources'
import { WithTranslation } from 'react-i18next'
import { bindHover, usePopupState } from 'material-ui-popup-state/hooks'
import { bindPopper } from 'material-ui-popup-state/es'
import { PopoverPure, SubMenu, SubMenuList } from '../../basic-lib'
import { SettingPanel } from '../../block/SettingPanel'
import { NotificationPanel } from '../../block/NotificationPanel'
import React from 'react'
import { DownloadPanel } from '../../block/DownloadPanel'
import * as sdk from '@loopring-web/loopring-sdk'

export const BtnDownload = ({
  t,
  url,
  i18nTitle,
}: {
  i18nTitle: string
  i18nDescription: string
  url: string
} & WithTranslation) => {
  const popupState = usePopupState({
    variant: 'popover',
    popupId: 'downloadPop',
  })
  return (
    <Box>
      <IconButton
        title={t(i18nTitle)}
        aria-label={t('labeldownloadApp')}
        rel='noopener noreferrer'
        target='_blank'
        href={url}
        {...bindHover(popupState)}
      >
        <DownloadIcon />
      </IconButton>
      <PopoverPure
        {...bindPopper(popupState)}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
      >
        <Box minWidth={160}>
          <DownloadPanel viewMoreUrl={url} />
        </Box>
      </PopoverPure>
    </Box>
  )
}
// export const BtnNetworkSwitch = ({
//   onTestOpen,
//   isShow = false,
// }: {
//   isShow: boolean;
//   onTestOpen: (boolean: boolean) => void;
// } & WithTranslation) => {
//   // const [open, setOpen] = React.useState(isTaikoTest);
//   return isShow ? (
//     <Box>
//       Debug:
//       <Switch
//         checked={isTaikoTest}
//         color="default"
//         onChange={(e: any) => {
//           // setOpen(e?.target?.checked ? true : false);
//           setIsTaikoTest(e?.target?.checked ? true : false);
//           onTestOpen(e?.target?.checked ? true : false);
//         }}
//       />
//     </Box>
//   ) : (
//     <></>
//   );
// };

export const BtnNotification = ({
  notification: _notification,
  account,
  chainId,
  onClickExclusiveredPacket,
  showExclusiveRedpacket,
  exclusiveRedpacketCount
}: {
  notification: Notify
  account: Account
  chainId: sdk.ChainId
  onClickExclusiveredPacket: () => void
  showExclusiveRedpacket: boolean
  exclusiveRedpacketCount: number
}) => {
  const popupState = usePopupState({
    variant: 'popover',
    popupId: 'notificationPop',
  })
  const [content] = React.useState(0)

  const notifications = _notification?.notifications?.reduce((prev, item) => {
    if (item.endShow >= Date.now() && item.startShow <= Date.now() && item.webFlag) {
      prev.push(item)
    }
    return prev
  }, [] as NOTIFICATION_ITEM[])
  const activitiesList1 = _notification?.activities?.reduce((prev, item) => {
    if (item.endShow >= Date.now() && item.startShow <= Date.now() && item.webFlag) {
      prev.push(item)
    }
    return prev
  }, [] as ACTIVITY[])

  const activitiesList2 = _notification?.activitiesInvest?.reduce((prev, item) => {
    if (item.endShow >= Date.now() && item.startShow <= Date.now() && item.webFlag) {
      prev.push(item)
    }
    return prev
  }, _notification?.activities as ACTIVITY[])

  const notification = {
    ..._notification,
    notifications: notifications,
    activities: [...(activitiesList1 ?? []), ...(activitiesList2 ?? [])],
    account,
    chainId
  }

  return (
    <Box position={'relative'}>
      <IconButton aria-label={'notification'} {...bindHover(popupState)}>
        <Badge badgeContent={content}>
          <NotificationIcon />
        </Badge>
      </IconButton>
      {((notification?.activities?.length ?? 0 + notification?.notifications?.length ?? 0) > 0 || showExclusiveRedpacket) && (
        <CircleIcon
          sx={{
            position: 'absolute',
            top: -6,
            right: -6,
            pointerEvents: 'none' as any,
          }}
          className={'noteit'}
          fontSize={'large'}
          htmlColor={'var(--color-error)'}
        />
      )}
      <PopoverPure
        {...bindPopper(popupState)}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
      >
        <NotificationPanel exclusiveRedpacketCount={exclusiveRedpacketCount} onClickExclusiveredPacket={onClickExclusiveredPacket} showExclusiveRedpacket={showExclusiveRedpacket} notification={{ ...notification, account, chainId }} />
      </PopoverPure>
    </Box>
  )
}

export const BtnSetting = ({ t, label }: any) => {
  const popupState = usePopupState({
    variant: 'popover',
    popupId: 'settingPop',
  })
  return (
    <Box>
      <IconButton aria-label={t(label)} {...bindHover(popupState)}>
        <SettingIcon />
      </IconButton>
      <PopoverPure
        {...bindPopper(popupState)}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
      >
        <Box margin={2} minWidth={320}>
          <SettingPanel />
        </Box>
      </PopoverPure>
    </Box>
  )
}

export const ProfileMenu = ({ t, label, readyState, router, subMenu }: any) => {
  const popupState = usePopupState({
    variant: 'popover',
    popupId: 'settingPop',
  })
  return readyState == AccountStatus.ACTIVATED ? (
    <Box>
      <IconButton aria-label={t(label)} size={'large'} {...bindHover(popupState)}>
        <ProfileIcon />
      </IconButton>
      <PopoverPure
        {...bindPopper(popupState)}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
      >
        <SubMenu className={'color-light'}>
          <SubMenuList selected={router} subMenu={{ ...subMenu } as any} />
        </SubMenu>
      </PopoverPure>
    </Box>
  ) : (
    <></>
  )
}

export * from './Interface'
export * from './WalletConnect'
