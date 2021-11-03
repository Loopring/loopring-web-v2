import React from 'react'
import {
    Column,
    generateColumns,
    generateRows,
    SortableHeaderCell,
    SortableHeaderCellProps,
    Table
} from '../basic-lib';
import {  WithTranslation, withTranslation, TFunction } from 'react-i18next';
import {  Typography } from '@mui/material';
import styled from '@emotion/styled';

interface Row {
    level: string;
    tradeVolume: string;
    rule: string;
    balance: string;
    maker: string;
    taker: string;
}
const TableStyle = styled(Table)`
    &.rdg{
      border-top: 1px solid var(--color-divide);
      text-align: center;
      min-height: 300px;
      
      .rdg-header-row{
        // background:var(--color-table-header-bg);
      }
      .rdg-row, .rdg-header-row {
        border-right: 1px solid var(--color-divide);

      }
      .rdg-cell{
        border-left-width: 1px;
        border-bottom-width: 1px;
        border-left-color: var(--color-divide);
        border-bottom-color: var(--color-divide);
      }
    }
`as typeof Table

export const VipPanel = withTranslation(['tables'])(({t, rawData,...rest}: & WithTranslation & { rawData: Row[] }) => {
    const getColumnModeTransaction = React.useCallback(({t}: WithTranslation): Column<any, unknown>[] => [
        {
            key: 'level', name: t('labelVipTableLevel'),
            // headerRenderer: (props: SortableHeaderCellProps<Row>) => <SortableHeaderCell {...props}
            //                                                                              children={<Typography
            //                                                                                  variant={'body1'}
            //                                                                                  paddingLeft={2}
            //                                                                                  component={'span'}>{t('labelLevel')}</Typography>}/>,
            // formatter: ({row}) => <Typography variant={'body1'}
            //                                   component={'span'}>{row.level}</Typography>
        },
        {key: 'tradeVolume', name: t('labelVipTable30dTradeVolume')},
        {key: 'rule', name: t('labelVipTableRule')},
        {key: 'balance', name: t('labelVipTableBalance')},
        {key: 'maker', name: t('labelVipTableMaker')},
        {key: 'taker', name: t('labelVipTableTaker')}
    ], [])

    const defaultArgs: any = {
      columnMode: getColumnModeTransaction({t, ...rest}),
      generateRows: (rawData: any) => rawData,
      generateColumns: ({columnsRaw}: any) => columnsRaw as Column<any, unknown>[],
    }

    return <TableStyle<Row, unknown> {...{...defaultArgs, t, ...rest, rawData}}  />

})