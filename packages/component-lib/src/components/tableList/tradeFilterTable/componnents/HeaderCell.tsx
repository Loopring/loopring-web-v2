import React, { Dispatch } from 'react';
import { ArrowSort, headerSortCell, SortableHeaderCellProps } from '../../../basic-lib';
import { WithTranslation, withTranslation } from 'react-i18next';
import { Box } from '@mui/material';

// type SharedHeaderCellProps<R, SR> = Pick<
//     HeaderRendererProps<R, SR>,
//     'sortDirection' | 'onSort' | 'priority'
//     >;
export type HeaderCellProps<R, SR> = SortableHeaderCellProps<R, SR> & {
    filterBy: string,
    setFilterBy: Dispatch<any>,
}

export const HeaderCell = withTranslation('tables')(<R extends any, SR>({
                                                                            t,
                                                                            column,
                                                                            sortDirection,
                                                                            priority,
                                                                            onSort,
                                                                            children,
                                                                            setFilterBy
                                                                        }: HeaderCellProps<R, SR> & WithTranslation) => {
    if (column.sortable) {

        return (<Box component={'span'} display={'flex'} alignItems={'center'}
                     className={`rdg-header-sort-cell ${headerSortCell}`}>
                <Box component={'a'} display={'flex'} alignItems={'center'} onClick={(e: React.MouseEvent) => {
                    onSort(e.ctrlKey);
                    setFilterBy('tradePair');
                }}>
                    {t('labelTradePair')}
                    <ArrowSort {...{sortDirection}}/>
                </Box>
                <Box component={'a'} display={'flex'} alignItems={'center'} onClick={(e: React.MouseEvent) => {
                    onSort(e.ctrlKey);
                    setFilterBy('Volume');
                }}>
                    {t('labelVolume')}
                    <ArrowSort {...{sortDirection}}/>
                </Box>
                {priority}
            </Box>
        );
    } else {
        return <>{children ? children : column.name}</>;
    }


});


