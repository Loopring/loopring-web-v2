import React, { useEffect } from 'react'
import { RawDataAmmItem, AmmTable, AmmSideTypes } from '@loopring-web/component-lib'
import { WithTranslation, withTranslation } from 'react-i18next'
import store from 'stores'
import { LoopringAPI } from 'api_wrapper'
import { AmmTxType } from 'loopring-sdk'
import { StylePaper } from '../../styled'
import { volumeToCount } from '../../../hooks/help';
import { useGetAmmRecord } from'./hook'

const AmmPanel = withTranslation('common')(({ t, ...rest }: WithTranslation<'common'>) => {
    const container = React.useRef(null);
    const [pageSize, setPageSize] = React.useState(10);
    const { ammRecordList, showLoading } = useGetAmmRecord()

    React.useEffect(() => {
        // @ts-ignore
        let height = container?.current?.offsetHeight;
        if (height) {
            setPageSize(Math.floor((height - 120) / 44) - 2);
        }
    }, [container, pageSize]);

    return (
        <>
            <StylePaper ref={container}>
                <div className="title">{t('labelAmmPageTitle')}</div>
                <div className="tableWrapper">
                    <AmmTable {...{
                        rawData: ammRecordList,
                        pagination: {
                            pageSize: pageSize
                        },
                        showFilter: true,
                        showLoading: showLoading,
                        ...rest}}/>
                </div>
            </StylePaper>
        </>
    )
})

export default AmmPanel
