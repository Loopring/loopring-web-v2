import React from 'react'
import styled from '@emotion/styled'
import { Popover as MuiPopover, PopoverOrigin, PopoverProps } from '@mui/material'
import { PopoverWrapProps } from './Interface'
import {
  bindHover,
  bindMenu,
  bindPopover,
  bindTrigger,
  usePopupState,
} from 'material-ui-popup-state/hooks'
import HoverMenu from 'material-ui-popup-state/HoverMenu'
import HoverPopover from 'material-ui-popup-state/HoverPopover'

const DEFAULT_ANCHOR_ORIGIN: PopoverOrigin = {
  vertical: 'bottom',
  horizontal: 'left',
}

const DEFAULT_TRANSFORM_ORIGIN: PopoverOrigin = {
  vertical: 'top',
  horizontal: 'left',
}
// const POPOVER_TOP = 8;

export const Popover: React.FC<PopoverWrapProps> = ({
  type,
  popupId,
  className,
  children,
  popoverContent,
  anchorOrigin = DEFAULT_ANCHOR_ORIGIN,
  transformOrigin = DEFAULT_TRANSFORM_ORIGIN,
  handleStateChange,
}) => {
  const popupState = usePopupState({ variant: 'popover', popupId })
  const { isOpen } = popupState

  React.useEffect(() => {
    if (handleStateChange) {
      handleStateChange(isOpen)
    }
  }, [handleStateChange, isOpen])

  const isHover = type === 'hover'
  const bindAction = isHover ? bindHover(popupState) : bindTrigger(popupState)
  const bindContent = isHover ? bindMenu(popupState) : bindPopover(popupState)
  const CustomPopover = isHover ? HoverMenu : MuiPopover

  const PopoverStyled = styled(CustomPopover)<PopoverProps>`
    &.MuiModal-root {
      z-index: 200;

      &.arrow-center,
      &.arrow-right,
      &.arrow-left,
      &.arrow-left,
      &.arrow-top-center {
        .MuiPopover-paper {
          background: var(--color-pop-bg);
          margin-top: ${({ theme }) => theme.unit * 1.5}px;
          margin-left: ${({ theme }) => theme.unit}px;
          overflow: visible;
          box-shadow: var(--shadow);
          border-radius: ${({ theme }) => theme.unit * 0.5}px;
          &:before {
            position: absolute;
            top: ${({ theme }) => theme.unit * -2}px;
            content: '';
            display: block;
            width: 0;
            height: 0;
            border: ${({ theme }) => theme.unit}px solid transparent;
            border-bottom: ${({ theme }) => theme.unit}px solid var(--color-pop-bg);
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
          right: ${({ theme }) => theme.unit}px;
        }
      }

      &.arrow-left .MuiPopover-paper {
        &:before {
          left: ${({ theme }) => theme.unit}px;
        }
      }
      &.arrow-top-center .MuiPopover-paper {
        &:before {
          left: 50%;
          transform: translateX(-50%) rotate(-180deg);
          bottom: ${({ theme }) => theme.unit * -2}px;
          top: initial;
        }
      }
      &.arrow-none {
        &:before {
          display: none;
        }
        &:after {
          display: none;
        }
      }
    }
  ` as (props: PopoverProps) => JSX.Element

  const getRenderChild = React.useCallback(
    (popoverChildren: React.ReactNode) => {
      if (React.isValidElement(popoverChildren)) {
        return React.Children.map(popoverChildren, (child) =>
          React.cloneElement(child, {
            ...bindAction,
          }),
        )
      }
      throw new Error('Invalid popover element!')
    },
    [bindAction],
  )

  return (
    <>
      {getRenderChild(children)}
      <PopoverStyled
        {...bindContent}
        anchorReference='anchorEl'
        anchorOrigin={anchorOrigin}
        transformOrigin={transformOrigin}
        className={className}
      >
        {popoverContent}
      </PopoverStyled>
    </>
  )
}

export const PopoverPure = styled(HoverPopover)<PopoverProps>`
  &.MuiModal-root {
    .MuiBackdrop-root {
      background-color: inherit;
    }
    &.arrow-center,
    &.arrow-right,
    &.arrow-left,
    &.arrow-left,
    &.arrow-top-right,
    &.arrow-top-center {
      .MuiPopover-paper {
        background: var(--color-pop-bg);
        overflow: visible;
        box-shadow: var(--shadow);
        border-radius: ${({ theme }) => theme.unit * 0.5}px;
        margin-top: ${({ theme }) => theme.unit}px;
        &:before {
          position: absolute;
          top: ${({ theme }) => theme.unit * -2}px;
          content: '';
          display: block;
          width: 0;
          height: 0;
          border: ${({ theme }) => theme.unit}px solid transparent;
          border-bottom: ${({ theme }) => theme.unit}px solid var(--color-pop-bg);
        }
        &:after {
          content: '';
          position: absolute;
          top: ${({ theme }) => -theme.unit}px;
          width: 100%;
          height: ${({ theme }) => theme.unit}px;
          background-color: transparent;
        }
      }
    }

    &.arrow-center .MuiPopover-paper {
      &:before {
        left: 50%;
        transform: translateX(-50%);
      }
    }

    &.no-arrow .MuiPopover-paper {
      &:before {
        display: none !important;
      }
      &:after {
        display: none !important;
      }
    }

    &.arrow-right .MuiPopover-paper {
      &:before {
        right: ${({ theme }) => theme.unit}px;
      }
    }

    &.arrow-left .MuiPopover-paper {
      &:before {
        left: ${({ theme }) => theme.unit}px;
      }
    }
    &.arrow-top-center .MuiPopover-paper {
      margin-top: ${({ theme }) => theme.unit * -0.5}px;
      &:before {
        left: 50%;
        transform: translateX(-50%) rotate(-180deg);
        bottom: ${({ theme }) => theme.unit * -2}px;
        top: initial;
      }
      &:after {
        content: '';
        position: absolute;
        top: 100%;
        width: 100%;
        height: ${({ theme }) => theme.unit}px;
        background-color: transparent;
      }
    }
    &.arrow-top-right .MuiPopover-paper {
      margin-top: ${({ theme }) => theme.unit * -0.5}px;
      &:before {
        right: ${({ theme }) => theme.unit}px;
        transform: translateX(-50%) rotate(-180deg);
        bottom: ${({ theme }) => theme.unit * -2}px;
        top: initial;
      }
      &:after {
        content: '';
        position: absolute;
        top: 100%;
        width: 100%;
        height: ${({ theme }) => theme.unit}px;
        background-color: transparent;
      }
    }
  }
` as (props: PopoverProps) => JSX.Element
