import styled from '@emotion/styled'
import { Box, Tab, Tabs } from '@mui/material'
import React from 'react'
import { Button, TradeNFTTable, TsNFTTable } from '@loopring-web/component-lib'
import { useTranslation } from 'react-i18next'
import { useHistoryNFT } from './hookHistory'
import { useAccount, useTokenMap } from '@loopring-web/core'
import { useHistory, useLocation, useRouteMatch } from 'react-router-dom'
import { BackIcon } from '@loopring-web/common-resources'

const StyledPaper = styled(Box)`
  background: var(--color-box);
  border-radius: ${({ theme }) => theme.unit}px;
`

enum TabIndex {
  transactions = 'transactions',
  trades = 'trades',
}

export const MyNFTHistory = () => {
  const { t } = useTranslation('common')
  const match: any = useRouteMatch('/NFT/transactionNFT/:tab')
  const { search } = useLocation()

  const [currentTab, setCurrentTab] = React.useState(() => {
    return match?.params.tab ?? TabIndex.transactions
  })
  const { idIndex, tokenMap } = useTokenMap()
  const { nftHistory, container, getTxnList, getTradeList, nftTrades } = useHistoryNFT()
  const {
    account: { accountId, accAddress },
  } = useAccount()
  const history = useHistory()
  const handleTabChange = React.useCallback(
    (value: TabIndex, _pageSize?: number) => {
      setCurrentTab(value)
      history.replace(`/NFT/transactionNFT/${value}?${search.replace('?', '')}`)
    },
    [history, search],
  )

  // React.useEffect(() => {
  //   let height = container?.current?.offsetHeight;
  //   if (height) {
  //     const pageSize = Math.floor((height - 120) / RowConfig.rowHeight) - 3;
  //     setPageSize(Math.floor((height - 120) / RowConfig.rowHeight) - 3);
  //     handleTabChange(currentTab, pageSize);
  //   }
  // }, [container?.current?.offsetHeight]);
  return (
    <Box flex={1} marginTop={0} marginBottom={2} display={'flex'} flexDirection={'column'}>
      <Box marginBottom={2}>
        <Button
          startIcon={<BackIcon fontSize={'small'} />}
          variant={'text'}
          size={'medium'}
          sx={{ color: 'var(--color-text-secondary)' }}
          color={'inherit'}
          onClick={history.goBack}
        >
          {t('labelTransactions')}
        </Button>
      </Box>
      <StyledPaper
        className={'MuiPaper-elevation2'}
        flex={1}
        display={'flex'}
        flexDirection={'column'}
      >
        <Box marginTop={2} marginLeft={2}>
          <Tabs
            value={currentTab}
            onChange={(_event, value) => handleTabChange(value)}
            aria-label='l2-history-tabs'
            variant='scrollable'
          >
            <Tab label={t('labelLayer2HistoryTransactions')} value={TabIndex.transactions} />
            <Tab label={t('labelLayer2HistoryTrades')} value={TabIndex.trades} />
          </Tabs>
        </Box>
        <Box flex={1} display={'flex'} ref={container} marginTop={2}>
          {currentTab === TabIndex.transactions ? (
            <TsNFTTable
              {...{
                ...(nftHistory.userNFTTxs as any),
                getTxnList,
                accAddress,
                accountId,
              }}
            />
          ) : currentTab === TabIndex.trades ? (
            <TradeNFTTable {...{ ...nftTrades, getTradeList, idIndex, tokenMap }} />
          ) : (
            <></>
          )}
        </Box>
      </StyledPaper>
    </Box>
  )
}
