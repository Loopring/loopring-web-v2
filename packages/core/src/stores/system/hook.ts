import { useDispatch, useSelector } from 'react-redux'
import { updateSystem, statusUnset, clearSystem } from './reducer'
import { System, SystemStatus } from './interface'
import React from 'react'

export function useSystem(): SystemStatus & {
  updateSystem: (system: Partial<System>) => void
  clearSystem: () => void
  statusUnset: () => void
} {
  const system: SystemStatus = useSelector((state: any) => state.system)
  const dispatch = useDispatch()
  return {
    ...system,
    statusUnset: React.useCallback(() => dispatch(statusUnset(undefined)), [dispatch]),
    updateSystem: React.useCallback(
      (system: Partial<System>) => dispatch(updateSystem(system)),
      [dispatch],
    ),
    clearSystem: React.useCallback(
      () => dispatch(clearSystem(undefined)),
      [dispatch],
    ),
  }
}
