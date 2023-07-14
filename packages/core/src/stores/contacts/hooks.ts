import { updateAccountId, updateContacts } from './reducer'
import { useDispatch, useSelector } from 'react-redux'
import React from 'react'
import { RootState } from '../../index'
import { ContactsState, DisplayContact } from './reducer'

export const useContacts = (): ContactsState & {
  updateContacts: (contacts: DisplayContact[] | undefined) => void
  updateAccountId: (accountId: number) => void
} => {
  const contacts: ContactsState = useSelector((state: RootState) => state.contacts)
  const dispatch = useDispatch()
  return {
    ...contacts,
    updateContacts: React.useCallback((contacts) => dispatch(updateContacts(contacts)), [dispatch]),
    updateAccountId: React.useCallback(
      (accountId) => dispatch(updateAccountId(accountId)),
      [dispatch],
    ),
  }
}
