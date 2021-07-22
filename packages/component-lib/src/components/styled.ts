import styled from '@emotion/styled';
import { Grid, Typography } from '@material-ui/core';
import { css } from '@emotion/react';
import { UpColor } from '@loopring-web/common-resources';
import { Box } from '@material-ui/core/';

export const TablePaddingX = ({pLeft = 24, pRight = 24}: { pLeft: number, pRight: number }) => css`
  .rdg-row, .rdg-header-row {
    .rdg-cell:first-of-type {
      padding-left: ${pLeft}px;
    }

    .rdg-cell:last-of-type {
      padding-right: ${pRight}px;
    }
  }
`
export const VipStyled = styled(Typography)`
  margin-left: ${({theme}) => theme.unit}px;
  padding: ${({theme}) => theme.unit / 4}px ${({theme}) => theme.unit}px;
  ${({theme}) => theme.border.defaultFrame({c_key: 'rgba(0,0,0,0)', d_R: 0.25})};
  background-color: ${({theme}) => theme.colorBase.vipBgColor};
  height: 2rem;
  //line-height: 2rem;
  color: ${({theme}) => theme.colorBase.secondaryDark};
` as typeof Typography
export const floatTag = ({theme, custom}: any) => css`
  .float-group {
    font-weight: lighter;

    .float-tag.float-increase {
      color: ${custom.chg === UpColor.green ? theme.colorBase.success : theme.colorBase.error}
    }

    .float-tag.float-decrease {
      color: ${custom.chg === UpColor.green ? theme.colorBase.error : theme.colorBase.success};
    }

    .float-tag.float-none {
      color: ${theme.colorBase.textPrimary};
    }
  }
`
export const AvatarIconPair = ({theme}: any) => css`
  .MuiAvatar-root {
    width: var(--chart-title-coin-size);
    height: var(--chart-title-coin-size);
  }

  .icon-next {
    margin-left: -${theme.unit}px;
  }`
export const baseTitleCss = ({theme, custom}: any) => css`
  height: 72px;

  ${AvatarIconPair({theme})}
  h3.MuiTypography-root {
    font-size: 1.6rem;
    margin-left: ${theme.unit}px;
    color: ${theme.colorBase.textSecondary};

    .MuiTypography-root {
      margin: 0 ${theme.unit / 4}px;
    }

    .next-coin {
      color: ${theme.colorBase.textPrimary};
    }
  }

  ${floatTag({theme, custom})};

  .float-chart {
    margin-left: ${theme.unit}px;

    .chart-change {
      color: ${theme.colorBase.textSecondary};
    }
  }
`
export const ButtonListRightStyled = styled(Grid)`
  .MuiButton-root:not(:last-child) {
    margin-right: ${({theme}) => theme.unit}px;
  }
`
export const modalContentBaseStyle = ({theme}: any) => css`
  &:focus-visible {
    outline:0
  }

  //& > div {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  position: absolute;
  top: 50%;
  left: 50%;
  background-color: ${theme.colorBase.background().secondary};
  transform: translate(-50%, -50%);

  padding: 36px 0;
  border: 0;
  //border: 1px solid #252842;
  box-shadow: 0px 4px 38px rgba(0, 0, 0, 0.16);
  border-radius: 8px;
  //}
`
export const ModalContentStyled = styled(Box)`
  ${({theme}) => modalContentBaseStyle({theme: theme})}
` as typeof Box
// export const TwoIconBoxStyled = styled(Box)`
//   ${({theme}) => AvatarIconPair({theme})}
// ` as typeof Box

export const TableFilterStyled = styled(Box)`
  margin-left: 26px;
  margin-bottom: ${({theme}) => theme.unit * 2}px;
` as typeof Box



