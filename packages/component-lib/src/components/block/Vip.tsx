import {
    Column,
    generateColumns,
    generateRows,
    SortableHeaderCell,
    SortableHeaderCellProps,
    Table
} from '../basic-lib';
import {  WithTranslation, withTranslation } from 'react-i18next';
import {  Typography } from '@mui/material';
import styled from '@emotion/styled';

interface Row {
    level: string;
    orderBook: string;
    AMM: string;
    deposit: string;
    withdraw: string;
    setPublicKey: string;
}
const TableStyle = styled(Table)`
    &.rdg{
      border-top: 1px solid var(--color-divide);
      text-align: center;
      .rdg-header-row{
        background:var(--color-table-header-bg);
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
`as typeof  Table




export const VipPanel = withTranslation(['common', 'layout'])(({t, rawData,...rest}: & WithTranslation & { rawData:string[][] }) => {
    const columnModeDefault: readonly Column<Row, unknown>[] = [
        {
            key: 'level', name: 'labelLevel',
            headerRenderer: (props: SortableHeaderCellProps<Row>) => <SortableHeaderCell {...props}
                                                                                         children={<Typography
                                                                                             variant={'body1'}
                                                                                             paddingLeft={2}
                                                                                             component={'span'}>{t('labelLevel')}</Typography>}/>,
            formatter: ({row}) => <Typography variant={'body1'} 
                                              component={'span'}>{row.level}</Typography>
        },
        {key: 'orderBook', name: 'labelOrderbook'},
        {key: 'AMM', name: 'AMM'},
        {key: 'deposit', name: 'labelDeposit'},
        {key: 'withdraw', name: 'labelWithdraw'},
        {key: 'setPublicKey', name: 'labelSetPublicKey'}
    ];


    const vipTableArgs = {
        rawData: rawData,
        columnMode: columnModeDefault,
        generateRows: generateRows,
        generateColumns: generateColumns,
    };
    return <TableStyle<Row, unknown> {...{...vipTableArgs, t, ...rest}}  />

})