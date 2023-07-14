import { MuToggleButtonGroupStyle } from '../../../basic-lib'
import { ToggleButton } from '@mui/material'
import { FeeInfo } from '@loopring-web/common-resources'

export const FeeToggle = <C extends FeeInfo>({
  chargeFeeTokenList,
  handleToggleChange,
  feeInfo,
  disableNoToken = false,
}: {
  chargeFeeTokenList: Array<C>
  handleToggleChange: (value: C) => void
  feeInfo: C
  disableNoToken?: boolean
}) => {
  return (
    <MuToggleButtonGroupStyle
      size={'small'}
      value={chargeFeeTokenList.findIndex((ele) => feeInfo?.belong === ele.belong)}
      exclusive
      onChange={(_e, value: number) => {
        handleToggleChange(chargeFeeTokenList[value])
      }}
    >
      {chargeFeeTokenList?.map((feeInfo, index) => (
        <ToggleButton
          key={feeInfo.belong + index}
          value={index}
          aria-label={feeInfo.belong}
          disabled={disableNoToken && !feeInfo.hasToken}
        >
          {feeInfo.belong}
        </ToggleButton>
      ))}
    </MuToggleButtonGroupStyle>
  )
}
