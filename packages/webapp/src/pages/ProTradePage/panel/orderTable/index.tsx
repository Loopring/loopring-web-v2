import React from 'react'
import { withTranslation, TFunction } from 'react-i18next';
import { Tabs, Tab, Box, Divider, FormControlLabel, Checkbox } from '@mui/material'
import { OrderHistoryTable } from '@loopring-web/component-lib'
import { myLog, CheckedIcon, CheckBoxIcon } from '@loopring-web/common-resources';
import { useOrderList } from './hookTable'
import styled from '@emotion/styled'

const CheckboxStyled = styled(Box)`
    position: absolute;
    top: 50%;
    right: ${({theme}) => theme.unit * 3}px;
    transform: translateY(-50%);
`

export  const OrderTableView = withTranslation('common')(<C extends { [ key: string ]: any }>({
    t,
    market,
}:{
    t: TFunction<"translation">,
    market?: string,
})=>{
    const { 
        getOrderDetail, 
        getOrderList, 
        rawData, 
        orderDetailList, 
        cancelOrder, 
        showLoading, 
        clearRawData, 
        setOrderOriginalData,
        handleScroll,
    } = useOrderList()
    const [tabValue, setTabValue] = React.useState(0)
    const [hideOtherPairs, setHideOtherPairs] = React.useState(false)

    const handleTabSwitch = React.useCallback((index: number) => {
        setTabValue(index)
        clearRawData()
    }, [clearRawData])

    const getFilteredData = React.useCallback(() => {
        return hideOtherPairs ? rawData.filter(o => o.market === market) : rawData
    }, [hideOtherPairs, market, rawData])

    React.useEffect(() => {
        const getData = async () => {
            const data = await getOrderList({
                limit: 50,
                status: tabValue === 0 ? 'processing' : 'processed,failed,cancelled,cancelling,expired'
            })
            setOrderOriginalData(data)
        }
        getData()
    }, [getOrderList, setOrderOriginalData, tabValue])

    const handleCheckBoxChange = React.useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        setHideOtherPairs(event.target.checked)
    }, [])

    return <>
        <Box padding={2} paddingTop={0} paddingBottom={0} style={{ position: 'relative' }}>
            <Tabs
                value={tabValue}
                onChange={(e, index) => handleTabSwitch(index)}
                aria-label="tabs orderTable"
            >
                <Tab label={t('labelOrderTableOpenOrder')}/>
                <Tab label={t('labelOrderTableOrderHistory')}/>
            </Tabs>
            <CheckboxStyled>
                <FormControlLabel style={{marginRight: 0}}
                    control={<Checkbox checked={hideOtherPairs} checkedIcon={<CheckedIcon/>}
                            icon={<CheckBoxIcon/>}
                            color="default" onChange={handleCheckBoxChange}/>} label={t('labelTradeProHideOtherPairs')}
                />
            </CheckboxStyled>
        </Box>
        <Divider />
        <OrderHistoryTable
            {...{
                rawData: getFilteredData(),
                getOrderList,
                getOrderDetail,
                orderDetailList,
                cancelOrder,
                showLoading,
                isOpenOrder: tabValue === 0,
                isPro: true,
                isScroll: true,
                handleScroll: handleScroll,
            }}
        />
    </>
})
