import { store } from '../../index'
import { setSlippage } from '@loopring-web/component-lib'

type Cache = {
  customSlippage?: number
}
export const makeCache = (__cache__: Cache) => {
  if (typeof __cache__.customSlippage !== undefined) {
    store.dispatch(setSlippage(__cache__.customSlippage as number))
  }
}
