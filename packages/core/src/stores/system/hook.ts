import { useDispatch, useSelector } from 'react-redux'
import { updateSystem, statusUnset } from './reducer'
import { System, SystemStatus } from './interface'
import React from 'react'
import Decimal from 'decimal.js'
import { useSettings } from '@loopring-web/component-lib'

export function useSystem(): SystemStatus & {
  updateSystem: (system: Partial<System>) => void
  statusUnset: () => void
  getValueInCurrency: (valueInUSD: string) => string
} {
  const system: SystemStatus = useSelector((state: any) => state.system)
  const { currency } = useSettings()
  const dispatch = useDispatch()
  return {
    ...system,
    statusUnset: React.useCallback(() => dispatch(statusUnset(undefined)), [dispatch]),
    updateSystem: React.useCallback(
      (system: Partial<System>) => dispatch(updateSystem(system)),
      [dispatch],
    ),
    getValueInCurrency: (valueInUSD: string) => {
      return system.forexMap[currency] && 
      new Decimal(valueInUSD).mul(system.forexMap[currency]).toString()
    }
  }
}

