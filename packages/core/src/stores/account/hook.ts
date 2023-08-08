import { useDispatch, useSelector } from 'react-redux'
import { changeShowModel, cleanAccountStatus, statusUnset, updateAccountStatus } from './reducer'
import React from 'react'
import { Account, AccountState, getShortAddr } from '@loopring-web/common-resources'
import { RootState } from '../index'

export function useAccount() {
  const { status, errorMessage, ...account }: AccountState = useSelector(
    (state: RootState) => state.account,
  )
  // const [shouldShow,setShouldShow] = React.useState(account._userOnModel)
  const dispatch = useDispatch()

  const resetAccount = React.useCallback(
    (props?: { shouldUpdateProvider?: boolean | undefined }) => {
      dispatch(cleanAccountStatus(props))
    },
    [dispatch],
  )

  const updateAccount = React.useCallback(
    (account: Partial<Account>) => {
      dispatch(updateAccountStatus(account))
    },
    [dispatch],
  )

  const shouldShow = React.useMemo(() => {
    return account._userOnModel
  }, [account])

  const setShouldShow = React.useCallback(
    (flag: boolean) => {
      dispatch(changeShowModel({ _userOnModel: flag }))
    },
    [dispatch],
  )

  const addressShort = getShortAddr(account.accAddress)
  

  return {
    account,
    addressShort,
    resetAccount,
    shouldShow,
    setShouldShow,
    updateAccount,
    statusUnset: React.useCallback(() => {
      dispatch(statusUnset(undefined))
    }, [dispatch]),
    status,
    errorMessage,
  }
}
