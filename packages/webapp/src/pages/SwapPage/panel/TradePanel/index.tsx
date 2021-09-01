import { useCallback, useEffect, useState } from 'react'

import Tabs from '@material-ui/core/Tabs'
import Tab from '@material-ui/core/Tab'
import styled from '@emotion/styled'

import { RawDataTradeItem, TradeTable, } from '@loopring-web/component-lib'
import { withTranslation, WithTranslation } from 'react-i18next';
import { RouteComponentProps } from 'react-router'
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
        {tradeArray, myTradeArray, t}:
            { tradeArray: RawDataTradeItem[], myTradeArray: RawDataTradeItem[] } & WithTranslation & RouteComponentProps) => {
        const [value, setValue] = useState(1)
        const [tableHeight, setTableHeight] = useState(0);
        const handleChange = (event: any, newValue: any) => {
            setValue(newValue)
        }

        const getCurrentHeight = useCallback(() => {
            const height = window.innerHeight
            const tableHeight = height - 64 - 117 - 56 - 120 - 20 - 100 - 50 - 15;
            setTableHeight(tableHeight)
        }, [])

        useEffect(() => {
            getCurrentHeight()
            window.addEventListener('resize', getCurrentHeight)
            return () => {
                window.removeEventListener('resize', getCurrentHeight)
            }
        }, [getCurrentHeight]);

        return (<TableWrapStyled item alignSelf={'stretch'} xs={12} marginY={2} paddingBottom={2} flex={1}
                                 className={'MuiPaper-elevation2'}>
                <TabsStyled value={value}
                            onChange={handleChange}
                            aria-label="tabs switch">
                    <Tab label={t('labelMyTrade')} {...applyProps(0)} />
                    <Tab label={t('labelRecent')}   {...applyProps(1)} />
                </TabsStyled>
                <Divider/>
                <TradeTable rawData={value === 0 ? myTradeArray : tradeArray} currentHeight={tableHeight}/>
            </TableWrapStyled>
        )
    }
) as (props: { tradeArray: RawDataTradeItem[], myTradeArray: RawDataTradeItem[] }) => JSX.Element;
//)

export default TradePanel

