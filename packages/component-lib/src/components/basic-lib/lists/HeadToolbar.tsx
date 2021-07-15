import styled from "@emotion/styled";
import { MenuItem } from "@material-ui/core";

export const TabItemPlus = styled(MenuItem)<any>`
  && {
    &.Mui-focusVisible {
      background-color: transparent;
    }

    padding: 0;
    margin: 0;
    padding-left: 1.6rem;

    &:hover {
      background-color: transparent;
      border-left-color: transparent;
    }

    .MuiIconButton-root {
      svg {
        width: var(--header-menu-icon-size);
        height: var(--header-menu-icon-size);
        color: ${({theme}) => theme.colorBase.textPrimaryLight};
      }

      :hover {
        svg {
          color: ${({theme}) => theme.colorBase.textPrimary};
        }

        color: ${({theme}) => theme.colorBase.textPrimary};
      }
    }

  }
` as typeof MenuItem;


