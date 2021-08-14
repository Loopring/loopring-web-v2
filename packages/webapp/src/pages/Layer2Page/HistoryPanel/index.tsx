import React from 'react'
import { WithTranslation, withTranslation } from 'react-i18next'
import { Tabs, Tab } from '@material-ui/core'
import { TransactionTable, TradeTable, AmmRecordTable } from '@loopring-web/component-lib'
import { StylePaper } from '../../styled'
import { useGetTxs, useGetTrades, useOverview } from './hooks';
import { useAmmActivityMap } from 'stores/Amm/AmmActivityMap'

const TxPanel = withTranslation('common')((rest:WithTranslation<'common'>) => {
    const { t } = rest
    const container = React.useRef(null);
    const [pageSize, setPageSize] = React.useState(10);
    const [currentTab, setCurrentTab] = React.useState('transactions')
    const [page, setPage] = React.useState(0)

    const { txs: txTableData, isLoading } = useGetTxs()
    const { userTrades, showLoading} = useGetTrades()
    const { ammActivityMap }  = useAmmActivityMap()
    const { myAmmMarketArray } = useOverview({ammActivityMap})

    React.useEffect(() => {
        // @ts-ignore
        let height = container?.current?.offsetHeight;
        if (height) {
            setPageSize(Math.floor((height - 120) / 44) - 2);
        }
    }, [container, pageSize]);

    const _handlePageChange = React.useCallback((page: number) => {
        setPage(page);
    }, [])
    console.log(myAmmMarketArray)

    return (
        <StylePaper ref={container}>
            {/* <div className="title">{t('labelTxnPageTitle')}</div> */}
            <Tabs value={currentTab} onChange={(_event, value) => setCurrentTab(value)} aria-label="l2-history-tabs">
                <Tab label="Transactions" value="transactions"></Tab>
                <Tab label="Trades" value="trades"></Tab>
                <Tab label="AMM Records" value="ammRecords"></Tab>
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
                    <AmmRecordTable rawData={myAmmMarketArray} handlePageChange={_handlePageChange} page={page}/>
                ) }
            </div>
        </StylePaper>
    )
})

export default TxPanel
