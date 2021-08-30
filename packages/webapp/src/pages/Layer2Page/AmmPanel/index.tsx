import React from 'react'
import {  AmmTable } from '@loopring-web/component-lib'
import { WithTranslation, withTranslation } from 'react-i18next'
import { StylePaper } from '../../styled'
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
            <StylePaper ref={container} className={'MuiPaper-elevation2'}>
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
