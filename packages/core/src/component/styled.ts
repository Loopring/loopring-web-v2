import styled from '@emotion/styled'
import { Box, Grid } from '@mui/material'
import { TablePaddingX } from '@loopring-web/component-lib'
import { LAYOUT } from '../defs'

export const StylePaper = styled(Box)`
  display: flex;
  flex-direction: column;
  width: 100%;
  flex: 1;
  background: var(--color-box);
  border-radius: ${({ theme }) => theme.unit}px;
  // padding: ${({ theme }) => 3 * theme.unit}px  0;
  margin-bottom: ${({ theme }) => 2 * theme.unit}px;
  .title {
    font-size: ${({ theme }) => theme.unit * 3}px;
    //line-height: 19px;
    margin-left: ${({ theme }) => 3 * theme.unit}px;
    margin-top: ${({ theme }) => 3 * theme.unit}px;
    // margin-bottom: ${({ theme }) => 2 * theme.unit}px;
  }

  .tableWrapper {
    display: flex;
    margin-top: ${({ theme }) => 3 * theme.unit}px;
    flex: 1;
    .rdg {
      flex: 1;
    }
  }

  .extraTradeClass {
    .rdg-header-row {
      background-color: inherit !important;
    }
  }
` as typeof Box

export const TableWrapStyled = styled(Box)`
  & {
    .toolbar {
      padding: 0;
    }
    border-radius: ${({ theme }) => theme.unit}px;
    .rdg {
      .rdg-header-row {
        border-radius: ${({ theme }) => theme.unit}px ${({ theme }) => theme.unit}px 0 0;
      }
    }
  }

  &.min-height .rdg {
    min-height: initial;
  }

  & .min-height .rdg {
    min-height: initial;
  }

  ${({ theme }) => TablePaddingX({ pLeft: theme.unit * 3, pRight: theme.unit * 3 })};
  &.fixed {
    position: relative;
    .toolbar {
      position: fixed;
      top: ${LAYOUT.HEADER_HEIGHT}px;
      @media (min-width: 1200px) {
        max-width: calc(1200px - 48px);
      }
      max-width: calc(100% - ${({ theme }) => 6 * theme.unit}px);
      z-index: 209;
      background: var(--color-box);
    }
  }
` as typeof Grid

export const TableProWrapStyled = styled(Box)`
  & {
    .toolbar {
      padding: 0;
    }
    background: var(--color-pop-bg);
    border-radius: ${({ theme }) => theme.unit}px;
    .rdg {
      .rdg-header-row {
        border-radius: ${({ theme }) => theme.unit}px ${({ theme }) => theme.unit}px 0 0;
        background: var(--color-pop-bg) !important;

        // .rdg-cell:last-of-type {
        //   padding-right: 0;
        // }
      }
    }
    // .rdg-row .rdg-cell:last-of-type {
    //   padding-right: 0 !important;
    // }
  }
  ${({ theme }) => TablePaddingX({ pLeft: theme.unit * 3, pRight: theme.unit * 3 })};
  &.fixed {
    position: relative;
    .toolbar {
      position: fixed;
      top: ${LAYOUT.HEADER_HEIGHT}px;
      @media (min-width: 1200px) {
        max-width: calc(1200px - 48px);
      }

      max-width: calc(100% - ${({ theme }) => 6 * theme.unit}px);
      z-index: 209;
      background: var(--color-box);
    }
  }
` as typeof Grid
export const FixedStyle = styled(Box)`
  @media only screen and (min-height: 784px) and (min-width: 1024px) {
    position: fixed;
  }
` as typeof Box
//    ${({theme}) => theme.border.defaultFrame({c_key: 'blur', d_R: 1})};
