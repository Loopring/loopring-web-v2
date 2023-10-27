import { IsMobile } from "@loopring-web/common-resources"

export const RowEarnConfig = {
  rowHeight: IsMobile.any() ? 48 : 88,
  rowHeaderHeight: IsMobile.any() ? 48 : 44,
  minHeight: 350
}