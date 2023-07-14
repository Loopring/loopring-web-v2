import styled from '@emotion/styled'
import { List, ListProps } from '@mui/material'

export const SubMenu = styled(List)<ListProps>`
  width: 100%;
  flex: 1;
  padding: ${({ theme }) => (theme.unit / 2) * 5}px 0;
  background-color: var(--color-box);
  border-radius: ${({ theme }) => theme.unit}px;
  &.color-light {
    background-color: initial;
  }
` as typeof List
