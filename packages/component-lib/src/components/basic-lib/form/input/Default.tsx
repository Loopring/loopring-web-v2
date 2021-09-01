import styled from "@emotion/styled";
import { FormControlLabel as MuFormControlLabel, TextField as MuTextField } from "@material-ui/core";

// ${({theme}) => theme.border.defaultFrame({c_key: 'blur', d_R: 1/2})};
export const FormControlLabel = styled(MuFormControlLabel)`
  && {
    padding-right: ${({theme}) => theme.unit * 2}px;
    background-color: inherit;
    border-radius: ${({theme}) => theme.unit / 2}px;
    color: var(--color-text-secondary);
  }
`
export const TextField = styled(MuTextField)`
  label + & {
    //margin-top: 24px;
    margin-top: 0;
  }

  && {
    .MuiSelect-nativeInput + svg {
      position: absolute;
      right: .4rem;
      top:  ${({theme}) => theme.unit}px;
      color: var(--color-text-secondary);
    }

    &:not(.MuiFormControl-fullWidth) {
      max-width: 260px;

    }

    text-overflow: fade();
  }

  &:focus {
    ${({theme}) => theme.border.defaultFrame({c_key: 'focus', d_R: 0.5})};
    outline: transparent;
  }
` as typeof MuTextField;
