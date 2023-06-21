import { DepositProps } from '../Interface'
import { VendorMenuProps } from '../../modal'

export enum DepositPanelType {
  Deposit = 0,
  ThirdPart = 1,
}

export type DepositGroupProps<T, I> = {
  depositProps: DepositProps<T, I>
  vendorMenuProps: VendorMenuProps
  tabIndex?: DepositPanelType
  // onTabChange: (value: DepositPanelType) => void;
}
