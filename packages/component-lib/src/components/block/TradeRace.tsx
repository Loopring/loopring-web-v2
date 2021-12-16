import React from 'react'
import {
    Column,
    Table
} from '../basic-lib';
import {  WithTranslation, withTranslation } from 'react-i18next';
import styled from '@emotion/styled';
import { Box } from '@mui/material'

interface Row {
    project: string;
    pair: string;
    reward: string;
}
const TableStyle = styled(Table)`
    &.rdg{
      min-Height: 380px;
      border-top: 1px solid var(--color-divide);
      text-align: center;
      
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
      .rdg-align-left {
        text-align: left;
      }
      .rdg-align-right {
        text-align: right;
      }
    }
`as typeof Table

export const TradeRacePanel = withTranslation(['tables'])(({t, rawData, ...rest}: & WithTranslation & { rawData: Row[] }) => {
    const getColumnMode = React.useCallback(({t}: WithTranslation): Column<any, unknown>[] => [
        {
            key: 'project', 
            name: t('labelTradeRaceProject'), 
            formatter: ({row}) => {
                const value = row[ 'project' ]
                
                return (
                    <Box className="rdg-cell-value">
                        {value}
                    </Box>
                )
            }
        },
        {key: 'pair', name: t('labelTradeRacePair')},
        {key: 'reward', name: t('labelTradeRaceReward')}
    ], [])

    const defaultArgs: any = {
        columnMode: getColumnMode({t, ...rest}),
        generateRows: (rawData: any) => rawData,
        generateColumns: ({columnsRaw}: any) => columnsRaw as Column<any, unknown>[],
    }

    return <TableStyle<Row, unknown> {...{...defaultArgs, t, ...rest, rawData}}  />

})