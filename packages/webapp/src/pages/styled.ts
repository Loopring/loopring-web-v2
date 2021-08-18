import styled from '@emotion/styled';
import { Box, Grid, Paper } from '@material-ui/core';
import { TablePaddingX } from '@loopring-web/component-lib';

export const StylePaper = styled(Box)`
  display: flex;
  flex-direction: column;
  width: 100%;
  //height: 100%;
  flex: 1;
  background: var(--color-box);
  border-radius: ${({ theme }) => theme.unit}px;
  // padding: ${({ theme }) => 3 * theme.unit}px  0;
  margin-bottom: ${({ theme }) => 2* theme.unit}px;
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
` as typeof Paper;


export const  TableWrapStyled = styled(Grid)`
 
  &{
    background: var(--color-box);
    border-radius: ${({ theme }) => theme.unit}px;
    .rdg{
      .rdg-header-row {
        border-radius: ${({theme}) => theme.unit}px ${({theme}) => theme.unit}px 0 0;
      }
    }
  }
  ${({theme}) => TablePaddingX({pLeft:theme.unit * 3,pRight:theme.unit * 3})}
` as typeof Grid
export const FixedStyle = styled(Box)`
  @media only screen and (min-height: 784px ) and (min-width: 1024px) {
    position: fixed;
  }
` as typeof Box
//    ${({theme}) => theme.border.defaultFrame({c_key: 'blur', d_R: 1})};
