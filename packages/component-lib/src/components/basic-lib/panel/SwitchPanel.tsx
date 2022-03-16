import { WithTranslation } from "react-i18next";
import SwipeableViews, { SwipeableViewsProps } from "react-swipeable-views";

import React, { RefAttributes } from "react";
import { useTheme } from "@emotion/react";
import styled from "@emotion/styled";
import { Box, Toolbar } from "@mui/material";
import { boxLiner, toolBarPanel } from "../../styled";
import { useSettings } from "../../../stores";

export type PanelContent<T extends string> = {
  key: T;
  element: React.ElementType<any> | JSX.Element;
  toolBarItem: React.ElementType<any> | JSX.Element | undefined;
};
export type SwitchPanelProps<T extends string> = {
  // swipedBy: T,
  index: number;
  // defaultIndex: number,
  panelList: Array<PanelContent<T>>;
  size?: string;
  className?: string;
  // onChangeIndex?: (index: number,data:any) => void,
  // onTransitionEnd?: () => void,
  _height?: number | string;
  _width?: number | string;
};

// height: ${_height ? typeof _height === 'number' ?
//           `calc(${_height + 'px'}  - 2 * var(--toolbar-row-padding) )`
//           : `calc(${_height}  - 2 * var(--toolbar-row-padding) )` : 'auto'};
// ${({_height, _width}) => `
//   width: ${typeof _width === 'string' ? _width : typeof _width === 'number' ? _width + 'px' : `var(--swap-box-width)`};
//   height: ${typeof _height === 'string' ? _height : typeof _height === 'number' ? _height + 'px' : `var(--swap-box-height)`};
// `}
export const SwipeableViewsStyled = styled(SwipeableViews)<
  SwipeableViewsProps & {
    _height?: number | string;
    _width?: number | string;
    isMobile?: boolean | undefined;
  }
>`
  position: relative;
  flex: 1;
  ${({ _height, _width, isMobile }) => ` 
    height: ${
      typeof _height === "string"
        ? _height
        : typeof _height === "number"
        ? _height + "px"
        : `var(--swap-box-height)`
    };     
    ${
      isMobile
        ? ``
        : `   
      width: ${
        typeof _width === "string"
          ? _width
          : typeof _width === "number"
          ? _width + "px"
          : `var(--swap-box-width)`
      };`
    }  
         
  `}
  ${({ theme }) => toolBarPanel({ theme })}
  border-radius: ${({ theme }) => theme.unit}px;
  .react-swipeable-view-container {
    height: 100%;
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
` as React.ElementType<
  SwipeableViewsProps & {
    _height?: number | string;
    _width?: number | string;
    isMobile?: boolean | undefined;
  }
>;

function _SwitchPanel<T extends string>(
  {
    index,
    className,
    panelList,
    // _height,
    // _width,
    size,
    ...rest
  }: // ...rest
  SwitchPanelProps<T> & WithTranslation,
  _ref: React.ForwardedRef<any>
) {
  //   {/*{...{ _height, _width }}*/}
  const { isMobile } = useSettings();
  const theme = useTheme();
  const hasToolBar = panelList.find((item) => item.toolBarItem !== undefined);
  return (
    <SwipeableViewsStyled
      className={hasToolBar ? `${className}` : `noToolBar ${className}`}
      axis={theme.direction === "rtl" ? "x-reverse" : "x"}
      index={index}
      {...{ ...rest, isMobile }}
    >
      {panelList.map((panel: PanelContent<T>) => {
        return (
          <Box
            display={"flex"}
            className={"container"}
            flexDirection={"column"}
            key={panel.key}
            justifyContent={"space-between"}
            flexWrap={"nowrap"}
            paddingTop={hasToolBar && "var(--toolbar-row-padding)"}
            paddingBottom={3}
          >
            {panel.toolBarItem ? (
              <Toolbar className={size} variant={"dense"}>
                {panel.toolBarItem}
              </Toolbar>
            ) : (
              <></>
            )}
            <Box flex={1}>{panel.element}</Box>
          </Box>
        );
      })}
    </SwipeableViewsStyled>
  );
}
export const SwitchPanel = React.memo(React.forwardRef(_SwitchPanel)) as <
  T extends string
>(
  props: SwitchPanelProps<T> & WithTranslation & RefAttributes<any>
) => JSX.Element;
