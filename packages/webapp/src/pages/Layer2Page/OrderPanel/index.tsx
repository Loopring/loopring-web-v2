
import React from 'react'
import { OrderHistoryTable } from '@loopring-web/component-lib'
import { WithTranslation, withTranslation } from 'react-i18next'
import { useOrderList } from './hook'
import { StylePaper } from '../../styled'

const OrderPanel = withTranslation('common')((rest: WithTranslation) => {
    const container = React.useRef(null);
    const [pageSize, setPageSize] = React.useState(10);
    const { rawData, getOrderList, totalNum, showLoading, marketArray } = useOrderList()

    React.useEffect(() => {
        // @ts-ignore
        let height = container?.current?.offsetHeight;
        if (height) {
            setPageSize(Math.floor((height - 120) / 44) - 2);
        }
    }, [container, pageSize]);

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
                        showLoading,
                        marketArray,
                        ...rest
                    }} />
                </div>
            </StylePaper>
        </>
    )
})

export default OrderPanel
