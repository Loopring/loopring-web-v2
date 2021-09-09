import React from 'react'
import { OrderHistoryTable } from '@loopring-web/component-lib'
import { WithTranslation, withTranslation } from 'react-i18next'
import { useOrderList } from './hook'
import { StylePaper } from '../../styled'

const OrderPanel = withTranslation('common')((rest: WithTranslation) => {
    const container = React.useRef(null);
    const [pageSize, setPageSize] = React.useState(0);
    const {
        rawData,
        getOrderList,
        totalNum,
        showLoading,
        marketArray,
        showDetailLoading,
        getOrderDetail,
        orderDetailList
    } = useOrderList()

    React.useEffect(() => {
        // @ts-ignore
        let height = container?.current?.offsetHeight;
        if (height) {
            setPageSize(Math.floor((height - 88) / 44) - 1);
        }
    }, [container, pageSize]);

    React.useEffect(() => {
        if (pageSize) {
            getOrderList({
                limit: pageSize,
            })
        }
    }, [pageSize, getOrderList])

    return (
        <>
            <StylePaper ref={container}>
                {/*<div className="title">{rest.t('Orders History')}</div>*/}
                <div className="tableWrapper">
                    <OrderHistoryTable {...{
                        pagination: {
                            pageSize: pageSize,
                            total: totalNum,
                        },
                        rawData: rawData,
                        showFilter: true,
                        getOrderList,
                        marketArray,
                        showDetailLoading,
                        getOrderDetail,
                        orderDetailList,
                        ...rest,
                        showLoading,
                    }} />
                </div>
            </StylePaper>
        </>
    )
})

export default OrderPanel
