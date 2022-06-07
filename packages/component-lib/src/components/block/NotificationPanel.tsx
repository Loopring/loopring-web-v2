import { Trans } from "react-i18next";
import { myLog, NOTIFICATION } from "@loopring-web/common-resources";
import { Box, Divider } from "@mui/material";
import {
  EmptyDefault,
  ListItemActivity,
  NotificationListItem,
} from "../basic-lib";
import styled from "@emotion/styled";

const BoxStyle = styled(Box)`
  background: var(--color-pop-bg);
  box-shadow: var(--shadow);
  .MuiInputBase-root {
    background: var(--opacity);
    text-align: right;
  }
` as typeof Box;
export const NotificationPanel = ({
  notification = {
    activities: [],
    notifications: [],
    invest: [],
  },
}: {
  notification: NOTIFICATION;
}) => {
  // myLog("notifications", notification.notifications);
  const hasActivities =
    notification.activities.length &&
    notification.activities.findIndex(({ startShow }) => {
      myLog("NotificationPanel", Date.now() > startShow);
      return Date.now() > startShow;
    }) !== -1;
  const hasNotifications =
    notification.notifications.length &&
    notification.notifications.findIndex(
      ({ startShow }) => Date.now() > startShow
    ) !== -1;
  return (
    <BoxStyle
      display={"flex"}
      flexDirection={"column"}
      maxHeight={600}
      // minHeight={100}
      // minWidth={100}
      overflow={"scroll"}
      // paddingBottom={1}
      paddingTop={hasActivities ? 1 : 0}
    >
      {hasActivities || hasNotifications ? (
        <>
          <Box
            component={"section"}
            display={"flex"}
            flexDirection={"column"}
            marginX={1}
            marginBottom={1}
          >
            {!!hasActivities &&
              notification.activities.map((activity, index) => (
                <ListItemActivity
                  key={activity.type + index}
                  {...activity}
                  account={notification.account}
                />
              ))}
          </Box>
          {!!hasNotifications && (
            <>
              {hasActivities && <Divider />}
              <Box
                component={"section"}
                display={"flex"}
                flexDirection={"column"}
              >
                {notification.notifications.map((notify, index) => (
                  <NotificationListItem
                    key={notify.name.toString() + index}
                    {...notify}
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
            message={() => (
              <Trans i18nKey="labelEmptyDefault">Content is Empty</Trans>
            )}
          />
        </Box>
      )}
    </BoxStyle>
  );
};
