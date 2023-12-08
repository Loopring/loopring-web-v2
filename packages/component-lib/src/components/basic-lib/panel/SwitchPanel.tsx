import { WithTranslation } from 'react-i18next'
import SwipeableViews, { SwipeableViewsProps } from 'react-swipeable-views'

import React, { RefAttributes } from 'react'
import { useTheme } from '@emotion/react'
import styled from '@emotion/styled'
import { Box, Toolbar } from '@mui/material'
import { boxLiner, toolBarPanel } from '../../styled'
import { useSettings } from '../../../stores'
import { PanelContent, SwitchPanelProps } from './Interface'

export const SwipeableViewsStyled = styled(SwipeableViews)<
  SwipeableViewsProps & {
    _height?: number | string
    _width?: number | string
    ismobile?: 'true' | 'false'
    scroolDisabled?: boolean
  }
>`
  overflow: ${({ scroolDisabled }) => (scroolDisabled ? 'hidden' : 'scroll')};
  position: relative;
  flex: 1;
  ${({ _height, _width, ismobile }) => ` 
    height: ${
      typeof _height === 'string'
        ? _height
        : typeof _height === 'number'
        ? _height + 'px'
        : `var(--swap-box-height)`
    };     
    ${
      ismobile === 'true'
        ? ``
        : `   
      width: ${
        typeof _width === 'string'
          ? _width
          : typeof _width === 'number'
          ? _width + 'px'
          : `var(--swap-box-width)`
      };`
    }  
         
  `}
  .createRedPacket & {
    width: 100%;

    ${({ ismobile }) => `${ismobile === 'true' ? 'width:380px;' : ''}`}
    .container {
      & > div {
        width: 100%;
        flex: 1;
        display: flex;
        justify-content: center;

        .redPacket {
          justify-content: center;
        }

        .menu-panel {
          max-width: 760px;
          padding: 0 ${({ theme, ismobile }) => (ismobile === 'true' ? 2 : 10) * theme.unit}px;
          padding-top: ${({ theme }) => 2 * theme.unit}px;
        }
      }
    }
  }

  ${({ theme }) => toolBarPanel({ theme })}
  border-radius: ${({ theme }) => theme.unit}px;

  .react-swipeable-view-container {
    height: auto;

    & > div {
      .container {
        flex: 1;

        .coinInput-wrap,
        .btnInput-wrap,
        .MuiOutlinedInput-root {
          background: var(--field-opacity);
          border-color: var(--opacity);
          :hover {
            border-color: var(--color-border-hover);
          }
        }
      }
      display: flex;
      flex-direction: column;
      flex-wrap: wrap;
      align-content: stretch;
      align-items: stretch;
    }
  }
  &.noToolBar {
    .react-swipeable-view-container > div {
      & > .MuiGrid-container {
        padding-top: 0;
        //margin-top: ;
        margin-bottom: calc(var(--toolbar-row-padding) / 2);
        padding: 0 calc(var(--toolbar-row-padding) / 2);
      }
      //margin-top: calc(var(--toolbar-row-padding) * -1);
    }
  }
  &.hasLinerBg {
    .react-swipeable-view-container > div {
      ${({ theme }) => boxLiner({ theme })}
    }
  }
  .MuiToolbar-root {
    align-items: flex-end;
    display: flex;
    justify-content: space-between;
    padding: 0 ${({ theme }) => (theme.unit * 5) / 2}px;
  }
  &.vaultSwap {
    height: auto;
    .react-swipeable-view-container > div {
      border: none;
    }
  }
  &.vaultBorrow {
    .menu-panel {
      .MuiListItemText-root {
        .MuiListItemText-secondary {
          visibility: hidden;
        }
      }
    }
  }
` as (
  props: SwipeableViewsProps & {
    _height?: number | string
    _width?: number | string
    ismobile?: boolean | undefined | string
    scroolDisabled?: boolean
  },
) => JSX.Element

function _SwitchPanel<T extends string>(
  {
    index,
    className,
    panelList,
    // _height,
    // _width,
    size,
    scrollDisabled,
    ...rest
  }: SwitchPanelProps<T> & WithTranslation,
  _ref: React.ForwardedRef<any>,
) {
  //   {/*{...{ _height, _width }}*/}
  const { isMobile } = useSettings()
  const theme = useTheme()
  const hasToolBar = panelList.find((item) => item.toolBarItem !== undefined)
  const ref = React.useRef<any>(null)
  React.useEffect(() => {
    ref.current && ref.current.rootNode.scrollTo(0, 0)
  }, [index])
  return (
    <SwipeableViewsStyled
      className={
        hasToolBar ? `${className ? className : ''}` : `noToolBar ${className ? className : ''}`
      }
      ref={ref}
      axis={theme.direction === 'rtl' ? 'x-reverse' : 'x'}
      index={index}
      _height={rest._height}
      _width={rest._width}
      ismobile={isMobile ? 'true' : 'false'}
      scroolDisabled={scrollDisabled}
    >
      {panelList.map((panel: PanelContent<T>, _index) => {
        return (
          <Box
            display={'flex'}
            className={'container'}
            flexDirection={'column'}
            key={panel.key}
            justifyContent={'space-between'}
            flexWrap={'nowrap'}
            paddingTop={hasToolBar && 'var(--toolbar-row-padding)'}
            paddingBottom={3}
          >
            {panel.toolBarItem ? (
              <Toolbar className={size} variant={'dense'}>
                {panel.toolBarItem}
              </Toolbar>
            ) : (
              <></>
            )}
            <Box flex={1}>{panel.element}</Box>
          </Box>
        )
      })}
    </SwipeableViewsStyled>
  )
}

export const SwitchPanel = React.memo(React.forwardRef(_SwitchPanel)) as <T extends string>(
  props: SwitchPanelProps<T> & WithTranslation & RefAttributes<any>,
) => JSX.Element
