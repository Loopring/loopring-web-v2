import { ResetProps } from '../Interface';
import { withTranslation, WithTranslation } from 'react-i18next';
import { IBData } from '@loopring-web/common-resources';
import { SwitchPanel, SwitchPanelProps } from '../../basic-lib';
import { ResetWrap, } from '../components';
import React from 'react';

export const ResetPanel = withTranslation('common', {withRef: true})(<T extends IBData<I>, I>(
    {
        onResetClick,
        resetBtnStatus,
        chargeFeeToken,
        chargeFeeTokenList,
        assetsData,
        ...rest
    }: ResetProps<T> & WithTranslation) => {

    const props: SwitchPanelProps<'tradeMenuList' | 'trade'> = {
        index: 0, // show default show
        panelList: [{
            key: "trade",
            element: React.useMemo(  () => <ResetWrap<T> key={"transfer"}
                                            {...{
                                                ...rest,
                                                chargeFeeToken,
                                                chargeFeeTokenList,
                                                resetBtnStatus,
                                                onResetClick,
                                                assetsData,
                                            }} />,[onResetClick,resetBtnStatus,rest, assetsData, chargeFeeToken, chargeFeeTokenList]),
            toolBarItem: undefined
        },]
    }
    return <SwitchPanel {...{...rest, ...props}} />
}) as <T extends IBData<I>, I>(props: ResetProps<T> & React.RefAttributes<any>) => JSX.Element;

// export const TransferModal = withTranslation()