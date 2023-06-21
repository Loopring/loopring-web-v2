import { VendorProviders } from '../constant/vendor'
import { TradeBtnStatus } from '../constant'

export interface VendorItem {
  key: VendorProviders
  svgIcon: string
  flag?: {
    startDate: number
    endDate: number
    tag?: string
    highLight?: string
  }
  btnStatus?: TradeBtnStatus
  handleSelect?: (event?: React.MouseEvent) => void
}
