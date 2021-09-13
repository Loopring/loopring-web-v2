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

interface Row {
    level: string;
    orderBook: string;
    AMM: string;
    deposit: string;
    withdraw: string;
    setPublicKey: string;
}




export const VipPanel = withTranslation(['common', 'layout'])(({t, rawData,...rest}: & WithTranslation & { rawData:string[][] }) => {
    const columnModeDefault: readonly Column<Row, unknown>[] = [
        {
            key: 'level', name: 'labelLevel',
            headerRenderer: (props: SortableHeaderCellProps<Row>) => <SortableHeaderCell {...props}
                                                                                         children={<Typography
                                                                                             variant={'body1'}
                                                                                             paddingLeft={2}
                                                                                             component={'span'}>{t('labelLevel')}</Typography>}/>,
            formatter: ({row}) => <Typography variant={'body1'} paddingLeft={2}
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
    return <Table<Row, unknown> {...{...vipTableArgs, t, ...rest}}  />

})