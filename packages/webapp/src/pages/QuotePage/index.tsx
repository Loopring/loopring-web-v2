import React from 'react'
import { InputSearch, QuoteTable } from '@loopring-web/component-lib'
import { WithTranslation, withTranslation } from 'react-i18next'
import { RowConfig } from '@loopring-web/common-resources'
import { Box, Container, Divider, Grid, Tab, Tabs } from '@mui/material'
import { useQuotePage } from './hook'
import { TableWrapStyled, useAccount, useSystem } from '@loopring-web/core'
export const QuotePage = withTranslation('common')(({ t, ...rest }: WithTranslation) => {
  const tableRef = React.useRef<HTMLDivElement>()
  const { account } = useAccount()
  const { forexMap } = useSystem()
  const {
    tableTabValue,
    handleTabChange,
    searchValue,
    removeMarket,
    favoriteMarket,
    handleSearchChange,
    addMarket,
    tableHeight,
    filteredData,
    showLoading,
    campaignTagConfig,
    handleRowClick,
  } = useQuotePage({ tableRef })
  return (
    <Box display={'flex'} flexDirection={'column'} flex={1} marginBottom={3}>
      <TableWrapStyled
        ref={tableRef as any}
        paddingBottom={1}
        flex={1}
        bgcolor={'var(--color-box)'}
        className={'MuiPaper-elevation2'}
      >
        <Box display={'flex'} flexDirection={'column'}>
          <Container className={'toolbar'}>
            <Box
              paddingLeft={1}
              paddingRight={2}
              display={'flex'}
              flexDirection={'row'}
              justifyContent={'space-between'}
              alignItems={'center'}
            >
              <Tabs
                value={tableTabValue}
                onChange={handleTabChange}
                disabled={showLoading}
                aria-label='Market Switch'
              >
                <Tab label={t('labelQuotePageFavourite')} value='favourite' />
                <Tab label={t('labelAll')} value='all' />
              </Tabs>
              <InputSearch value={searchValue} onChange={handleSearchChange} />
            </Box>
            <Divider style={{ marginTop: '-1px' }} />
          </Container>

          <QuoteTable /* onVisibleRowsChange={onVisibleRowsChange} */
            onRowClick={(index: any, row: any, col: any) => handleRowClick(row)}
            campaignTagConfig={campaignTagConfig ?? ({} as any)}
            forexMap={forexMap as any}
            account={account}
            rawData={filteredData}
            favoriteMarket={favoriteMarket}
            addFavoriteMarket={addMarket}
            removeFavoriteMarket={removeMarket}
            currentheight={tableHeight}
            rowHeight={RowConfig.rowHeight}
            headerRowHeight={RowConfig.rowHeaderHeight}
            showLoading={showLoading}
            {...{ ...rest }}
          />
        </Box>
      </TableWrapStyled>
    </Box>
  )
})
