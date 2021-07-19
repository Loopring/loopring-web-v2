

import { RefAttributes, useState } from 'react'

import Tabs from '@material-ui/core/Tabs'
import Tab from '@material-ui/core/Tab'
import Checkbox from '@material-ui/core/Checkbox'
import styled from '@emotion/styled'

import { FormControlLabel, TradeTable, } from '@loopring-web/component-lib'
import { withTranslation, WithTranslation } from 'react-i18next';
import { CheckBoxIcon, CheckedIcon } from '@loopring-web/common-resources'
import { RouteComponentProps, withRouter } from 'react-router'
import { Box } from '@material-ui/core';
import { RawDataTradeItem, BasicHeaderItem, HeadMenuType } from '@loopring-web/component-lib'
import { TableWrapStyled } from '../../../styled';

// const StylePaper = styled(Box)`
//
//
//   background-color: ${({theme}) => theme.colorBase.background().default};
//   border-radius: ${({theme}) => theme.unit}px;
//
//   //padding: 20px;
//
//   // .tableWrapper {
//   //   margin-top: ${({theme}) => theme.unit * 1.5}px;
//   //   border: 1px solid ${({theme}) => theme.colorBase.borderColor};
//   //   border-radius: ${({theme}) => theme.unit}px;
//   //   padding: 26px;
//   // }
// ` as typeof Box;


const applyProps = (index: number) => {
    return {
        id: `simple-tab-${index}`,
        'aria-controls': `simple-tabpanel-${index}`,
    }
}
const StyledTabsWrapper = styled.div`
          position: relative;
          width: 100%;
          margin-top: ${({theme}) => theme.unit * 4}px;
        `

const StyledFormControlLabel = styled(FormControlLabel)`
          position: absolute;
          top: 0;
          right: ${({theme}) => theme.unit}px;
          margin: ${({theme}) => theme.unit}px 0 0 0;
        `


const TradePanel = withTranslation('common')(
   // withRouter(
    (
        {tradeArray,  myTradeArray, t}:
            { tradeArray: RawDataTradeItem[], myTradeArray: RawDataTradeItem[] } & WithTranslation & RouteComponentProps) => {
        const [isAllTrade, setIsAllTrade] = useState(false)
        const [value, setValue] = useState(1)
        const handleChange = (event: any, newValue: any) => {
            setValue(newValue)
        }

        const handleCheckboxChange = () => {
            setIsAllTrade((flag: boolean) => !flag)
        }

        return (
            <StyledTabsWrapper>
                {/* <StyledFormControlLabel
                    control={<Checkbox checked={isAllTrade} size={'small'} checkedIcon={<CheckedIcon/>}
                                       icon={<CheckBoxIcon/>} color={'default'} onChange={handleCheckboxChange}/>}
                    label={t('labelTradePanelHideOtherPairs')}/> */}

                <Tabs value={value}
                      onChange={handleChange}
                      aria-label="tabs switch">
                    <Tab label={t('labelMyTrade')} {...applyProps(0)} />
                    <Tab label={t('labelRecent')}   {...applyProps(1)} />
                </Tabs>

                <TableWrapStyled marginY={2}  paddingBottom={2} flex={1}>
                    {value === 0 ?  <TradeTable rawData={myTradeArray} /> : <TradeTable rawData={tradeArray}/> }
                </TableWrapStyled>

            </StyledTabsWrapper>
        )
    }
    ) as  (props: { tradeArray: RawDataTradeItem[], myTradeArray: RawDataTradeItem[] }) => JSX.Element;
//)

export default TradePanel

