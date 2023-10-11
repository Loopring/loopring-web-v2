import { useDispatch, useSelector } from 'react-redux'
import { ToggleState } from './interface'
import { updateToggleStatus } from './reducer'
import React from 'react'

export function useToggle() {
  const toggle: ToggleState = useSelector((state: any) => state.toggle)
  const dispatch = useDispatch()
  return {
    toggle,
    updateToggleStatus: React.useCallback(() => {
      dispatch(updateToggleStatus(undefined))
    }, [dispatch]),
  }
}
