import _ from 'lodash'
import { WithTranslation, withTranslation } from 'react-i18next'
import { useSettings } from '../../../stores'
import React from 'react'
import { globalSetup, RowInvestConfig, TokenType } from '@loopring-web/common-resources'
import { Column, ModalCloseButton, Table, TablePagination } from '../../basic-lib'

import { Box, BoxProps, Modal, Typography } from '@mui/material'
import { SwitchPanelStyled, TablePaddingX } from '../../styled'
import styled from '@emotion/styled'
import { DefiSideStakingTableProps } from './Interface'
import { ConfirmStackingRedeem } from '../../tradePanel'
import { CoinIcons } from '../assetsTable'

const TableWrapperStyled = styled(Box)<BoxProps & { isMobile?: boolean }>`
  display: flex;
  flex-direction: column;
  flex: 1;

  .rdg {
    ${({ isMobile }) =>
      !isMobile
        ? `--template-columns: 33% 34% 33% !important;`
        : `--template-columns: 33% 34% 33% !important;`}
    .rdgCellCenter {
      height: 100%;
      justify-content: center;
      align-items: center;
    }

    .textAlignRight {
      text-align: right;
    }

    .textAlignCenter {
      text-align: center;
    }

    .textAlignLeft {
      text-align: left;
    }
  }

  ${({ theme }) => TablePaddingX({ pLeft: theme.unit * 3, pRight: theme.unit * 3 })};
` as (props: { isMobile?: boolean } & BoxProps) => JSX.Element
const TableStyled = styled(Table)`
  &.rdg {
    height: ${(props: any) => {
      if (props.ispro === 'pro') {
        return '620px'
      }
      if (props.currentheight) {
        return props.currentheight + 'px'
      }
    }};

    .rdg-cell.action {
      display: flex;
      justify-content: center;
      align-items: center;
    }
  }

  .textAlignRight {
    text-align: right;

    .rdg-header-sort-cell {
      justify-content: flex-end;
    }
  }

  .textAlignCenter {
    text-align: center;
  }
` as any

interface Item {
  coinJSON: any
  tokenSymbol: string
  amount: string
  value: string
}
export const TaikoFarmingPortfolioTable = withTranslation(['tables', 'common'])(
  <R extends Item>(props: DefiSideStakingTableProps<R> & WithTranslation) => {
    const {
      rawData,
      idIndex,
      pagination,
      tokenMap,
      geDefiSideStakingList,
      showloading,
      // onDetailClick,
      redeemItemClick: _redeemItemClick,
      hideAssets,
      t,
    } = props
    const [openDetail, setOpenDetail] = React.useState(false)
    const [openAlert, setOpenAlert] = React.useState(false)
    const [detail, setDetail] = React.useState<R | undefined>(undefined)
    const { isMobile } = useSettings()
    const [page, setPage] = React.useState(1)
    const updateData = _.debounce(
      ({
        // tableType,
        currPage = page,
        pageSize = pagination?.pageSize ?? 10,
      }: {
        // tableType: TableType;
        currPage?: number
        pageSize?: number
      }) => {
        geDefiSideStakingList({
          limit: pageSize,
          offset: (currPage - 1) * pageSize,
        })
      },
      globalSetup.wait,
    )

    const handlePageChange = React.useCallback(
      (currPage: number) => {
        if (currPage === page) return
        setPage(currPage)
        updateData({ currPage: currPage })
      },
      [updateData, page],
    )

    const getColumnModeTransaction = React.useCallback(
      (): Column<R, unknown>[] => [
        {
          key: 'token',
          sortable: false,
          width: 'auto',
          cellClass: 'textAlignLeft',
          headerCellClass: 'textAlignLeft',
          name: t('labelToken'),
          formatter: ({ row }) => {
            return (
              <Box height={'100%'} display={'flex'} alignItems={'center'}>
                <CoinIcons type={TokenType.single} tokenIcon={[row.coinJSON]} />
                <Typography
                  ml={1}
                  component={'span'}
                >
                  {row.tokenSymbol}
                </Typography>
              </Box>
            )
          },
        },
        {
          key: 'Amount',
          sortable: false,
          width: 'auto',
          cellClass: 'textAlignCenter',
          headerCellClass: 'textAlignCenter',
          name: t('labelAmount'),
          formatter: ({ row }) => {
            return <> {row.amount}</>
          },
        },
        {
          key: 'Value',
          sortable: false,
          width: 'auto',
          cellClass: 'textAlignRight',
          headerCellClass: 'textAlignRight',
          name: t('labelValue'),
          formatter: ({ row }) => {
            return <> {row.value}</>
          },
        },
      ],
      [t, tokenMap, idIndex, hideAssets],
    )

    const getColumnMobileTransaction = React.useCallback(
      (): Column<R, unknown>[] => [
        {
          key: 'token',
          sortable: false,
          width: 'auto',
          cellClass: 'textAlignLeft',
          headerCellClass: 'textAlignLeft',
          name: t('labelToken'),
          formatter: ({ row }) => {
            return (
              <>
                <CoinIcons type={TokenType.single} tokenIcon={[row.coinJSON]} />
                <Typography
                  ml={2}
                  component={'span'}
                >
                  {row.tokenSymbol}
                </Typography>
              </>
            )
          },
        },
        {
          key: 'Amount',
          sortable: false,
          width: 'auto',
          cellClass: 'textAlignCenter',
          headerCellClass: 'textAlignCenter',
          name: t('labelAmount'),
          formatter: ({ row }) => {
            return <> {row.amount}</>
          },
        },
        {
          key: 'Value',
          sortable: false,
          width: 'auto',
          cellClass: 'textAlignRight',
          headerCellClass: 'textAlignRight',
          name: t('labelValue'),
          formatter: ({ row }) => {
            return <> {row.value}</>
          },
        },
      ],
      [t, tokenMap, idIndex],
    )

    // const [isDropDown, setIsDropDown] = React.useState(true);

    const defaultArgs: any = {
      columnMode: isMobile ? getColumnMobileTransaction() : getColumnModeTransaction(),
      generateRows: (rawData: any) => rawData,
      generateColumns: ({ columnsRaw }: any) => columnsRaw as Column<any, unknown>[],
    }

    return (
      <TableWrapperStyled isMobile={isMobile}>
        <TableStyled
          currentheight={
            rawData.length > 0
              ? 200
              : 350
          }
          rowHeight={RowInvestConfig.rowHeight}
          headerRowHeight={RowInvestConfig.rowHeaderHeight}
          {...{
            ...defaultArgs,
            // rowRenderer: RowRenderer,
            ...props,
            rawData,
            showloading,
          }}
        />
        {!!(pagination && pagination.total > pagination.pageSize) && (
          <TablePagination
            page={page}
            pageSize={pagination.pageSize}
            total={pagination.total}
            onPageChange={handlePageChange}
          />
        )}
        <Modal
          open={openDetail}
          onClose={(_e: any) => setOpenDetail(false)}
          aria-labelledby='modal-modal-title'
          aria-describedby='modal-modal-description'
        >
          <SwitchPanelStyled width={'var(--modal-width)'}>
            <ModalCloseButton onClose={(_e: any) => setOpenDetail(false)} t={t} />
            {detail && (
              <Box flex={1} paddingY={2} width={'100%'} display={'flex'} flexDirection={'column'}>
                <Typography
                  variant={isMobile ? 'h5' : 'h4'}
                  marginTop={-4}
                  textAlign={'center'}
                  paddingBottom={2}
                >
                  {t('labelDeFiSideInvestmentDetails', {
                    ns: 'common',
                    symbol: 'LRC',
                  })}
                </Typography>
                {/* <DeFiSideDetail
                  tokenSell={tokenMap[idIndex[detail.tokenId]]}
                  order={{ ...detail }}
                  onRedeem={redeemItemClick as any}
                /> */}
              </Box>
            )}
          </SwitchPanelStyled>
        </Modal>
        <ConfirmStackingRedeem
          open={openAlert}
          handleClose={(_, isAgree?: boolean) => {
            setOpenAlert(false)
            if (isAgree) {
              _redeemItemClick(detail as any)
            }
          }}
        />
      </TableWrapperStyled>
    )
  },
)
