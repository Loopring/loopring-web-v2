import React from 'react';

import { ResetProps } from '@loopring-web/component-lib';
import { IBData, WalletMap } from '@loopring-web/common-resources';
import { useBtnStatus } from 'hooks/common/useBtnStatus';
import { useChargeFees } from 'hooks/common/useChargeFees';
import * as sdk from 'loopring-sdk'
import { useTokenMap } from 'stores/token';

export const useReset = <T>(): {
    resetProps: ResetProps<T>
} => {

    const { btnStatus, } = useBtnStatus()

    const { tokenMap } = useTokenMap()

    const { chargeFeeList, } = useChargeFees('ETH', sdk.OffchainFeeReqType.UPDATE_ACCOUNT, tokenMap)

    const onResetClick = React.useCallback(() => {
    }, [])

    const resetProps: ResetProps<T> = {
        onResetClick,
        resetBtnStatus: btnStatus,
        chargeFeeToken: 'ETH',
        chargeFeeTokenList: chargeFeeList,
    }


    return {
        resetProps: resetProps as ResetProps<T>,
    }
}
