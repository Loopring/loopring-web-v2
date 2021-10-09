import React from 'react'
import { Tab, Tabs, Box } from '@mui/material';
import { OrderHistoryTable } from '@loopring-web/component-lib'
import { WithTranslation, withTranslation } from 'react-i18next'
import { useOrderList } from './hook'
import { StylePaper } from '../../styled'
import { myLog } from '@loopring-web/common-resources';

const OrderPanel = withTranslation('common')((rest: WithTranslation) => {
    const {t} = rest
    const container = React.useRef(null);
    const [pageSize, setPageSize] = React.useState(0);
    const [tableValue, setTabValue] = React.useState(0);
    const {
        rawData,
        getOrderList,
        totalNum,
        showLoading,
        marketArray,
        showDetailLoading,
        getOrderDetail,
        orderDetailList,
        // openOrderList,
        cancelOrder,
        clearRawData,
    } = useOrderList()

    React.useEffect(() => {
        // @ts-ignore
        let height = container?.current?.offsetHeight;
        if (height) {
            setPageSize(Math.floor((height - 88) / 44) - 3);
        }
    }, [container, pageSize]);

    React.useEffect(() => {
        if (pageSize) {
            myLog(66666)
            getOrderList({
                limit: pageSize,
                status: tableValue === 0 ? 'processing' : 'processed,failed,cancelled,cancelling,expired'
            })
        }
    }, [pageSize, getOrderList, tableValue])



    const handleChangeIndex = (index: 0 | 1) => {
        clearRawData()
        setTabValue(index);
        // handleTabChange(index);
    };
    const isOpenOrder = tableValue === 0
    // const openOrderList = rawData.filter(o => o.status === 'processing')
    // const orderHistoryList = rawData.filter(o => o.status !== 'processing')

    return (
        <>
            <StylePaper ref={container} className={'MuiPaper-elevation2'}>
                <Box padding={2} paddingBottom={0}>
                    <Tabs
                        value={tableValue}
                        onChange={(e, index) => handleChangeIndex(index)}
                        aria-label="tabs orderTable"
                    >
                        <Tab label={t('labelOrderTableOpenOrder')}/>
                        <Tab label={t('labelOrderTableOrderHistory')}/>
                    </Tabs>
                </Box>
                {/*<div className="title">{rest.t('Orders History')}</div>*/}
                <div className="tableWrapper table-divide-short">
                    <OrderHistoryTable {...{
                        pagination: isOpenOrder ? undefined : {
                            pageSize: pageSize,
                            total: totalNum,
                        },
                        // rawData: isOpenOrder ? openOrderList : orderHistoryList,
                        rawData: rawData,
                        showFilter: true,
                        getOrderList,
                        marketArray,
                        showDetailLoading,
                        getOrderDetail,
                        orderDetailList,
                        ...rest,
                        showLoading,
                        isOpenOrder: isOpenOrder,
                        cancelOrder,
                    }} />
                </div>
            </StylePaper>
        </>
    )
})

export default OrderPanel
