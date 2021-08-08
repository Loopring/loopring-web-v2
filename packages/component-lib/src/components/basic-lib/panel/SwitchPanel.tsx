import { WithTranslation } from "react-i18next";
import SwipeableViews, { SwipeableViewsProps } from 'react-swipeable-views';

import React, { RefAttributes } from 'react';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { Grid, Toolbar } from "@material-ui/core";


export type PanelContent<T extends string> = {
    key: T,
    element: () => React.ElementType<any> | JSX.Element,
    toolBarItem: () => React.ElementType<any> | JSX.Element,
}
export type SwitchPanelProps<T extends string> = {
    // swipedBy: T,
    index: number,
    // defaultIndex: number,
    panelList: Array<PanelContent<T>>,
    // onChangeIndex?: (index: number,data:any) => void,
    // onTransitionEnd?: () => void,
    _height?: number | string;
    _width?: number | string;

}
//${({theme}) => theme.border.defaultFrame({c_key: 'blur', d_R: 1})};
//
//
//     .container{
//        // overflow:hidden;
//        padding:0;
//        flex:1;
//        padding:0 ${theme.unit * 3 + 'px'};
//     }
// }
export const SwipeableViewsStyled = styled(SwipeableViews)<SwipeableViewsProps & { _height?: number | string, _width?: number | string }>`
  ${({_height, _width, theme}) => `       
       width: ${typeof _width === 'string' ? _width : typeof _width === 'number' ? _width + 'px' : `var(--swap-box-width)`};   
       height: ${typeof _height === 'string' ? _height : typeof _height === 'number' ? _height + 'px' : `var(--swap-box-height)`}; 
       .react-swipeable-view-container {
         & > div {
              background: ${theme.colorBase.background().swap}; 
         }       
       } 
     
  `};
  border-radius: ${({theme}) => theme.unit}px;

  .react-swipeable-view-container {

    height: 100%;

    & > div {
      display: flex;
      flex-direction: column;
      flex-wrap: wrap;
      align-content: stretch;
      align-items: stretch;
    }
  }

  .MuiToolbar-root {
    align-content: stretch;
    justify-content: flex-end;
    padding: 0 ${({theme}) => theme.unit / 2 * 5}px ${({theme}) => theme.unit / 2}px;
    box-sizing: border-box;
    height: var(--toolbar-row-height);
    min-height: var(--toolbar-row-height);
    max-height: var(--toolbar-row-height);

    .MuiIconButton-root {
      height: var(--btn-icon-size);
      width: var(--btn-icon-size);
      min-width: var(--btn-icon-size);
      margin: 0;
      display: flex;
      padding: 0;
      justify-content: center;
      justify-items: center;
      align-items: center;
      font-size: ${({theme}) => theme.fontDefault.h4};
    }

  }
` as React.ElementType<SwipeableViewsProps & { _height?: number | string, _width?: number | string }>;

function _SwitchPanel<T extends string>({
                                            index,
                                            panelList,
                                            _height,
                                            _width,

                                            // ...rest
                                        }: SwitchPanelProps<T> & WithTranslation, _ref: React.ForwardedRef<any>) {
    const theme = useTheme();
    return <SwipeableViewsStyled className={'trade-panel'} axis={theme.direction === 'rtl' ? 'x-reverse' : 'x'}
                       index={index} {...{_height,_width}}>
        {panelList.map((panel: PanelContent<T>) => {
            return <Grid container key={panel.key} className={'container'} direction={'column'}
                         justifyContent={"start"} flexWrap={'nowrap'}>
                <Toolbar variant={'dense'}>
                    {panel.toolBarItem()}
                </Toolbar>
                <Grid item flex={1}>{panel.element()}</Grid>
            </Grid>;
        })}
    </SwipeableViewsStyled>;
}

export const SwitchPanel = React.memo(React.forwardRef(_SwitchPanel)) as <T extends string>(props: SwitchPanelProps<T> & WithTranslation & RefAttributes<any>) => JSX.Element;
