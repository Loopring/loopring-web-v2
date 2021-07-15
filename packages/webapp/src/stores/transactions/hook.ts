import { useState, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { RootState } from 'stores'

export function useTransactions() {
    const transactions = useSelector((state: RootState) => state.transactions)
}
