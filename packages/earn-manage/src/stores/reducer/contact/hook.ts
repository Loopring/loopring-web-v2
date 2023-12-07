import { useDispatch, useSelector } from 'react-redux'
import { getContact, statusUnset, getUserContact, restUerContact } from './reducer'
import { ContactStates } from './interface'
import React from 'react'

export function useContact() {
  const contactMap: ContactStates = useSelector((state: any) => state.contactMap)
  const dispatch = useDispatch()
  return {
    ...contactMap,
    restUserContact: React.useCallback(() => dispatch(restUerContact(undefined)), [dispatch]),
    statusUnset: React.useCallback(() => dispatch(statusUnset(undefined)), [dispatch]),
    getContact: React.useCallback(() => dispatch(getContact(undefined)), [dispatch]),
    getUserContact: React.useCallback(() => dispatch(getUserContact(undefined)), [dispatch]),
  }
}
