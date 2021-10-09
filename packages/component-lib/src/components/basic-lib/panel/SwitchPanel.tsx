import { WithTranslation } from "react-i18next";
import SwipeableViews, { SwipeableViewsProps } from 'react-swipeable-views';

import React, { RefAttributes } from 'react';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { Grid, Toolbar } from '@mui/material';
import { boxLiner, toolBarPanel } from '../../styled';


export type PanelContent<T extends string> = {
    key: T,
    element: React.ElementType<any> | JSX.Element,
    toolBarItem:  React.ElementType<any> | JSX.Element | undefined,
}
export type SwitchPanelProps<T extends string> = {
    // swipedBy: T,
    index: number,
    // defaultIndex: number,
    panelList: Array<PanelContent<T>>,
    size?: string,
    // onChangeIndex?: (index: number,data:any) => void,
    // onTransitionEnd?: () => void,
    _height?: number | string;
    _width?: number | string;

}

// height: ${_height ? typeof _height === 'number' ?
//           `calc(${_height + 'px'}  - 2 * var(--toolbar-row-padding) )`
//           : `calc(${_height}  - 2 * var(--toolbar-row-padding) )` : 'auto'};
export const SwipeableViewsStyled = styled(SwipeableViews)<SwipeableViewsProps & { _height?: number | string, _width?: number | string; }>`
  position: relative;
  ${({_height, _width}) => `       
    width: ${typeof _width === 'string' ? _width : typeof _width === 'number' ? _width + 'px' : `var(--swap-box-width)`};   
    height: ${typeof _height === 'string' ? _height : typeof _height === 'number' ? _height + 'px' : `var(--swap-box-height)`};         
  `}
  ${({theme}) => toolBarPanel({theme})}
  border-radius: ${({theme}) => theme.unit}px;
  .react-swipeable-view-container {
    height: 100%;
    & > div {
      .container{
        flex:1;
      }
      ${({theme}) => boxLiner({theme})}
      display: flex;
      flex-direction: column;
      flex-wrap: wrap;
      align-content: stretch;
      align-items: stretch;
      .MuiToolbar-root{
        align-items: flex-end;
        display: flex;
        justify-content: space-between;
      }
    }
 
  }
` as React.ElementType<SwipeableViewsProps & { _height?: number | string, _width?: number | string; }>;

function _SwitchPanel<T extends string>({
                                            index,
                                            panelList,
                                            _height,
                                            _width,
                                            size
                                            // ...rest
                                        }: SwitchPanelProps<T> & WithTranslation, _ref: React.ForwardedRef<any>) {
    const theme = useTheme();
    return <SwipeableViewsStyled className={'trade-panel'} axis={theme.direction === 'rtl' ? 'x-reverse' : 'x'}
                                 index={index}  {...{_height,_width}}>
        {panelList.map((panel: PanelContent<T>) => {
            return <Grid container key={panel.key} className={'container'} direction={'column'}
                         justifyContent={"space-between"} flexWrap={'nowrap'}
                         paddingTop={'var(--toolbar-row-padding)'}
                         paddingBottom={3}>
                {panel.toolBarItem ? <Toolbar className={size} variant={'dense'}>
                    {panel.toolBarItem}
                </Toolbar>:<></>}
                <Grid item flex={1}>{panel.element}</Grid>
            </Grid>;
        })}
    </SwipeableViewsStyled>;
}
export const SwitchPanel = React.memo(React.forwardRef(_SwitchPanel)) as <T extends string>(props: SwitchPanelProps<T> & WithTranslation & RefAttributes<any>) => JSX.Element;
