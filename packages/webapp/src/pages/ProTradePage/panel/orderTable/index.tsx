import React from 'react'
import { withTranslation, TFunction } from 'react-i18next';
import { Tabs, Tab, Box, Divider } from '@mui/material'
import { OrderHistoryTable } from '@loopring-web/component-lib'
import { myLog } from '@loopring-web/common-resources';
import { useOrderList } from './hookTable'

export  const OrderTableView = withTranslation('common')(<C extends { [ key: string ]: any }>({
    t,
}:{
    t: TFunction<"translation">,
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

    const handleTabSwitch = React.useCallback((index: number) => {
        setTabValue(index)
        clearRawData()
    }, [clearRawData])

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

    return <>
        <Box padding={2} paddingTop={0} paddingBottom={0}>
            <Tabs
                value={tabValue}
                onChange={(e, index) => handleTabSwitch(index)}
                aria-label="tabs orderTable"
            >
                <Tab label={t('labelOrderTableOpenOrder')}/>
                <Tab label={t('labelOrderTableOrderHistory')}/>
            </Tabs>
            
        </Box>
        <Divider />
        <OrderHistoryTable
            {...{
                rawData,
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
