import React from 'react'
import { withTranslation, TFunction } from 'react-i18next';
import { Tabs, Tab, Box, Divider } from '@mui/material'
import { OrderHistoryTable } from '@loopring-web/component-lib'
import { useOrderList } from '../spot/hookTable'

export  const OrderTableView = withTranslation('common')(<C extends { [ key: string ]: any }>({
    t,
}:{
    t: TFunction<"translation">,
})=>{
    const { getOrderDetail, getOrderList, rawData, orderDetailList, cancelOrder, showLoading, clearRawData } = useOrderList()
    const [tabValue, setTabValue] = React.useState(0)

    const handleTabSwitch = React.useCallback((index: number) => {
        clearRawData()
        setTabValue(index)
    }, [clearRawData])

    React.useEffect(() => {
        getOrderList({
            limit: 50,
            status: tabValue === 0 ? 'processing' : 'processed,failed,cancelled,cancelling,expired'
        })
    }, [getOrderList, tabValue])

    return <>
        <Box padding={2} paddingBottom={0}>
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
                isScroll: true,
            }}
        />
    </>
})
