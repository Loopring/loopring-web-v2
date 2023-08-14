import React from 'react'
import styled from '@emotion/styled'

import { InputSearch, QuoteTable } from '@loopring-web/component-lib'
import { WithTranslation, withTranslation } from 'react-i18next'
import { RowConfig } from '@loopring-web/common-resources'
import { Box, Button, Container, Divider, Grid, Tab, Tabs } from '@mui/material'
import { useQuotePage } from './hook'
import { TableWrapStyled, useAccount, useSystem } from '@loopring-web/core'
import * as sdk from '@loopring-web/loopring-sdk'

const RowStyled = styled(Grid)`
  & .MuiGrid-root:not(:last-of-type) > div {
    // margin-right: ${({ theme }) => theme.unit * 2}px;
  }
` as typeof Grid

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
  // const onTest = () => {
  //   console.log("100 EdDSASig" + performance.now());
  //   for (let i = 0; i < 100; i++) {
  //     const dataToSig = sdk.sortObjDictionary({
  //       exchange: "0x12b7cccF30ba360e5041C6Ce239C9a188B709b2B",
  //       accountId: "10111",
  //       storageId: "111",
  //       sellToken: {
  //         tokenId: 1,
  //         volume: "100",
  //       },
  //       buyToken: {
  //         tokenId: 2,
  //         volume: "100",
  //       },
  //       allOrNone: false,
  //       validUntil: 100,
  //       maxFeeBips: 50,
  //       fillAmountBOrS: false, // amm only false
  //       tradeChannel: "MIXED",
  //       orderType: "amm",
  //       eddsaSignature: "",
  //     });
  //     const sig = sdk.getEdDSASig(
  //       "POST",
  //       "https://loopring.io/",
  //       "apiTest",
  //       dataToSig,
  //       account.eddsaKey.sk
  //     );
  //   }
  //   console.log(performance.now());
  //   // sdk.getEddsakey();
  // };
  return (
    <Box display={'flex'} flexDirection={'column'} flex={1}>
      {/*<Button*/}
      {/*  onClick={() => {*/}
      {/*    onTest();*/}
      {/*  }}*/}
      {/*>*/}
      {/*  test button*/}
      {/*</Button>*/}

      <TableWrapStyled
        ref={tableRef as any}
        marginTop={1}
        marginBottom={3}
        paddingBottom={1}
        flex={1}
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
                {/* <Tab label={t('labelQuotePageTradeRanking')} value="tradeRanking"/> */}
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
