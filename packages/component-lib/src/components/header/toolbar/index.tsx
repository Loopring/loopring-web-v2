import { Badge, Box, IconButton } from '@mui/material'
import {
  Account,
  AccountStatus,
  CircleIcon,
  DownloadIcon,
  NotificationIcon,
  ProfileIcon,
  SettingIcon,
  NOTIFICATIONHEADER,
  ThemeType,
  DarkIcon,
  LightIcon,
} from '@loopring-web/common-resources'
import { WithTranslation } from 'react-i18next'
import { bindHover, usePopupState } from 'material-ui-popup-state/hooks'
import { bindPopper } from 'material-ui-popup-state/es'
import { PopoverPure, SubMenu, SubMenuList } from '../../basic-lib'
import { SettingPanel } from '../../block/SettingPanel'
import { NotificationPanel } from '../../block/NotificationPanel'
import React, { useRef, useState } from 'react'
import { DownloadPanel } from '../../block/DownloadPanel'
import * as sdk from '@loopring-web/loopring-sdk'
import { useSettings } from '../../../stores'

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
export const BtnNotification = <N = sdk.UserNotification,>({
  notification, //:{notifyMap,myNotifyMap},
  account,
  chainId,
  onClickExclusiveredPacket,
  showExclusiveRedpacket,
  exclusiveRedpacketCount,
}: {
  notification: NOTIFICATIONHEADER<N>
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
  const popupStateEle = bindPopper(popupState)
  // bindHover(popupState)
  return (
    <Box position={'relative'}>
      <IconButton aria-label={'notification'} {...bindHover(popupState)}>
        <Badge
          sx={{ color: 'var(--color-error)' }}
          badgeContent={
            notification?.myNotifyMap?.total
              ? notification.myNotifyMap.total < 999
                ? notification.myNotifyMap.total
                : '99+'
              : ''
          }
        >
          <NotificationIcon />
        </Badge>
      </IconButton>
      {!notification?.myNotifyMap?.total && notification?.notifyMap?.notifications?.length ? (
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
      ) : (
        <></>
      )}
      <PopoverPure
        {...popupStateEle}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
      >
        <NotificationPanel
          closePop={popupStateEle.onMouseLeave as any}
          exclusiveRedpacketCount={exclusiveRedpacketCount}
          onClickExclusiveredPacket={onClickExclusiveredPacket}
          showExclusiveRedpacket={showExclusiveRedpacket}
          notification={{ ...notification, account, chainId }}
        />
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
      <IconButton
        aria-label={t(label)}
        {...bindHover(popupState)}
      >
        <SettingIcon />
      </IconButton>
      <PopoverPure
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        {...bindPopper(popupState)}
      >
        <Box margin={2} minWidth={320}>
          <SettingPanel />
        </Box>
      </PopoverPure>
    </Box>
  )
}

export const BtnSettingMobile = ({ t, label }: any) => {
  const [popupMobileOpen, setPopupMobileOpen] = useState(false)
  const btn = useRef<HTMLButtonElement>(null)
  return (
    <Box>
      <IconButton
        ref={btn}
        aria-label={t(label)}
        onClick={() => setPopupMobileOpen((prev) => !prev)}        
      >
        <SettingIcon />
      </IconButton>
      <PopoverPure
        anchorEl={btn.current}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}

        open={popupMobileOpen}
        onClose={() => setPopupMobileOpen(false)}
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

export const ColorSwitch = () => {
  const { setTheme, themeMode } = useSettings()

  const handleThemeClick = React.useCallback(
    (_e: any) => {
      setTheme(themeMode === ThemeType.dark ? ThemeType.light : ThemeType.dark)
    },
    [themeMode],
  )
  return (
    <IconButton size={'large'} edge={'end'} onClick={handleThemeClick}>
      {themeMode === ThemeType.dark ? <DarkIcon /> : <LightIcon />}
    </IconButton>
  )
}

export * from './Interface'
export * from './WalletConnect'
