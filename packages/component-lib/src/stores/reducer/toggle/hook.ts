import { useDispatch, useSelector } from 'react-redux'
import { ToggleState } from './interface'
import { updateToggleStatus } from './reducer'
import React from 'react'
import { AccountStatus, MapChainId, SagaStatus } from '@loopring-web/common-resources'
import { store } from '@loopring-web/core'
import _ from 'lodash'

export function useToggle() {
  const toggle: ToggleState = useSelector((state: any) => state.toggle)
  const { status: accountStatus } = useSelector((state: any) => state.account)
  const [newToggle, setToggle] = React.useState(toggle)
  const dispatch = useDispatch()
  React.useEffect(() => {
    const { account, toggle: _toggle, system } = store.getState()
    const network = MapChainId[system.chainId] ?? MapChainId[1]
    if (
      accountStatus == SagaStatus.UNSET &&
      account.readyState === AccountStatus.ACTIVATED &&
      toggle?.whiteList &&
      toggle?.whiteList[network?.toUpperCase()] &&
      toggle?.whiteList[network?.toUpperCase()]
    ) {
      const toggle = _.cloneDeep(_toggle)
      toggle?.whiteList[network?.toUpperCase()].forEach((item: string) => {
        // @ts-ignore
        const has = item?.superUserAddress?.find(
          (addr: string) => addr?.toLowerCase() == account.accAddress?.toLowerCase(),
        )
        if (has) {
          // @ts-ignore
          item?.superUserFunction?.forEach((fn: string) => {
            const key: string | undefined = Reflect.ownKeys(toggle).find(
              // @ts-ignore
              (_toggle: string) => _toggle?.toUpperCase() == fn?.toUpperCase(),
            )
            if (key) {
              toggle[key] = { ...toggle[key], enable: true }
            }
          })
        }
      })
      setToggle((state) => {
        return {
          ...state,
          ...toggle,
        }
      })
    }
  }, [accountStatus])

  return {
    toggle: newToggle,
    updateToggleStatus: React.useCallback(
      () => dispatch(updateToggleStatus(undefined)),
      [dispatch],
    ),
  }
}
