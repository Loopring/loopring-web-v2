import {
    Box,
    Button as MuButton,
    IconButton,
    ToggleButton,
    ToggleButtonGroup as MuToggleButtonGroup,
} from "@material-ui/core";
import { ButtonProps, TGItemJSXInterface, ToggleButtonGroupProps } from './Interface';
import { WithTranslation } from "react-i18next";
import styled from "@emotion/styled";
import loadingSvg from 'common-resources/assets/svg/loading.svg'
import { CloseIcon } from '../../../static-resource';

export const Button = styled(MuButton)<ButtonProps>`
  && {
    &.MuiButton-root.Mui-disabled {
      ${({loading, theme}) => {
    return loading === 'true' ? `
           color:transparent;
           background:${theme.colorBase.primaryDark};
           &::after{
            display: block;
            content: url(${loadingSvg});
            height: 40px;
            width: 40px;
            position: absolute;
            transform:scale(.55);
            display:flex;
            flex-direction:row;
            align-items: center;
            justify-content: center;
            color:#fff  
           }
       ` : ''
}
}
    }
  }
` as React.ComponentType<ButtonProps>;

export const ToggleButtonGroup = ({
                                      t,
                                      value,
                                      setValue,
                                      handleChange,
                                      size = 'medium',
                                      tgItemJSXs,
                                      data,
                                      exclusive,
                                      onChange
                                  }: WithTranslation & ToggleButtonGroupProps) => {
    if (setValue) {
        handleChange = (_e: React.MouseEvent<HTMLElement, MouseEvent>, value: any) => {
            setValue(value)
            if (onChange) {
                onChange(_e, value)
            }
        }
    }
    if (data) {
        tgItemJSXs = data.map(({value, key, disabled}) => {
            return {value, JSX: t(key), tlabel: t(key), disabled}
        })
    }
    return <MuToggleButtonGroup size={size} value={value} exclusive={exclusive} onChange={handleChange}>
        {tgItemJSXs?.map(({value, JSX, tlabel, disabled, key}: TGItemJSXInterface) =>
            <ToggleButton key={key ? key : value} value={value}
                          aria-label={tlabel}
                          disabled={disabled}>{JSX}</ToggleButton>)}
    </MuToggleButtonGroup>;

}

export const ModalCloseButton = ({onClose, t}: {
    onClose?: {
        bivarianceHack(event: {}, reason: 'backdropClick' | 'escapeKeyDown'): void;
    }['bivarianceHack']
} & WithTranslation) => {
    return <Box alignSelf={'flex-end'} marginTop={-2} marginRight={1}>
        <IconButton aria-label={t('labelClose')} size={'small'} onClick={(event) => {
            onClose && onClose(event, 'escapeKeyDown')
        }}>
            <CloseIcon/>
        </IconButton>
    </Box>
}




