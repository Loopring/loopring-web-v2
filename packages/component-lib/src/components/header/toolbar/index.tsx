import { Box, IconButton, Link } from "@mui/material";
import {
  Account,
  DownloadIcon,
  NotificationIcon,
  Notify,
  SettingIcon,
} from "@loopring-web/common-resources";
import { WithTranslation } from "react-i18next";
import { bindHover, usePopupState } from "material-ui-popup-state/hooks";
import { bindPopper } from "material-ui-popup-state/es";
import { PopoverPure } from "../../basic-lib";
import { SettingPanel } from "../../block/SettingPanel";
import { QRCodePanel } from "../../modal";
import { NotificationPanel } from "../../block/NotificationPanel";

export const BtnDownload = ({
  t,
  url,
  i18nTitle,
  i18nDescription,
  ...rest
}: {
  i18nTitle: string;
  i18nDescription: string;
  url: string;
} & WithTranslation) => {
  const popupState = usePopupState({
    variant: "popover",
    popupId: "download-QRcode",
  });
  const Description = () => (
    <Link target="_blank" rel="noopener noreferrer" href="https://loopring.io">
      {t(i18nDescription)}
    </Link>
  );

  return (
    <Box>
      <IconButton aria-label={t("labeldownloadApp")} {...bindHover(popupState)}>
        <DownloadIcon />
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
        <Box margin={3}>
          <QRCodePanel
            {...{
              ...rest,
              title: t(i18nTitle),
              description: <Description />,
              url,
              t,
            }}
          />
        </Box>
      </PopoverPure>
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

export * from "./Interface";
export * from "./WalletConnect";
