import { ExportAccountProps } from '../Interface';
import { withTranslation, WithTranslation } from 'react-i18next';
import { IBData } from '@loopring-web/common-resources';
import { SwitchPanel, SwitchPanelProps } from '../../basic-lib';
import { ExportAccountWrap } from '../components';
import React from 'react';

export const ExportAccountPanel = withTranslation('common', {withRef: true})(<T extends IBData<I>, I>(
    {
        exportAccountProps,
        ...rest
    }: ExportAccountProps & WithTranslation) => {

    const props: SwitchPanelProps<'tradeMenuList' | 'trade'> = {
        index: 0, // show default show
        panelList: [{
            key: "trade",
            element: React.useMemo(() => <ExportAccountWrap key={"transfer"}
                                            {...{
                                                exportAccountProps,
                                                ...rest,
                                            }} />,[exportAccountProps, rest]),
            toolBarItem: undefined
        },]
    }
    return <SwitchPanel {...{...rest, ...props}} />
})

// export const TransferModal = withTranslation()