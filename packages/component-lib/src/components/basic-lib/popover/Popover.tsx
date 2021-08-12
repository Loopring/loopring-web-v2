import React from 'react';
import styled from "@emotion/styled";
import { Popover as MuiPopover, PopoverOrigin, PopoverProps } from '@material-ui/core'
import { PopoverWrapProps } from './Interface';
import { bindHover, bindMenu, bindPopover, bindTrigger, usePopupState } from 'material-ui-popup-state/hooks';
import HoverMenu from 'material-ui-popup-state/HoverMenu';
import HoverPopover from 'material-ui-popup-state/HoverPopover';

const DEFAULT_ANCHOR_ORIGIN: PopoverOrigin = {
    vertical: 'bottom',
    horizontal: 'left',
}

const DEFAULT_TRANSFORM_ORIGIN: PopoverOrigin = {
    vertical: 'top',
    horizontal: 'left',
}
const POPOVER_TOP = 8;


export const Popover: React.FC<PopoverWrapProps> = ({
                                                        type,
                                                        popupId,
                                                        children,
                                                        popoverContent,
                                                        popoverStyle,
                                                        anchorOrigin = DEFAULT_ANCHOR_ORIGIN,
                                                        transformOrigin = DEFAULT_TRANSFORM_ORIGIN,
                                                        popoverTop = POPOVER_TOP,
                                                        arrowHorizon = {
                                                            left: 10,
                                                        },
                                                        handleStateChange
                                                    }) => {
    const arrowLeft = arrowHorizon?.left
    const arrowRight = arrowHorizon?.right
    const popupState = usePopupState({variant: 'popover', popupId})
    const {isOpen} = popupState

    React.useEffect(() => {
        if (handleStateChange) {
            handleStateChange(isOpen)
        }
    }, [handleStateChange, isOpen])

    const RenderPopover = styled.div`
      .arrowPopover {
        position: absolute;
        top: -16px;
        right: ${() => arrowRight ? `${arrowRight}px` : undefined};
        left: ${() => arrowLeft ? `${arrowLeft}px` : undefined};
        width: 0;
        height: 0;
        border-top: 8px solid transparent;
        border-right: 8px solid transparent;
        border-bottom: ${({theme}) => `8px solid ${theme.colorBase.borderHover}`};
        // border-bottom: 8px solid transparent;;
        border-left: 8px solid transparent;
      }
    `
    const isHover = type === 'hover'
    const bindAction = isHover ? bindHover(popupState) : bindTrigger(popupState)
    const bindContent = isHover ? bindMenu(popupState) : bindPopover(popupState)
    const CustomPopover = isHover ? HoverMenu : MuiPopover

    const getRenderChild = React.useCallback((popoverChildren: React.ReactNode) => {
        if (React.isValidElement(popoverChildren)) {
            return React.Children.map(popoverChildren, (child) => React.cloneElement(child, {
                    ...bindAction,
                })
            )
        }
        throw new Error('Invalid popover element!')
    }, [bindAction])

    return <>
        {getRenderChild(children)}
        <CustomPopover
            {...bindContent}
            anchorReference='anchorEl'
            anchorOrigin={anchorOrigin}
            transformOrigin={transformOrigin}
            sx={{
                '.MuiPopover-paper': {
                    display: popoverContent ? 'block' : 'none',
                    overflow: 'unset',
                    marginTop: `${popoverTop}px`,
                }
            }}
        >
            <RenderPopover style={popoverStyle}>
                <div className="arrowPopover"/>
                {popoverContent}
            </RenderPopover>
        </CustomPopover>
    </>
}

// export interface PopoverOrigin {
//     vertical: 'top' | 'center' | 'bottom' | number;
//     horizontal: 'left' | 'center' | 'right' | number;
// }

// background-color: ${({theme}) => theme.colorBase.background().secondary};

export const PopoverPure = styled(HoverPopover)<PopoverProps>`
  &.MuiModal-root {
    .MuiBackdrop-root {
      background-color: inherit;
    }

    &.arrow-center,
    &.arrow-right,
    &.arrow-left,
    &.arrow-left {
      .MuiPopover-paper {
        ${({theme}) => theme.border.defaultFrame({d_W: 1, d_R: 1 / 2, c_key: 'var(--color-border-hover)'})};
        margin-top: ${({theme}) => theme.unit * 2}px;
        overflow: visible;

        &:before {
          position: absolute;
          content: '';
          display: block;
          position: absolute;
          ${({theme}) => theme.border.defaultFrame({d_W: 1, d_R: 1 / 2, c_key: 'var(--color-border)'})};
          border-bottom: 0;
          border-right: 0;
          width: 8px;
          height: 8px;
          background: var(--color-border-hover);

        }
      }
    }

    &.arrow-center .MuiPopover-paper {
      &:before {
        // transform: rotate(45deg) translateX(-50%) rotate(45deg);
        // top: -5px;
        // left: 50%;
        content: '';
        // display: block;
        position: absolute;
        top: -5px;
        transform: translateX(-50%);
        left: 50%;
        border-top: 1px solid ${({theme}) => theme.colorBase.border};
        border-left: 1px solid ${({theme}) => theme.colorBase.border};
        // border-image-slice: 12 20 15 20 fill;
        // border-image-width: 12px 0px 0px 0px;
        // border-image-repeat: round;
        // border-image-source: url("./static/images/modalBg.png");
        width: 8px;
        height: 8px;
        background-color: ${({theme}) => theme.colorBase.borderHover};
        transform: rotate(45deg);
      }
    }

    &.arrow-right .MuiPopover-paper {
      // &:before {
      //   transform: rotate(45deg) translateX(-50%) rotate(45deg);
      //   top: -5px;
      //   left: 50%;
      margin-top: 12px;
      overflow: visible;
      border: 1px solid rgba(235, 235, 235, 0.1);

      &:before {
        content: '';
        display: block;
        position: absolute;
        top: -5px;
        transform: translateX(-50%);
        right: 10%;
        border-top: 1px solid ${({theme}) => theme.colorBase.border};
        border-left: 1px solid ${({theme}) => theme.colorBase.border};
        width: 8px;
        height: 8px;
        background-color: ${({theme}) => theme.colorBase.borderHover};
        transform: rotate(45deg);
      }
    }

    &.arrow-left .MuiPopover-paper {

      // &:before {

      //   transform: translateX(-50%);
      //   top: -5px;
      //   left: 10%;

      margin-top: 12px;
      overflow: visible;
      border: 1px solid rgba(235, 235, 235, 0.1);

      &:before {
        content: '';
        display: block;
        position: absolute;
        transform: translateX(-50%);
        top: -5px;
        left: 10%;
        border-top: 1px solid ${({theme}) => theme.colorBase.border};
        border-left: 1px solid ${({theme}) => theme.colorBase.border};
        width: 8px;
        height: 8px;
        background-color: ${({theme}) => theme.colorBase.borderHover};
        transform: rotate(45deg);
      }
    }
  }


` as React.ElementType<PopoverProps>

// export const PopoverPure = ({anchorOrigin,className,children,...rest}:PopoverProps)=>{
//     return  <PopoverStyled {...{...rest}} className={clsx(className,` arrow-${anchorOrigin?.horizontal}`)} >{children}</PopoverStyled>
// }