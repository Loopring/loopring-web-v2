

import { RefAttributes, useState } from 'react'

import Tabs from '@material-ui/core/Tabs'
import Tab from '@material-ui/core/Tab'
import Checkbox from '@material-ui/core/Checkbox'
import styled from '@emotion/styled'

import { FormControlLabel, TradeTable, } from '@loopring-web/component-lib'
import { withTranslation, WithTranslation } from 'react-i18next';
import { CheckBoxIcon, CheckedIcon } from '@loopring-web/common-resources'
import { RouteComponentProps, withRouter } from 'react-router'
import { RawDataTradeItem, BasicHeaderItem, HeadMenuType } from '@loopring-web/component-lib'
import { TableWrapStyled } from '../../../styled';
import { Divider } from '@material-ui/core'


const applyProps = (index: number) => {
    return {
        id: `simple-tab-${index}`,
        'aria-controls': `simple-tabpanel-${index}`,
    }
}
const WrapperStyled = styled.div`
            position: relative;
            width: 100%;
            margin-top: ${({theme}) => theme.unit * 4}px;
            background-color: var(--color-box);
            box-shadow: var(--shadow);
            border-radius: ${({theme}) => theme.unit}px;
        `

const TabsStyled = styled(Tabs)`
    margin-left: ${({theme}) => theme.unit}px;
`

// const StyledFormControlLabel = styled(FormControlLabel)`
//             position: absolute;
//             top: 0;
//             right: ${({theme}) => theme.unit}px;
//             margin: ${({theme}) => theme.unit}px 0 0 0;
//         `

const TradePanel = withTranslation('common')(
   // withRouter(
    (
        {tradeArray,  myTradeArray, t}:
            { tradeArray: RawDataTradeItem[], myTradeArray: RawDataTradeItem[] } & WithTranslation & RouteComponentProps) => {
        // const [isAllTrade, setIsAllTrade] = useState(false)
        const [value, setValue] = useState(1)
        const handleChange = (event: any, newValue: any) => {
            setValue(newValue)
        }

        // const handleCheckboxChange = () => {
        //     setIsAllTrade((flag: boolean) => !flag)
        // }

        return (
            <WrapperStyled>
                {/* <StyledFormControlLabel
                    control={<Checkbox checked={isAllTrade} size={'small'} checkedIcon={<CheckedIcon/>}
                                       icon={<CheckBoxIcon/>} color={'default'} onChange={handleCheckboxChange}/>}
                    label={t('labelTradePanelHideOtherPairs')}/> */}

                <TabsStyled value={value}
                      onChange={handleChange}
                      aria-label="tabs switch">
                    <Tab label={t('labelMyTrade')} {...applyProps(0)} />
                    <Tab label={t('labelRecent')}   {...applyProps(1)} />
                </TabsStyled>
                <Divider />
                <TableWrapStyled marginY={2} /* paddingBottom={2} */ flex={1}>
                    {value === 0 ?  <TradeTable rawData={myTradeArray} /> : <TradeTable rawData={tradeArray}/> }
                </TableWrapStyled>

            </WrapperStyled>
        )
    }
    ) as  (props: { tradeArray: RawDataTradeItem[], myTradeArray: RawDataTradeItem[] }) => JSX.Element;
//)

export default TradePanel

