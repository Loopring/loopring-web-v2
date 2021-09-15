import React from 'react';

import { ResetProps } from '@loopring-web/component-lib';
import { IBData, WalletMap, FeeInfo } from '@loopring-web/common-resources';
import { useBtnStatus } from 'hooks/common/useBtnStatus';
import { useChargeFees } from 'hooks/common/useChargeFees';
import * as sdk from 'loopring-sdk'
import { useTokenMap } from 'stores/token';

export const useReset = <T>(): {
    resetProps: ResetProps<T>
} => {
    const [resetFeeInfo, setResetFeeInfo] = React.useState<FeeInfo>()
    const { btnStatus, } = useBtnStatus()

    const { tokenMap } = useTokenMap()

    const { chargeFeeList, } = useChargeFees('ETH', sdk.OffchainFeeReqType.UPDATE_ACCOUNT, tokenMap)

    const onResetClick = React.useCallback(() => {
    }, [])

    const handleFeeChange = React.useCallback((value: FeeInfo): void => {
        setResetFeeInfo(value)
    }, [setResetFeeInfo])

    const resetProps: ResetProps<T> = {
        onResetClick,
        resetBtnStatus: btnStatus,
        // chargeFeeToken: 'ETH',
        chargeFeeToken: resetFeeInfo?.belong,
        chargeFeeTokenList: chargeFeeList,
        handleFeeChange,
    }

    return {
        resetProps: resetProps as ResetProps<T>,
    }
}
