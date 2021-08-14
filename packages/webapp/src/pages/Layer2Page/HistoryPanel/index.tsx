import React from 'react'
import { WithTranslation, withTranslation } from 'react-i18next'
import { Tabs, Tab } from '@material-ui/core'
import { TransactionTable, TradeTable, AmmTable } from '@loopring-web/component-lib'
import { StylePaper } from '../../styled'
import { useGetTxs, useGetTrades, useGetAmmRecord } from './hooks';

const TxPanel = withTranslation('common')((rest:WithTranslation<'common'>) => {
    const [pageSize, setPageSize] = React.useState(10);
    const [currentTab, setCurrentTab] = React.useState('transactions')

    const { txs: txTableData, isLoading } = useGetTxs()
    const { userTrades, showLoading} = useGetTrades()
    const { ammRecordList, showLoading: ammLoading } = useGetAmmRecord()

    const { t } = rest
    const container = React.useRef(null);

    React.useEffect(() => {
        // @ts-ignore
        let height = container?.current?.offsetHeight;
        if (height) {
            setPageSize(Math.floor((height - 120) / 44) - 2);
        }
    }, [container, pageSize]);

    return (
        <StylePaper ref={container}>
            <Tabs value={currentTab} onChange={(_event, value) => setCurrentTab(value)} aria-label="l2-history-tabs">
                <Tab label={t('labelLayer2HistoryTransactions')} value="transactions"></Tab>
                <Tab label={t('labelLayer2HistoryTrades')} value="trades"></Tab>
                <Tab label={t('labelLayer2HistoryAmmRecords')} value="ammRecords"></Tab>
            </Tabs>
            <div className="tableWrapper">
                {currentTab === 'transactions' ? (
                    <TransactionTable {...{
                        rawData: txTableData,
                        pagination: {
                            pageSize: pageSize
                        },
                        showFilter: true,
                        showLoading: isLoading,
                        ...rest
                    }} />
                ) : currentTab === 'trades' ? (
                    <TradeTable {...{
                        rawData: userTrades,
                        // pagination: {
                        //     pageSize: pageSize
                        // },
                        showFilter: true,
                        showLoading: showLoading,
                        ...rest}}/>
                ) : (
                    // <AmmRecordTable rawData={myAmmMarketArray} handlePageChange={_handlePageChange} page={page}/>
                    <AmmTable {...{
                        rawData: ammRecordList,
                        pagination: {
                            pageSize: pageSize
                        },
                        showFilter: true,
                        showLoading: ammLoading,
                        ...rest}}/>
                ) }
            </div>
        </StylePaper>
    )
})

export default TxPanel
