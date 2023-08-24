import { updateContacts, reset, statusUnset } from './reducer'
import { useDispatch, useSelector } from 'react-redux'
import React from 'react'
import { ContactsState } from './interface';
import { RootState } from '../index';

export const useContacts = (): ContactsState & {
  updateContacts: () => void
  reset: () => void
  statusUnset: () => void
} => {
  const contacts: ContactsState = useSelector((state: RootState) => state.contacts)
  const dispatch = useDispatch()
  return {
    ...contacts,
    statusUnset: React.useCallback(() => dispatch(statusUnset(undefined)), [dispatch]),
    updateContacts: React.useCallback(() => dispatch(updateContacts({})), [dispatch]),
    reset: React.useCallback(() => dispatch(reset({})), [dispatch]),
  }
}
