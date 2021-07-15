import styled from '@emotion/styled';
import { Box, Grid, Paper } from '@material-ui/core';
import { TablePaddingX } from '@loopring-web/component-lib';

export const StylePaper = styled(Box)`
  display: flex;
  flex-direction: column;
  width: 100%;
  //height: 100%;
  flex: 1;
  background-color: ${({ theme }) => theme.colorBase.background().default};
  border-radius: ${({ theme }) => theme.unit}px;
  // padding: ${({ theme }) => 3 * theme.unit}px  0;
  margin-bottom: ${({ theme }) => 2* theme.unit}px;
  .title {
    font-family: Gilroy-Medium;
    font-size: ${({ theme }) => theme.unit * 3}px;
    line-height: 19px;
    margin-left: ${({ theme }) => 3 * theme.unit}px;
    margin-top: ${({ theme }) => 3 * theme.unit}px;
    margin-bottom: ${({ theme }) => 2 * theme.unit}px;
  }

  .tableWrapper {
    display: flex;
    margin-top: ${({ theme }) => 2 * theme.unit}px;
    flex: 1;
    .rdg {
      flex: 1;
    }
  }
` as typeof Paper;


export const  TableWrapStyled = styled(Grid)`
  &{
    background-color: ${({theme}) => theme.colorBase.background().default};
    border-radius: ${({ theme }) => theme.unit}px;
    .rdg{
      .rdg-header-row {
        border-radius: ${({theme}) => theme.unit}px ${({theme}) => theme.unit}px 0 0;
      }
    }
  }
  ${({theme}) => TablePaddingX({pLeft:theme.unit * 3,pRight:theme.unit * 3})}
` as typeof Grid

//    ${({theme}) => theme.border.defaultFrame({c_key: 'blur', d_R: 1})};
