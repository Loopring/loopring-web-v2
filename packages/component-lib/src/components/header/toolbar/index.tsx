import { Badge, Box, IconButton } from "@mui/material";
import {
  Account,
  AccountStatus,
  CircleIcon,
  DownloadIcon,
  NotificationIcon,
  Notify,
  ProfileIcon,
  SettingIcon,
} from "@loopring-web/common-resources";
import { WithTranslation } from "react-i18next";
import { bindHover, usePopupState } from "material-ui-popup-state/hooks";
import { bindPopper } from "material-ui-popup-state/es";
import { PopoverPure, SubMenu, SubMenuList } from "../../basic-lib";
import { SettingPanel } from "../../block/SettingPanel";
import { NotificationPanel } from "../../block/NotificationPanel";
import React from "react";

export const BtnDownload = ({
  t,
  url,
  i18nTitle,
}: {
  i18nTitle: string;
  i18nDescription: string;
  url: string;
} & WithTranslation) => {
  return (
    <Box>
      <IconButton
        title={t(i18nTitle)}
        aria-label={t("labeldownloadApp")}
        rel="noopener noreferrer"
        target="_blank"
        href={url}
      >
        <DownloadIcon />
      </IconButton>
    </Box>
  );
};

export const BtnNotification = ({
  notification,
  account,
}: {
  notification: Notify;
  account: Account;
}) => {
  const popupState = usePopupState({
    variant: "popover",
    popupId: "notificationPop",
  });
  const [content] = React.useState(0);
  return (
    <Box position={"relative"}>
      <IconButton aria-label={"notification"} {...bindHover(popupState)}>
        <Badge badgeContent={content}>
          <NotificationIcon />
        </Badge>
      </IconButton>
      {(notification?.activities?.length ??
        0 + notification?.notifications?.length ??
        0) > 0 && (
        <CircleIcon
          sx={{
            position: "absolute",
            top: -6,
            right: -6,
            pointerEvents: "none" as any,
          }}
          className={"noteit"}
          fontSize={"large"}
          htmlColor={"var(--color-error)"}
        />
      )}
      <PopoverPure
        {...bindPopper(popupState)}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
      >
        <NotificationPanel notification={{ ...notification, account }} />
      </PopoverPure>
    </Box>
  );
};

export const BtnSetting = ({ t, label }: any) => {
  const popupState = usePopupState({
    variant: "popover",
    popupId: "settingPop",
  });
  return (
    <Box>
      <IconButton aria-label={t(label)} {...bindHover(popupState)}>
        <SettingIcon />
      </IconButton>
      <PopoverPure
        {...bindPopper(popupState)}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
      >
        <Box margin={2} minWidth={320}>
          <SettingPanel />
        </Box>
      </PopoverPure>
    </Box>
  );
};

export const ProfileMenu = ({ t, label, readyState, router, subMenu }: any) => {
  const popupState = usePopupState({
    variant: "popover",
    popupId: "settingPop",
  });
  return readyState == AccountStatus.ACTIVATED ? (
    <Box>
      <IconButton
        aria-label={t(label)}
        size={"large"}
        {...bindHover(popupState)}
      >
        <ProfileIcon />
      </IconButton>
      <PopoverPure
        {...bindPopper(popupState)}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
      >
        <SubMenu className={"color-light"}>
          <SubMenuList selected={router} subMenu={{ ...subMenu } as any} />
        </SubMenu>
      </PopoverPure>
    </Box>
  ) : (
    <></>
  );
};

export * from "./Interface";
export * from "./WalletConnect";
