import styled from '@emotion/styled'
import { Meta, Story } from '@storybook/react/types-6-0'
import { withTranslation } from 'react-i18next'
import { MemoryRouter } from 'react-router-dom'
import { QuoteTable, QuoteTableRawDataItem } from './QuoteTable'
import { OrderHistoryTable } from './orderHistoryTable'
import { RawDataTransactionItem, TransactionStatus, TransactionTable, TransactionTradeTypes } from './transactionsTable'
import { OrderHistoryRawDataItem } from './orderHistoryTable/OrderHistoryTable'
import { TradeStatus, TradeTypes } from '../../static-resource';

const Style = styled.div`
  color: #fff;
  flex: 1;
  height: 100%;
  flex: 1;
`

// type RawDataItem = (string | number | number[] | string[])[] | {}

const rawDataLastPrice: QuoteTableRawDataItem[] = [
    {
        pair: {
            first: 'LRC',
            last: 'BUSD'
        },
        lastPrice: 12.4,
        change: -0.12,
        high: 123.34,
        low: 23.41,
        volume: 21759000
    },
    {
        pair: {
            first: 'BTC',
            last: 'USDT'
        },
        lastPrice: 12.4,
        change: 2.13,
        high: 123.34,
        low: 23.41,
        volume: 21759000
    },
    {
        pair: {
            first: 'LRC',
            last: 'DAI'
        },
        lastPrice: 12.4,
        change: 3.44,
        high: 123.34,
        low: 23.41,
        volume: 21759000
    },
    {
        pair: {
            first: 'LRC',
            last: 'USDT'
        },
        lastPrice: 12.4,
        change: -0.52,
        high: 123.34,
        low: 23.41,
        volume: 21759000
    },
    {
        pair: {
            first: 'LRC',
            last: 'BUSD'
        },
        lastPrice: 12.4,
        change: 8.12,
        high: 123.34,
        low: 23.41,
        volume: 21759000
    },
    {
        pair: {
            first: 'LRC',
            last: 'BUSD'
        },
        lastPrice: 12.4,
        change: -0.12,
        high: 123.34,
        low: 23.41,
        volume: 21759000
    },
    {
        pair: {
            first: 'BTC',
            last: 'USDT'
        },
        lastPrice: 12.4,
        change: 2.13,
        high: 123.34,
        low: 23.41,
        volume: 21759000
    },
    {
        pair: {
            first: 'LRC',
            last: 'DAI'
        },
        lastPrice: 12.4,
        change: 3.44,
        high: 123.34,
        low: 23.41,
        volume: 21759000
    },
    {
        pair: {
            first: 'LRC',
            last: 'USDT'
        },
        lastPrice: 12.4,
        change: -0.52,
        high: 123.34,
        low: 23.41,
        volume: 21759000
    },
    {
        pair: {
            first: 'LRC',
            last: 'BUSD'
        },
        lastPrice: 12.4,
        change: 8.12,
        high: 123.34,
        low: 23.41,
        volume: 21759000
    },
    {
        pair: {
            first: 'LRC',
            last: 'BUSD'
        },
        lastPrice: 12.4,
        change: -0.12,
        high: 123.34,
        low: 23.41,
        volume: 21759000
    },
    {
        pair: {
            first: 'BTC',
            last: 'USDT'
        },
        lastPrice: 12.4,
        change: 2.13,
        high: 123.34,
        low: 23.41,
        volume: 21759000
    },
    {
        pair: {
            first: 'LRC',
            last: 'DAI'
        },
        lastPrice: 12.4,
        change: 3.44,
        high: 123.34,
        low: 23.41,
        volume: 21759000
    },
    {
        pair: {
            first: 'LRC',
            last: 'USDT'
        },
        lastPrice: 12.4,
        change: -0.52,
        high: 123.34,
        low: 23.41,
        volume: 21759000
    },
    {
        pair: {
            first: 'LRC',
            last: 'BUSD'
        },
        lastPrice: 12.4,
        change: 8.12,
        high: 123.34,
        low: 23.41,
        volume: 21759000
    },
    {
        pair: {
            first: 'LRC',
            last: 'BUSD'
        },
        lastPrice: 12.4,
        change: 8.12,
        high: 123.34,
        low: 23.41,
        volume: 21759000
    },
    {
        pair: {
            first: 'LRC',
            last: 'BUSD'
        },
        lastPrice: 12.4,
        change: 8.12,
        high: 123.34,
        low: 23.41,
        volume: 21759000
    },
    {
        pair: {
            first: 'LRC',
            last: 'BUSD'
        },
        lastPrice: 12.4,
        change: 8.12,
        high: 123.34,
        low: 23.41,
        volume: 21759000
    },
    {
        pair: {
            first: 'LRC',
            last: 'BUSD'
        },
        lastPrice: 12.4,
        change: 8.12,
        high: 123.34,
        low: 23.41,
        volume: 21759000
    },
]

const rawDataOrderHistory: OrderHistoryRawDataItem[] = [
    {
        side: TradeTypes.Buy,
        amount: {
            from: {
                key: 'ETH',
                value: 2.05
            },
            to: {
                key: 'LRC',
                value: 13540.45
            }
        },
        average: 2345.33,
        filledAmount: {
            from: {
                key: 'ETH',
                value: 1.87
            },
            to: {
                key: 'LRC',
                value: 10023.55
            }
        },
        filledPrice: {
            key: 'LRC',
            value: 0.77
        },
        time: 2,
        status: TradeStatus.Cancelled,
        detailTable: [
            {
                amount: {
                    from: {
                        key: 'ETH',
                        value: 1.05
                    },
                    to: {
                        key: 'LRC',
                        value: 2454.33
                    }
                },
                tradingPrice: 2934.07,
                filledPrice: 2935.00,
                time: 1,
                total: {
                    key: 'LRC',
                    value: 850
                }
            },
        ]
    },
    {
        side: TradeTypes.Sell,
        amount: {
            from: {
                key: 'ETH',
                value: 2.05
            },
            to: {
                key: 'LRC',
                value: 13540.45
            }
        },
        average: 2345.33,
        filledAmount: {
            from: {
                key: 'ETH',
                value: 1.87
            },
            to: {
                key: 'LRC',
                value: 10023.55
            }
        },
        filledPrice: {
            key: 'LRC',
            value: 0.77
        },
        time: 2,
        status: TradeStatus.Processed,
        detailTable: [
            {
                amount: {
                    from: {
                        key: 'ETH',
                        value: 1.05
                    },
                    to: {
                        key: 'LRC',
                        value: 2454.33
                    }
                },
                tradingPrice: 2934.07,
                filledPrice: 2935.00,
                time: 1,
                total: {
                    key: 'LRC',
                    value: 850
                }
            },
        ]
    },
    {
        side: TradeTypes.Buy,
        amount: {
            from: {
                key: 'ETH',
                value: 2.05
            },
            to: {
                key: 'LRC',
                value: 13540.45
            }
        },
        average: 2345.33,
        filledAmount: {
            from: {
                key: 'ETH',
                value: 1.87
            },
            to: {
                key: 'LRC',
                value: 10023.55
            }
        },
        filledPrice: {
            key: 'LRC',
            value: 0.77
        },
        time: 2,
        status: TradeStatus.Cancelled,
        detailTable: [
            {
                amount: {
                    from: {
                        key: 'ETH',
                        value: 1.05
                    },
                    to: {
                        key: 'LRC',
                        value: 2454.33
                    }
                },
                tradingPrice: 2934.07,
                filledPrice: 2935.00,
                time: 1,
                total: {
                    key: 'LRC',
                    value: 850
                }
            },
        ]
    },
    {
        side: TradeTypes.Sell,
        amount: {
            from: {
                key: 'ETH',
                value: 2.05
            },
            to: {
                key: 'LRC',
                value: 13540.45
            }
        },
        average: 2345.33,
        filledAmount: {
            from: {
                key: 'ETH',
                value: 1.87
            },
            to: {
                key: 'LRC',
                value: 10023.55
            }
        },
        filledPrice: {
            key: 'LRC',
            value: 0.77
        },
        time: 2,
        status: TradeStatus.Processing,
        detailTable: [
            {
                amount: {
                    from: {
                        key: 'ETH',
                        value: 1.05
                    },
                    to: {
                        key: 'LRC',
                        value: 2454.33
                    }
                },
                tradingPrice: 2934.07,
                filledPrice: 2935.00,
                time: 1,
                total: {
                    key: 'LRC',
                    value: 850
                }
            },
        ]
    },
    {
        side: TradeTypes.Buy,
        amount: {
            from: {
                key: 'ETH',
                value: 2.05
            },
            to: {
                key: 'LRC',
                value: 13540.45
            }
        },
        average: 2345.33,
        filledAmount: {
            from: {
                key: 'ETH',
                value: 1.87
            },
            to: {
                key: 'LRC',
                value: 10023.55
            }
        },
        filledPrice: {
            key: 'LRC',
            value: 0.77
        },
        time: 2,
        status: TradeStatus.Cancelled,
        detailTable: [
            {
                amount: {
                    from: {
                        key: 'ETH',
                        value: 1.05
                    },
                    to: {
                        key: 'LRC',
                        value: 2454.33
                    }
                },
                tradingPrice: 2934.07,
                filledPrice: 2935.00,
                time: 1,
                total: {
                    key: 'LRC',
                    value: 850
                }
            },
        ]
    },
    {
        side: TradeTypes.Sell,
        amount: {
            from: {
                key: 'ETH',
                value: 2.05
            },
            to: {
                key: 'LRC',
                value: 13540.45
            }
        },
        average: 2345.33,
        filledAmount: {
            from: {
                key: 'ETH',
                value: 1.87
            },
            to: {
                key: 'LRC',
                value: 10023.55
            }
        },
        filledPrice: {
            key: 'LRC',
            value: 0.77
        },
        time: 2,
        status: TradeStatus.Processed,
        detailTable: [
            {
                amount: {
                    from: {
                        key: 'ETH',
                        value: 1.05
                    },
                    to: {
                        key: 'LRC',
                        value: 2454.33
                    }
                },
                tradingPrice: 2934.07,
                filledPrice: 2935.00,
                time: 1,
                total: {
                    key: 'LRC',
                    value: 850
                }
            },
        ]
    },
    {
        side: TradeTypes.Buy,
        amount: {
            from: {
                key: 'ETH',
                value: 2.05
            },
            to: {
                key: 'LRC',
                value: 13540.45
            }
        },
        average: 2345.33,
        filledAmount: {
            from: {
                key: 'ETH',
                value: 1.87
            },
            to: {
                key: 'LRC',
                value: 10023.55
            }
        },
        filledPrice: {
            key: 'LRC',
            value: 0.77
        },
        time: 2,
        status: TradeStatus.Cancelled,
        detailTable: [
            {
                amount: {
                    from: {
                        key: 'ETH',
                        value: 1.05
                    },
                    to: {
                        key: 'LRC',
                        value: 2454.33
                    }
                },
                tradingPrice: 2934.07,
                filledPrice: 2935.00,
                time: 1,
                total: {
                    key: 'LRC',
                    value: 850
                }
            },
        ]
    },
    {
        side: TradeTypes.Sell,
        amount: {
            from: {
                key: 'ETH',
                value: 2.05
            },
            to: {
                key: 'LRC',
                value: 13540.45
            }
        },
        average: 2345.33,
        filledAmount: {
            from: {
                key: 'ETH',
                value: 1.87
            },
            to: {
                key: 'LRC',
                value: 10023.55
            }
        },
        filledPrice: {
            key: 'LRC',
            value: 0.77
        },
        time: 2,
        status: TradeStatus.Waiting,
        detailTable: [
            {
                amount: {
                    from: {
                        key: 'ETH',
                        value: 1.05
                    },
                    to: {
                        key: 'LRC',
                        value: 2454.33
                    }
                },
                tradingPrice: 2934.07,
                filledPrice: 2935.00,
                time: 1,
                total: {
                    key: 'LRC',
                    value: 850
                }
            },
        ]
    },
    {
        side: TradeTypes.Buy,
        amount: {
            from: {
                key: 'ETH',
                value: 2.05
            },
            to: {
                key: 'LRC',
                value: 13540.45
            }
        },
        average: 2345.33,
        filledAmount: {
            from: {
                key: 'ETH',
                value: 1.87
            },
            to: {
                key: 'LRC',
                value: 10023.55
            }
        },
        filledPrice: {
            key: 'LRC',
            value: 0.77
        },
        time: 2,
        status: TradeStatus.Expired,
        detailTable: [
            {
                amount: {
                    from: {
                        key: 'ETH',
                        value: 1.05
                    },
                    to: {
                        key: 'LRC',
                        value: 2454.33
                    }
                },
                tradingPrice: 2934.07,
                filledPrice: 2935.00,
                time: 1,
                total: {
                    key: 'LRC',
                    value: 850
                }
            },
        ]
    },
    {
        side: TradeTypes.Sell,
        amount: {
            from: {
                key: 'ETH',
                value: 2.05
            },
            to: {
                key: 'LRC',
                value: 13540.45
            }
        },
        average: 2345.33,
        filledAmount: {
            from: {
                key: 'ETH',
                value: 1.87
            },
            to: {
                key: 'LRC',
                value: 10023.55
            }
        },
        filledPrice: {
            key: 'LRC',
            value: 0.77
        },
        time: 2,
        status: TradeStatus.Cancelling,
        detailTable: [
            {
                amount: {
                    from: {
                        key: 'ETH',
                        value: 1.05
                    },
                    to: {
                        key: 'LRC',
                        value: 2454.33
                    }
                },
                tradingPrice: 2934.07,
                filledPrice: 2935.00,
                time: 1,
                total: {
                    key: 'LRC',
                    value: 850
                }
            },
        ]
    },
    {
        side: TradeTypes.Buy,
        amount: {
            from: {
                key: 'ETH',
                value: 2.05
            },
            to: {
                key: 'LRC',
                value: 13540.45
            }
        },
        average: 2345.33,
        filledAmount: {
            from: {
                key: 'ETH',
                value: 1.87
            },
            to: {
                key: 'LRC',
                value: 10023.55
            }
        },
        filledPrice: {
            key: 'LRC',
            value: 0.77
        },
        time: 2,
        status: TradeStatus.Cancelled,
        detailTable: [
            {
                amount: {
                    from: {
                        key: 'ETH',
                        value: 1.05
                    },
                    to: {
                        key: 'LRC',
                        value: 2454.33
                    }
                },
                tradingPrice: 2934.07,
                filledPrice: 2935.00,
                time: 1,
                total: {
                    key: 'LRC',
                    value: 850
                }
            },
        ]
    },
    {
        side: TradeTypes.Sell,
        amount: {
            from: {
                key: 'ETH',
                value: 2.05
            },
            to: {
                key: 'LRC',
                value: 13540.45
            }
        },
        average: 2345.33,
        filledAmount: {
            from: {
                key: 'ETH',
                value: 1.87
            },
            to: {
                key: 'LRC',
                value: 10023.55
            }
        },
        filledPrice: {
            key: 'LRC',
            value: 0.77
        },
        time: 2,
        status: TradeStatus.Processing,
        detailTable: [
            {
                amount: {
                    from: {
                        key: 'ETH',
                        value: 1.05
                    },
                    to: {
                        key: 'LRC',
                        value: 2454.33
                    }
                },
                tradingPrice: 2934.07,
                filledPrice: 2935.00,
                time: 1,
                total: {
                    key: 'LRC',
                    value: 850
                }
            },
        ]
    },
    {
        side: TradeTypes.Buy,
        amount: {
            from: {
                key: 'ETH',
                value: 2.05
            },
            to: {
                key: 'LRC',
                value: 13540.45
            }
        },
        average: 2345.33,
        filledAmount: {
            from: {
                key: 'ETH',
                value: 1.87
            },
            to: {
                key: 'LRC',
                value: 10023.55
            }
        },
        filledPrice: {
            key: 'LRC',
            value: 0.77
        },
        time: 2,
        status: TradeStatus.Cancelled,
        detailTable: [
            {
                amount: {
                    from: {
                        key: 'ETH',
                        value: 1.05
                    },
                    to: {
                        key: 'LRC',
                        value: 2454.33
                    }
                },
                tradingPrice: 2934.07,
                filledPrice: 2935.00,
                time: 1,
                total: {
                    key: 'LRC',
                    value: 850
                }
            },
        ]
    },
    {
        side: TradeTypes.Sell,
        amount: {
            from: {
                key: 'ETH',
                value: 2.05
            },
            to: {
                key: 'LRC',
                value: 13540.45
            }
        },
        average: 2345.33,
        filledAmount: {
            from: {
                key: 'ETH',
                value: 1.87
            },
            to: {
                key: 'LRC',
                value: 10023.55
            }
        },
        filledPrice: {
            key: 'LRC',
            value: 0.77
        },
        time: 2,
        status: TradeStatus.Processed,
        detailTable: [
            {
                amount: {
                    from: {
                        key: 'ETH',
                        value: 1.05
                    },
                    to: {
                        key: 'LRC',
                        value: 2454.33
                    }
                },
                tradingPrice: 2934.07,
                filledPrice: 2935.00,
                time: 1,
                total: {
                    key: 'LRC',
                    value: 850
                }
            },
        ]
    },
]

const rawDataTransaction: RawDataTransactionItem[] = [
    {
        token: 'LRC',
        from: '0x5e8cxxxxxe741',
        to: 'My Loopring',
        amount: 25987.09324,
        fee: {
            unit: 'ETH',
            value: 0.0993
        },
        memo: 'NoteNoteNoteNoteNoteNoteNote',
        time: 3,
        txnHash: '0x2b21xxxxxxx02',
        status: TransactionStatus.processed,
        path: '/hashxxx',
        tradeType: TransactionTradeTypes.deposit,
    },
    {
        token: 'ETH',
        from: 'My Loopring',
        to: '0x5e8cxxxxxe741',
        amount: 25987.09324,
        fee: {
            unit: 'DPR',
            value: 0.0993
        },
        memo: '',
        time: 1,
        txnHash: '0x2b21xxxxxxx02',
        status: TransactionStatus.processing,
        tradeType: TransactionTradeTypes.transfer,
    },
    {
        token: 'CRV',
        from: '0x5e8cxxxxxe741',
        to: 'My Loopring',
        amount: 25987.09324,
        fee: {
            unit: 'LRC',
            value: 0.0993
        },
        memo: 'NoteNoteNoteNoteNoteNoteNote',
        time: 2,
        txnHash: '0x2b21xxxxxxx02',
        status: TransactionStatus.processed,
        path: '/hashxxx',
        tradeType: TransactionTradeTypes.withdraw,
    },
    {
        token: 'CRV',
        from: '0x5e8cxxxxxe741',
        to: 'My Loopring',
        amount: 25987.09324,
        fee: {
            unit: 'LRC',
            value: 0.0993
        },
        memo: 'NoteNoteNoteNoteNoteNoteNote',
        time: 2,
        txnHash: '0x2b21xxxxxxx02',
        status: TransactionStatus.processed,
        path: '/hashxxx',
        tradeType: TransactionTradeTypes.withdraw,
    },
    {
        token: 'CRV',
        from: '0x5e8cxxxxxe741',
        to: 'My Loopring',
        amount: 25987.09324,
        fee: {
            unit: 'LRC',
            value: 0.0993
        },
        memo: 'NoteNoteNoteNoteNoteNoteNote',
        time: 2,
        txnHash: '0x2b21xxxxxxx02',
        status: TransactionStatus.failed,
        path: '/hashxxx',
        tradeType: TransactionTradeTypes.withdraw,
    },
    {
        token: 'CRV',
        from: '0x5e8cxxxxxe741',
        to: 'My Loopring',
        amount: 25987.09324,
        fee: {
            unit: 'LRC',
            value: 0.0993
        },
        memo: 'NoteNoteNoteNoteNoteNoteNote',
        time: 2,
        txnHash: '0x2b21xxxxxxx02',
        status: TransactionStatus.processed,
        path: '/hashxxx',
        tradeType: TransactionTradeTypes.withdraw,
    },
    {
        token: 'CRV',
        from: '0x5e8cxxxxxe741',
        to: 'My Loopring',
        amount: 25987.09324,
        fee: {
            unit: 'LRC',
            value: 0.0993
        },
        memo: 'NoteNoteNoteNoteNoteNoteNote',
        time: 2,
        txnHash: '0x2b21xxxxxxx02',
        status: TransactionStatus.failed,
        path: '/hashxxx',
        tradeType: TransactionTradeTypes.withdraw,
    },
    {
        token: 'CRV',
        from: '0x5e8cxxxxxe741',
        to: 'My Loopring',
        amount: 25987.09324,
        fee: {
            unit: 'LRC',
            value: 0.0993
        },
        memo: 'NoteNoteNoteNoteNoteNoteNote',
        time: 2,
        txnHash: '0x2b21xxxxxxx02',
        status: TransactionStatus.processed,
        path: '/hashxxx',
        tradeType: TransactionTradeTypes.withdraw,
    },
]

const Template: Story<any> = withTranslation()((args: any) => {
    const {type} = args
    return (
        <>
            <Style>
                <MemoryRouter initialEntries={['/']}>
                    {type === 'lastPrice' ? <QuoteTable {...args} /> : type === 'orderHistory' ?
                        <OrderHistoryTable {...args} /> : <TransactionTable {...args} />}

                </MemoryRouter>
            </Style>
        </>
    )
}) as Story<any>

export const OrderHistory = Template.bind({})
export const Quote = Template.bind({})
export const Transaction = Template.bind({})

Quote.args = {
    rawData: rawDataLastPrice,
    type: 'lastPrice',
    onVisibleRowsChange: (data: any) => {
        console.log(data)
    },
}

OrderHistory.args = {
    rawData: rawDataOrderHistory,
    type: 'orderHistory',
    showFilter: true
    // pagination: {
    //     pageSize: 5
    // }
}

Transaction.args = {
    rawData: rawDataTransaction,
    type: 'transaction',
    pagination: {
        pageSize: 5
    },
    showFilter: true
}
export default {
    title: 'components/TableList',
    component: QuoteTable,
    argTypes: {},
} as Meta
