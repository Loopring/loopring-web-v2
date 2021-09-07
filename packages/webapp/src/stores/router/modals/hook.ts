import { useDispatch, useSelector } from 'react-redux'
import { updateWithdrawData, } from './reducer';
import { WithdrawData, ModalDataStatus, } from './interface';
import React from 'react';
import { RequireOne } from '@loopring-web/common-resources';
import { RootState } from 'stores';

export function useModalData(): ModalDataStatus & {
    updateWithdrawData: (withdrawData: RequireOne<WithdrawData, never>) => void,
} {
    const modalDataStatus: ModalDataStatus = useSelector((state: RootState) => state._router_modalData)
    const dispatch = useDispatch();

    return {
        ...modalDataStatus,
        updateWithdrawData: React.useCallback((withdrawData: RequireOne<WithdrawData, never>) => {
            dispatch(updateWithdrawData(withdrawData))
        }, [dispatch])
    }

}
