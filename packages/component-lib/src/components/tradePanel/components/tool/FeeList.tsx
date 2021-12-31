import { MuToggleButtonGroupStyle } from "../../../basic-lib";
import { ToggleButton } from "@mui/material";
import { FeeInfo } from "@loopring-web/common-resources";

export const FeeToggle = <C extends FeeInfo>({
  chargeFeeTokenList,
  handleToggleChange,
  feeInfo,
}: {
  chargeFeeTokenList: Array<C>;
  handleToggleChange: (value: C) => void;
  feeInfo: C;
}) => {
  return (
    <MuToggleButtonGroupStyle
      size={"small"}
      value={feeInfo}
      exclusive
      onChange={(_e, value: C) => {
        handleToggleChange(value);
      }}
    >
      {chargeFeeTokenList?.map((feeInfo, index) => (
        <ToggleButton
          key={feeInfo.belong + index}
          value={feeInfo}
          aria-label={feeInfo.belong}
          // disabled={disabled}
        >
          {feeInfo.belong}
        </ToggleButton>
      ))}
    </MuToggleButtonGroupStyle>
  );
};
