import { ListItem, ListItemProps, ListItemText } from "@mui/material";
import styled from "@emotion/styled";
import {
  ACTIVITY,
  ACTIVITY_TYPE,
  hexToRGB,
  NOTIFICATION_ITEM,
} from "@loopring-web/common-resources";
import { css, Theme } from "@emotion/react";
import { useHistory } from "react-router-dom";

const ListItemStyled = styled(ListItem)`
  font-size: ${({ theme }) => theme.fontDefault.h5};

  width: 100%;
  padding: ${({ theme }) => theme.unit}px ${({ theme }) => theme.unit * 2}px;
  height: auto;
  min-height: 1.2em;

  &:not(:last-child) {
    :after {
      content: "";
      display: inline-block;
      width: 100%;
      height: 1px;
      position: absolute;
      bottom: 0;
      left: 0;
      padding: 0 ${({ theme }) => theme.unit / 2}px;
    }
  }

  &:hover {
    border-left-color: transparent;
    background: var(--color-box-hover);
  }

  .MuiListItemText-root {
    height: 100%;

    margin: 0;
    overflow: hidden;
  }

  .MuiListItemIcon-root {
    min-width: auto;
    margin-top: 0;
    padding-right: ${({ theme }) => theme.unit}px;
  }

  &.error {
    .MuiListItemIcon-root {
      color: var(--color-error);
    }
  }

  &.pending {
    .MuiListItemIcon-root {
      color: var(--color-secoundary);
    }
  }

  &.success {
    .MuiListItemIcon-root {
      color: var(--color-success);
    }
  }
`;
const cssBackground = ({
  theme,
  type,
}: { theme: Theme } & Partial<ACTIVITY>) => {
  switch (type) {
    case ACTIVITY_TYPE.orderbook_mining:
      return css`
        background: ${hexToRGB(theme.colorBase.warning, 0.25)};
      `;
    case ACTIVITY_TYPE.swap_mining:
      return css`
        background: ${hexToRGB(theme.colorBase.success, 0.25)};
      `;
    case ACTIVITY_TYPE.trade_mining:
      return css`
        background: ${hexToRGB(theme.colorBase.error, 0.25)};
      `;
    case ACTIVITY_TYPE.special:
      return css`
        background: ${hexToRGB(theme.colorBase.primary, 0.25)};
      `;
  }
};

export const NotificationListItem = (props: Partial<NOTIFICATION_ITEM>) => {
  // const { t } = useTranslation(["common"]);
  const history = useHistory();
  return (
    <ListItemStyled
      button={false}
      alignItems="flex-start"
      onClick={() => history.push(`./notification/${props.link}`)}
      className={`notification`}
    >
      <ListItemText
        primary={props.title}
        primaryTypographyProps={{ component: "h4", color: "textPrimary" }}
      />
      <ListItemText
        primary={props.description1}
        primaryTypographyProps={{ component: "p", color: "textSecondary" }}
      />
      <ListItemText
        primary={props.description2}
        primaryTypographyProps={{
          component: "p",
          color: "textSecondary",
          variant: "body2",
        }}
      />
    </ListItemStyled>
  );
};

const ListItemActivityStyle = styled(ListItem)<
  ListItemProps & Partial<ACTIVITY>
>`
  border-radius: ${({ theme }) => theme.unit}px;
  height: var(--notification-activited-heigth);
  overflow: hidden;
  flex-direction: column;
  align-items: flex-start;
  padding: ${({ theme }) => theme.unit}px;
  .MuiListItemText-root {
    margin-top: 0;
  }
  .description {
    text-overflow: ellipsis;
    word-break: break-all;
  }

  ${(props) => cssBackground(props)}
` as (prosp: ListItemProps & Partial<ACTIVITY>) => JSX.Element;
export const ListItemActivity = (props: ACTIVITY) => {
  const { type, title, description1, description2, startDate } = props;
  // const { t } = useTranslation;
  if (Date.now() > startDate) {
    return (
      <ListItemActivityStyle className={type} {...props}>
        <ListItemText
          primary={title}
          primaryTypographyProps={{
            component: "h6",
            variant: "subtitle1",
            color: "textPrimary",
          }}
        />
        <ListItemText
          className="description description1"
          primary={description1}
          primaryTypographyProps={{
            component: "p",

            variant: "body1",
            color: "textPrimary",
          }}
        />
        <ListItemText
          className="description description2"
          primary={description2}
          primaryTypographyProps={{
            component: "p",
            variant: "body2",
            color: "textThird",
          }}
        />
      </ListItemActivityStyle>
    );
  } else {
    return <></>;
  }
};
