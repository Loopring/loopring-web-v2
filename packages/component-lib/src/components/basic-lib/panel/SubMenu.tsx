import styled from "@emotion/styled";
import { List, ListProps } from "@material-ui/core";

export const SubMenu = styled(List)<ListProps>`
  width: 100%;
  flex: 1;
  padding: ${({theme}) => theme.unit / 2 * 5}px 0;
  background-color: ${({theme}) => theme.colorBase.background().default};
  border-radius: ${({theme}) => theme.unit}px;
` as typeof List;

