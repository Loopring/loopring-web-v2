import { Box, IconButton } from "@mui/material";
import {
  Account,
  AccountStatus,
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
  return (
    <Box>
      <IconButton aria-label={"notification"} {...bindHover(popupState)}>
        <NotificationIcon />
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
        <Box margin={2} minWidth={320}>
          <SubMenu>
            <SubMenuList selected={router} subMenu={{ ...subMenu } as any} />
          </SubMenu>
          {/*  <MuiList>*/}
          {/*  {[...router].map(() => {*/}
          {/*    return <SubMenuItem />;*/}
          {/*  })}*/}
          {/*</MuiList>*/}
        </Box>
      </PopoverPure>
    </Box>
  ) : (
    <></>
  );
};

export * from "./Interface";
export * from "./WalletConnect";
