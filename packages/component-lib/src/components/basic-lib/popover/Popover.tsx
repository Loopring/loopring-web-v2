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
        overflow: visible;
        box-shadow: var(--shadow);
        border-radius: ${({theme}) => theme.unit * 0.5}px;
        &:before {
          position: absolute;
          top: ${({theme}) => theme.unit * -1}px;
          content: '';
          display: block;
          width: 0;
          height: 0;
          border: ${({theme}) => theme.unit * 0.5}px solid transparent;
          border-bottom: ${({theme}) => theme.unit * 0.5}px solid var(--color-pop-bg);
        }
      }
    }

    &.arrow-center .MuiPopover-paper {
      &:before {
        left: 50%;
        transform: translateX(-50%);
      }
    }

    &.arrow-right .MuiPopover-paper {
      &:before {
        right: ${({theme}) => theme.unit}px;
      }
    }

    &.arrow-left .MuiPopover-paper {
      &:before {
        left: ${({theme}) => theme.unit}px;
      }
    }
  }


` as React.ElementType<PopoverProps>

// export const PopoverPure = ({anchorOrigin,className,children,...rest}:PopoverProps)=>{
//     return  <PopoverStyled {...{...rest}} className={clsx(className,` arrow-${anchorOrigin?.horizontal}`)} >{children}</PopoverStyled>
// }