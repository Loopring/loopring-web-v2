import {
    Box,
    Button as MuButton,
    IconButton,
    ToggleButton,
    ToggleButtonGroup as MuToggleButtonGroup,
} from '@mui/material';
import { ButtonProps, TGItemJSXInterface, ToggleButtonGroupProps } from './Interface';
import { TFunction, WithTranslation } from "react-i18next";
import styled from "@emotion/styled";
import loadingSvg from '@loopring-web/common-resources/assets/svg/loading.svg'
import { BackIcon, CloseIcon, QRIcon } from '@loopring-web/common-resources';
import { Link } from '@mui/material';
import React from 'react';

export const Button = styled(MuButton)<ButtonProps>`
  && {
    &.MuiButton-root.Mui-disabled {
      ${({loading, theme}) => {
        return loading === 'true' ? `
           color:transparent;
           background:${theme.colorBase.primary};
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


// export const MuiToggleButtonGroup = ({colorBase}: any) => {
//     return {
//         styleOverrides: {
//             root: {
//                 backgroundColor: colorBase.borderDark,
//                 padding: pxToRem(4),
//                 paddingRight: pxToRem(2),
//
//             }
//         }
//     }
// }

const MuToggleButtonGroupStyle = styled(MuToggleButtonGroup)`
  ${({theme,size}) => size!=='small'?`
      background: var(--color-box);
      padding: ${theme.unit/2}px;
      padding-right: ${theme.unit/4}px;
      box-shadow: var(--shadow3);
  `:``};
  .MuiToggleButton-sizeSmall {
    background: var(--color-box);
    height: 2.4rem;
    font-size: 1.2rem;
    margin-right: ${({theme}) => theme.unit}px;
    border: ${({theme}) => theme.border.borderConfig({c_key: 'var(--color-border)'})};
    color: var(--color-text-secondary);
    &:not(:first-of-type), &:not(:last-child) {
      border-color: var(--color-border)
    }

    &:hover {
      //backgroundColor: var(--color-box);
      // color: var(--color-primary);
      color: var(--color-text-button-select);
      // border: ${({theme}) => theme.border.borderConfig({c_key: 'var(--color-primary)'})};
      border: ${({theme}) => theme.border.borderConfig({c_key: 'var(--color-border-hover)'})};
      background: var(--color-box);
      // &:not(:last-child), &:not(:first-of-type) {
      //   border: ${({theme}) => theme.border.borderConfig({c_key: 'var(--color-primary)'})};
      // }

      &.Mui-selected, &.Mui-selected {
        //background: var(--opacity);
        background: var(--color-box);
        // color: var(--color-primary);
        color: var(--color-text-button-select);
        // border: ${({theme}) => theme.border.borderConfig({c_key: 'var(--color-primary)'})};
        border: ${({theme}) => theme.border.borderConfig({c_key: 'var(--color-border-hover)'})};
      }
    }

    &.Mui-disabled {
      //background ;
      background: var(--opacity);
      color: var(--color-disable);
      border: 1px dashed var(--color-border);
    }

    &.Mui-selected, &.Mui-selected + &.Mui-selected {
      // color: var(--color-primary);
      color: var(--color-text-button-select)  !important;
      background: var(--color-box) !important;
      //background:  var(--color-disable);
      // border: ${({theme}) => theme.border.borderConfig({c_key: 'var(--color-primary)'})}
      border: ${({theme}) => theme.border.borderConfig({c_key: 'var(--color-border-hover)'})}

    }
  }

` as typeof MuToggleButtonGroup


export const ToggleButtonGroup = ({
                                      t,
                                      value,
                                      // handleChange,
                                      size = 'medium',
                                      tgItemJSXs,
                                      data,
                                      exclusive,
                                      onChange
                                  }: { t:TFunction } & ToggleButtonGroupProps) => {

    const _handleChange = React.useCallback((_e: React.MouseEvent<HTMLElement, MouseEvent>, value: any) => {
        // setValue(value)
        if (onChange) {
            onChange(_e, value)
        }
    }, [])
    if (data) {
        tgItemJSXs = data.map(({value, key, disabled}) => {
            return {value, JSX: t(key), tlabel: t(key), disabled}
        })
    }
    return <MuToggleButtonGroupStyle size={size} value={value} exclusive={exclusive} onChange={_handleChange}>
        {tgItemJSXs?.map(({value, JSX, tlabel, disabled, key, notWrap}: TGItemJSXInterface) =>
            notWrap?<React.Fragment  key={key ? key : value} >{JSX}</React.Fragment>:
            <ToggleButton key={key ? key : value} value={value}
                          aria-label={tlabel}
                          disabled={disabled}>{JSX}</ToggleButton>)}
    </MuToggleButtonGroupStyle>;

}

export const ModalCloseButton = ({onClose, t}: {
    onClose?: {
        bivarianceHack(event: {}, reason: 'backdropClick' | 'escapeKeyDown'): void;
    }['bivarianceHack']
} & WithTranslation) => {
    return <Box className={'close-button'} alignSelf={'flex-end'} position={'absolute'} zIndex={99} marginTop={'-28px'}
                marginRight={'12px'}>
        <IconButton aria-label={t('labelClose')}
                    color={'inherit'} size={'medium'} onClick={(event) => {
            onClose && onClose(event, 'escapeKeyDown')
        }}>
            <CloseIcon/>
        </IconButton>
    </Box>
}
export const ModalBackButton = ({onBack, t}: {
    onBack?: () => void
} & WithTranslation) => {
    return <Box alignSelf={'flex-start'} marginTop={-3} marginLeft={1.5}>
        <IconButton size={'medium'} color={'inherit'} aria-label={t('labelBack')} onClick={() => {
            onBack && onBack()
        }}>
            <BackIcon/>
        </IconButton>
    </Box>
}
const QRStyle = styled(Box)`
  .MuiButtonBase-root{
    position:relative;
    //z-index: 10;
  }
    &:after{
      pointer-events: none;
      content: '';
      position: absolute;
      display: block;
      height: 48px;
      width: 48px;
      top:-2px;
      left:-2px;
      //z-index: -1;
      background-image:${({theme})=> {
        if(theme.mode === 'dark') {
          return  `url('./static/images/qr_code_dark.png')`;
        }else{
          return `url('./static/images/qr_code_light.png')`;
        }
      }};
    }
` as typeof Box
export const QRButtonStyle = ({onQRClick, t}: {
    onQRClick?: () => void
} & WithTranslation) => {
    return <QRStyle alignSelf={'flex-start'} marginTop={-1 / 2 * 7} marginLeft={1.5} position={'absolute'}>
        <IconButton  aria-label={t('labelBack')} size={'medium'} onClick={() => {
            onQRClick && onQRClick()
        }}>
            <QRIcon htmlColor={'var(--color-text-third)'}/>
        </IconButton>
    </QRStyle>
}
export const LinkActionStyle = styled(Link)`
  text-decoration: underline dotted;
  color: inherit;
` as typeof Link



